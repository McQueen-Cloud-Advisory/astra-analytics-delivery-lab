import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readSourcePackage } from '../../src/data/source-package.mjs';
import { TARGET, REQUIRED_TABLES } from '../../src/pipeline/schemas.mjs';
import { batchIdentity, hash, LIMITS, publicationSql, publicationParams, quotaDate, safeFailure, validateCandidate, validatePublished, validateReadiness } from '../../src/pipeline/core.mjs';
import { reserveAttempt } from '../../src/pipeline/ledger.mjs';
import { findOrCreateJob, runCloudSlice, settlePriorJobs, verifyResources } from '../../src/pipeline/bigquery.mjs';
import { main, parseArguments } from '../../scripts/run-pipeline.mjs';

const fixture = new URL('../../fixtures/po/FIX-01/', import.meta.url);
const source = await readSourcePackage(fileURLToPath(fixture));
const oracle = JSON.parse(await readFile(new URL('expected.json', fixture), 'utf8'));
const fixture2 = new URL('../../fixtures/po/FIX-02/', import.meta.url);
const source2 = await readSourcePackage(fileURLToPath(fixture2));
const oracle2 = JSON.parse(await readFile(new URL('expected.json', fixture2), 'utf8'));
const transformSql = await readFile(new URL('../../sql/fix01-transform.sql', import.meta.url), 'utf8');
const readSql = await readFile(new URL('../../sql/read-published-batch.sql', import.meta.url), 'utf8');
const batchId = batchIdentity(source), transformHash = hash(transformSql);
const candidate = (input = source, expected = oracle) => ({ lines: input.lines.map(line => ({ ...line, ...expected.line_states.find(e => e.line_id === line.line_id), source_business_date: expected.business_date })),
  events: input.events.map(e => ({ ...e, ...expected.event_states.find(s => s.event_id === e.event_id && s.revision === e.revision) })), manifests: [] });
const published = (input = source, expected = oracle) => {
  const p = publicationParams(candidate(input, expected), input, batchIdentity(input), transformHash), at = '2026-09-22T03:00:00Z';
  return Object.fromEntries([['lines', p.lines_json], ['events', p.events_json], ['manifests', p.manifest_json]].map(([k, json]) => [k, JSON.parse(json).map(r => ({ ...r, published_at: at }))]));
};
const now = new Date('2026-09-22T02:10:00Z');
const readiness = () => ({ schema_version: 1, project_id: TARGET.projectId, location: TARGET.location, pipeline_service_account: TARGET.serviceAccount,
  gate5_decision_ref: 'DEC-G5-001', cloud_execution_authorized: true, billing_verified: true, runtime_identity_verified: true, controls_verified: true,
  observed_at_utc: now.toISOString(), cost_evidence_checked_at_utc: now.toISOString(), quota_date: quotaDate(now), known_project_billed_bytes_today: 0 });

test('default plan is local, pinned and explicitly unverified; broad target/mode flags rejected', async () => {
  const result = await main([]);
  assert.equal(result.mode, 'plan'); assert.equal(result.cloud_execution, 'Not Run'); assert.equal(result.batch_id, batchId);
  assert.throws(() => parseArguments(['--execute', '--plan']), /INVALID_ARGUMENTS/);
  assert.throws(() => parseArguments(['--project', 'other']), /INVALID_ARGUMENTS/);
  const correctionPlan = await main(['--input', fileURLToPath(fixture2), '--stop-before-publish']);
  assert.equal(correctionPlan.fixture, 'FIX-02'); assert.equal(correctionPlan.controlled_stop_before_publication, true);
  assert.equal(correctionPlan.retained_batch_id, batchId); assert.equal(correctionPlan.publication, 'Not Run');
  assert.throws(() => parseArguments(['--dry-run', '--stop-before-publish']), /INVALID_ARGUMENTS/);
  assert.throws(() => parseArguments(['--stop-before-publish', '--stop-before-publish']), /INVALID_ARGUMENTS/);
  await assert.rejects(main(['--stop-before-publish']), /CONTROLLED_STOP_FIX02_ONLY/);
  assert.throws(() => batchIdentity({ ...source, manifest: { ...source.manifest, fixture_or_profile: 'FIX-99' } }), /UNSUPPORTED_FIXTURE/);
});
test('existing FIX-01 business identity and executed SQL hashes remain unchanged', () => {
  assert.equal(batchId, 'fix01_5f624cd96d7420ac70f1d04569c97efa81697391353f6d455d5ec1dd1445c2cc');
  assert.equal(transformHash, '22152ebc8fd883f5185ee31305a5a7339250611957b6e8dcb441470715b104bb');
  assert.equal(hash(publicationSql), 'fec0e1cd22f119c961a3d5a0b877fc8430c22fe9922811ddd5515892b534a706');
});
test('readiness fails closed on wrong project, identity, stale costs and unknown/current quota usage', () => {
  assert.equal(validateReadiness(readiness(), now).project_id, TARGET.projectId);
  for (const change of [{ project_id: 'financial-analytics-demo' }, { pipeline_service_account: 'owner@example.com' }, { billing_verified: false },
    { cost_evidence_checked_at_utc: '2026-09-19T00:00:00Z' }, { quota_date: '2026-09-22' }, { known_project_billed_bytes_today: undefined }]) {
    assert.throws(() => validateReadiness({ ...readiness(), ...change }, now));
  }
});
test('safe diagnostics retain HTTP/reason codes and exclude raw SDK/auth messages and payloads', () => {
  const error = { code: 403, message: 'Authorization Bearer SECRET', response: { token: 'SECRET' }, errors: [{ reason: 'accessDenied', message: 'SECRET' }] };
  assert.deepEqual(safeFailure(error), { code: 'CLOUD_OPERATION_FAILED', http_status: 403, reason: 'accessDenied' });
  assert.doesNotMatch(JSON.stringify(safeFailure(error)), /SECRET|Bearer/);
});
test('all failed, dry-run and unknown attempts consume daily reservations; no fourth attempt', () => {
  const ledger = { schema_version: 1, attempts: [] };
  for (let i = 0; i < 3; i++) reserveAttempt(ledger, readiness(), i ? 'execute' : 'dry-run', batchId, now).status = 'FAIL';
  assert.throws(() => reserveAttempt(ledger, readiness(), 'execute', batchId, now), /DAILY_ATTEMPT_LIMIT/);
  assert.throws(() => reserveAttempt({ schema_version: 1, attempts: [] }, { ...readiness(), known_project_billed_bytes_today: 9 * 1024 ** 3 }, 'execute', batchId, now), /DAILY_BYTE_LIMIT/);
});
test('reconciliation checks individual line/event identities and supplier scopes, not only totals', () => {
  assert.equal(validateCandidate(candidate(), source, oracle).lines.length, 10);
  const shifted = candidate(); shifted.lines[7].remaining_qty += 2; shifted.lines[8].remaining_qty -= 2;
  assert.throws(() => validateCandidate(shifted, source, oracle), /GOLDEN_MISMATCH/);
  const missing = candidate(); missing.events.pop();
  assert.throws(() => validateCandidate(missing, source, oracle), /GOLDEN_MISMATCH/);
  const badFlag = candidate(); badFlag.events[0].contributes_to_state = false;
  assert.throws(() => validateCandidate(badFlag, source, oracle), /GOLDEN_MISMATCH/);
});
test('FIX-02 checks independently specified supersession and offsetting per-line changes', () => {
  const correct = candidate(source2, oracle2);
  assert.equal(validateCandidate(correct, source2, oracle2).events.length, 12);
  const staleRevision = structuredClone(correct);
  const stale = staleRevision.events.find(e => e.event_id === 'E10' && e.revision === 1);
  stale.contributes_to_state = true;
  assert.throws(() => validateCandidate(staleRevision, source2, oracle2), /GOLDEN_MISMATCH/);
  const wrongLines = structuredClone(correct);
  wrongLines.lines.find(l => l.line_id === 'L08').remaining_qty = 4;
  wrongLines.lines.find(l => l.line_id === 'L09').remaining_qty = 4;
  assert.equal(wrongLines.lines.reduce((n, l) => n + l.remaining_qty, 0), 48);
  assert.throws(() => validateCandidate(wrongLines, source2, oracle2), /GOLDEN_MISMATCH/);
  assert.throws(() => validateCandidate(correct, source2, { ...oracle2, event_states: undefined }), /MISSING_EVENT_ORACLE/);
});
test('complete no-op requires one ready manifest, original source hash and matching contexts in every row', () => {
  assert.equal(validatePublished(published(), source, oracle, batchId, transformHash).lines.length, 10);
  for (const mutate of [p => p.manifests.pop(), p => p.lines.pop(), p => { p.manifests[0].status = 'FAILED'; }, p => { p.events[0].batch_id = 'other'; }, p => { p.manifests[0].source_package_hash = 'wrong'; }]) {
    const p = published(); mutate(p); assert.throws(() => validatePublished(p, source, oracle, batchId, transformHash));
  }
});
test('publication has one atomic transaction and explicit inserts for all three serving tables', () => {
  assert.equal((publicationSql.match(/INSERT INTO/g) ?? []).length, 3);
  assert.match(publicationSql, /BEGIN TRANSACTION;[\s\S]*ASSERT[\s\S]*COMMIT TRANSACTION;/);
  assert.doesNotMatch(publicationSql, /CREATE |DELETE |UPDATE |MERGE |EXECUTE IMMEDIATE|\bIF\b/);
  for (const name of ['po_line_snapshot', 'event_evidence', 'batch_manifest']) assert.match(publicationSql, new RegExp(`po_serving\\.${name}`));
});
test('known successful job is polled/reused without a new submission', async () => {
  let submissions = 0;
  const metadata = { jobReference: { projectId: TARGET.projectId, location: TARGET.location, jobId: 'known' }, status: { state: 'DONE' } };
  const result = await findOrCreateJob({ job: () => ({ getMetadata: async () => [metadata] }) }, 'known', async () => { submissions++; });
  assert.equal(submissions, 0); assert.equal(result.reused, true);
});
test('a definitively failed stable job stops for deliberate repair without resetting or resubmitting it', async () => {
  let submissions = 0;
  const metadata = { jobReference: { projectId: TARGET.projectId, location: TARGET.location, jobId: 'failed' }, status: { state: 'DONE', errorResult: { reason: 'invalidQuery' } } };
  await assert.rejects(findOrCreateJob({ job: () => ({ getMetadata: async () => [metadata] }) }, 'failed', async () => { submissions++; }), /CLOUD_JOB_FAILED: invalidQuery/);
  assert.equal(submissions, 0);
});
test('unknown submission outcome never automatically resubmits', async () => {
  let submissions = 0;
  const client = { job: () => ({ getMetadata: async () => { throw Object.assign(new Error('missing'), { code: 404 }); } }) };
  await assert.rejects(findOrCreateJob(client, 'known', async () => { submissions++; throw new Error('timeout'); }), /timeout/);
  assert.equal(submissions, 1);
});
test('a pending known job times out with its ID retained and no resubmission', async () => {
  let clock = 0, submissions = 0;
  const metadata = { jobReference: { projectId: TARGET.projectId, location: TARGET.location, jobId: 'pending' }, status: { state: 'RUNNING' } };
  await assert.rejects(findOrCreateJob({ job: () => ({ getMetadata: async () => [metadata] }) }, 'pending', async () => { submissions++; },
    { now: () => clock, sleep: async () => { clock += 130000; } }), /JOB_PENDING: pending/);
  assert.equal(submissions, 0);
});
test('prior uncertain queries are reconciled before a new attempt; absent unknown job stops for review', async () => {
  const prior = [{ jobs: [{ job_id: 'old_transform', status: 'SUBMISSION_PENDING' }] }];
  let saves = 0;
  const metadata = { jobReference: { projectId: TARGET.projectId, location: TARGET.location, jobId: 'old_transform' }, status: { state: 'DONE' } };
  await settlePriorJobs({ job: () => ({ getMetadata: async () => [metadata] }) }, prior, async () => { saves++; });
  assert.equal(prior[0].jobs[0].status, 'DONE'); assert.equal(saves, 1);
  prior[0].jobs[0].status = 'SUBMISSION_PENDING';
  await assert.rejects(settlePriorJobs({ job: () => ({ getMetadata: async () => { throw Object.assign(new Error('absent'), { code: 404 }); } }) }, prior, async () => {}), /UNKNOWN_PRIOR_JOB/);
});

function mockCloud({ invalidCandidate = false, alreadyPublished = false, wrongRegion = false, missingScriptBytes = false, correction = false } = {}) {
  const input = correction ? source2 : source, expected = correction ? oracle2 : oracle, inputBatch = batchIdentity(input);
  const current = Date.now(), first = current - 10000;
  const manifest = { version: '1.0', approval: 'DEC-G5-001', projectId: TARGET.projectId, location: TARGET.location, serviceAccountEmail: TARGET.serviceAccount,
    firstResourceAt: new Date(first).toISOString(), absoluteExpiresAt: new Date(first + 14 * 86400000).toISOString(), resources: REQUIRED_TABLES.map(t => ({ kind: 'table', ...t, status: 'verified', expiresAt: new Date(first + (t.datasetId === TARGET.workDataset ? 7 : 14) * 86400000).toISOString() })) };
  const jobs = new Map(), calls = [], batches = new Map();
  if (correction) batches.set(batchId, published());
  if (alreadyPublished) batches.set(inputBatch, published(input, expected));
  const rows = result => Object.entries(result).flatMap(([k, values]) => values.map(r => ({ row_kind: { lines: 'LINE', events: 'EVENT', manifests: 'MANIFEST' }[k], row_json: JSON.stringify(r) })));
  const makeJob = (id, configuration, data = [], loadRows) => {
    const metadata = { jobReference: { projectId: TARGET.projectId, location: TARGET.location, jobId: id }, configuration, status: { state: 'DONE' },
      statistics: loadRows !== undefined ? { load: { outputRows: String(loadRows) } } : { query: { totalBytesBilled: '10485760' } } };
    const job = { metadata, getMetadata: async () => [metadata], getQueryResults: async () => [data] }; jobs.set(id, job); return job;
  };
  const client = { projectId: TARGET.projectId,
    job: id => jobs.get(id) ?? { getMetadata: async () => { throw Object.assign(new Error('absent'), { code: 404 }); } },
    dataset: datasetId => ({ getMetadata: async () => [{ datasetReference: { projectId: TARGET.projectId, datasetId }, location: wrongRegion ? 'US' : TARGET.location }],
      table: tableId => ({ getMetadata: async () => [{ type: 'TABLE', tableReference: { projectId: TARGET.projectId, datasetId, tableId },
        schema: REQUIRED_TABLES.find(t => t.tableId === tableId).schema, numBytes: '1000', expirationTime: String(Date.parse(manifest.resources.find(t => t.tableId === tableId).expiresAt)) }],
      createLoadJob: async (path, config) => { calls.push(`load:${tableId}`); const count = (await readFile(path, 'utf8')).trimEnd().split('\n').length;
        return [makeJob(config.jobId, { load: { ...config, destinationTable: { projectId: TARGET.projectId, datasetId, tableId } } }, [], count)]; } }) }),
    createQueryJob: async config => {
      if (config.dryRun) { calls.push('dry'); return [{ metadata: { configuration: { dryRun: true }, statistics: { totalBytesProcessed: '1000' } } }]; }
      calls.push(config.labels.stage);
      let data;
      if (config.query === readSql) data = rows(batches.get(config.params.batch_id) ?? { lines: [], events: [], manifests: [] });
      else if (config.query === transformSql) { const c = candidate(input, expected); if (invalidCandidate) c.lines[0].remaining_qty++; data = rows(c); }
      else if (config.query === publicationSql) { batches.set(inputBatch, published(input, expected)); data = []; }
      else assert.fail('unexpected SQL');
      const job = makeJob(config.jobId, { query: config }, data);
      if (missingScriptBytes && config.query === publicationSql) delete job.metadata.statistics.query.totalBytesBilled;
      return [job];
    },
  };
  return { client, manifest, calls, batches, input, expected };
}
let mockAttempt = 0;
async function runMock(options, mode = 'execute', existingMock) {
  const mock = existingMock ?? mockCloud(options), directory = await mkdtemp(join(tmpdir(), 'astra-pipeline-'));
  try {
    const attempt = options?.attempt ?? { id: `test${++mockAttempt}`, jobs: [] }, savedStages = [];
    const retainedBatch = mock.input === source2 ? { source, oracle, batchId } : undefined;
    const result = await runCloudSlice({ client: mock.client, resourceManifest: mock.manifest, source: mock.input, oracle: mock.expected, batchId: batchIdentity(mock.input), transformSql, readSql, mode, attempt,
      save: async () => { savedStages.push(attempt.stage); }, directory, retainedBatch, stopBeforePublish: options?.stopBeforePublish ?? false });
    return { ...mock, result, attempt, savedStages };
  } catch (error) { error.calls = mock.calls; throw error; }
  finally { assert.ok(directory.startsWith(join(tmpdir(), 'astra-pipeline-'))); await rm(directory, { recursive: true, force: true }); }
}
test('mocked success loads only explicit existing tables and reconciles after atomic publication', async () => {
  const { result, calls, attempt } = await runMock({});
  assert.equal(result.outcome, 'PUBLISHED_AND_RECONCILED'); assert.equal(result.desktop_verification, 'Not Run');
  assert.deepEqual(calls.filter(c => c.startsWith('load:')), ['load:raw_lines', 'load:raw_event_versions']);
  assert.ok(calls.indexOf('transform') < calls.indexOf('publish')); assert.ok(calls.indexOf('publish') < calls.indexOf('read_after'));
  assert.ok(attempt.billed_bytes < LIMITS.attemptBytes);
});
test('bad transformed line prevents every serving write', async () => {
  await assert.rejects(runMock({ invalidCandidate: true }), error => error.code === 'GOLDEN_MISMATCH' && !error.calls.includes('publish'));
});
test('unknown script billing stops after publication without blindly republishing or making further queries', async () => {
  await assert.rejects(runMock({ missingScriptBytes: true }), error => error.code === 'UNKNOWN_QUERY_BYTES' && error.calls.filter(c => c === 'publish').length === 1 && !error.calls.includes('read_after'));
});
test('verified no-op performs no loads/publication; dry-run performs no table mutation or query execution', async () => {
  const noOp = await runMock({ alreadyPublished: true });
  assert.equal(noOp.result.outcome, 'VERIFIED_NO_OP'); assert.ok(noOp.calls.every(c => c === 'dry' || c === 'read_before'));
  const dry = await runMock({}, 'dry-run'); assert.equal(dry.result.google_sql_execution, 'Not Run'); assert.ok(dry.calls.every(c => c === 'dry'));
  assert.deepEqual(dry.savedStages, ['VERIFYING_RESOURCES', 'RESOURCES_VERIFIED', 'DRY_RUN_REQUEST:read_estimate', 'DRY_RUN_COMPLETE:read_estimate',
    'DRY_RUN_REQUEST:transform_estimate', 'DRY_RUN_COMPLETE:transform_estimate', 'DRY_RUN_REQUEST:publish_estimate', 'DRY_RUN_COMPLETE:publish_estimate']);
});
test('wrong-region and expired-manifest resources stop before any load/query submission', async () => {
  const mock = mockCloud({ wrongRegion: true }); await assert.rejects(verifyResources(mock.client, mock.manifest), /DATASET_TARGET_MISMATCH/); assert.equal(mock.calls.length, 0);
  const valid = mockCloud({}); valid.manifest.absoluteExpiresAt = new Date(Date.now() - 1).toISOString();
  await assert.rejects(verifyResources(valid.client, valid.manifest), /RESOURCE_LIFETIME_EXCEEDED/);
});
test('FIX-02 interruption, recovery and no-op are three counted attempts with load reuse and immutable FIX-01', async () => {
  const cloud = mockCloud({ correction: true }), original = JSON.stringify(cloud.batches.get(batchId));
  const correctedId = batchIdentity(source2), ledger = { schema_version: 1, attempts: [] };
  const firstAttempt = reserveAttempt(ledger, readiness(), 'execute', correctedId, now);
  const stopped = await runMock({ stopBeforePublish: true, attempt: firstAttempt }, 'execute', cloud);
  firstAttempt.status = stopped.result.expected_controlled_stop ? 'CONTROLLED_STOP' : 'PASS';
  assert.equal(stopped.result.outcome, 'CONTROLLED_STOP_BEFORE_PUBLICATION');
  assert.equal(stopped.result.publication, 'Not Run'); assert.equal(stopped.result.retained_batch.validation, 'PASS');
  assert.equal(stopped.attempt.stage, 'CONTROLLED_STOP_BEFORE_PUBLICATION');
  assert.equal(cloud.batches.has(correctedId), false); assert.equal(cloud.calls.includes('publish'), false);
  assert.equal(JSON.stringify(cloud.batches.get(batchId)), original);
  const callBoundary = cloud.calls.length;
  const secondAttempt = reserveAttempt(ledger, readiness(), 'execute', correctedId, now);
  const recovered = await runMock({ attempt: secondAttempt }, 'execute', cloud); secondAttempt.status = 'PASS';
  assert.equal(recovered.result.outcome, 'PUBLISHED_AND_RECONCILED'); assert.equal(recovered.result.event_count, 12);
  assert.equal(recovered.result.retained_batch.validation, 'PASS');
  assert.ok(cloud.calls.slice(callBoundary).every(c => !c.startsWith('load:')));
  const loadJobs = recovered.attempt.jobs.filter(j => j.stage.startsWith('load_'));
  assert.deepEqual(loadJobs.map(j => j.output_rows), [10, 12]); assert.ok(loadJobs.every(j => j.reused_existing_job));
  const corrected = JSON.stringify(cloud.batches.get(correctedId)), repeatBoundary = cloud.calls.length;
  const thirdAttempt = reserveAttempt(ledger, readiness(), 'execute', correctedId, now);
  const repeated = await runMock({ attempt: thirdAttempt }, 'execute', cloud); thirdAttempt.status = 'PASS';
  assert.equal(repeated.result.outcome, 'VERIFIED_NO_OP'); assert.equal(repeated.result.retained_batch.validation, 'PASS');
  assert.ok(cloud.calls.slice(repeatBoundary).every(c => ['dry', 'read_before', 'read_retained'].includes(c)));
  assert.equal(JSON.stringify(cloud.batches.get(correctedId)), corrected);
  assert.equal(JSON.stringify(cloud.batches.get(batchId)), original);
  assert.deepEqual(ledger.attempts.map(a => a.status), ['CONTROLLED_STOP', 'PASS', 'PASS']);
  assert.throws(() => reserveAttempt(ledger, readiness(), 'execute', correctedId, now), /DAILY_ATTEMPT_LIMIT/);
});
test('controlled stop cannot claim retained-batch success when the prior ready manifest is absent', async () => {
  const cloud = mockCloud({ correction: true }); cloud.batches.get(batchId).manifests = [];
  await assert.rejects(runMock({ stopBeforePublish: true }, 'execute', cloud), error => error.code === 'INCOMPLETE_PUBLISHED_BATCH' && !error.calls.includes('publish'));
  assert.equal(cloud.batches.has(batchIdentity(source2)), false);
});
