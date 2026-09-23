import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, basename, resolve } from 'node:path';
import { TARGET, REQUIRED_TABLES } from '../../src/pipeline/schemas.mjs';
import { LIMITS, hash, publicationParams, quotaDate } from '../../src/pipeline/core.mjs';
import { reserveAttempt } from '../../src/pipeline/ledger.mjs';
import { runValidationSuite, classifyLimitProbeMetadata, reconcileRawOccurrences, RAW_RECONCILIATION_SQL, LIMIT_CONTROL_SQL } from '../../src/pipeline/validation-suite.mjs';
import { main, parseArguments, loadSuite } from '../../scripts/run-validation-suite.mjs';

const suite = await loadSuite();
const MiB = 1024 ** 2;
const tempParent = realpathSync(tmpdir());
async function directory(t) {
  const dir = await mkdtemp(join(tempParent, 'astra-validation-suite-'));
  t.after(async () => {
    assert.equal(dirname(resolve(dir)), tempParent);
    assert(basename(dir).startsWith('astra-validation-suite-'));
    await rm(dir, { recursive: true, force: true });
  });
  return dir;
}
const rowset = result => Object.entries(result).flatMap(([kind, rows]) => rows.map(row => ({
  row_kind: { lines: 'LINE', events: 'EVENT', manifests: 'MANIFEST' }[kind], row_json: JSON.stringify(row),
})));
// Mock result rows come from the independent fixture. They test orchestration
// and rejection; only a separately observed GoogleSQL run can prove SQL output.
const candidate = (source, expected) => ({ lines: source.lines.map(line => ({ ...line,
  ...expected.line_states.find(row => row.line_id === line.line_id), source_business_date: expected.business_date })),
events: source.events.filter(event => expected.keys.event_versions.includes(`${event.event_id}/${event.revision}`))
  .map(event => ({ ...event, ...expected.event_states.find(row => row.event_id === event.event_id && row.revision === event.revision) })), manifests: [] });
const published = () => {
  const params = publicationParams(candidate(suite.baselineSource, suite.baselineOracle), suite.baselineSource,
    suite.baselineBatchId, hash(suite.transformSql));
  return Object.fromEntries([['lines', params.lines_json], ['events', params.events_json], ['manifests', params.manifest_json]]
    .map(([key, value]) => [key, JSON.parse(value).map(row => ({ ...row, published_at: '2026-09-22T02:36:20Z' }))]));
};
function attempt(id = 'testattempt1') {
  return { id, mode: 'validation-suite', batch_id: suite.suiteId, reserved_bytes: LIMITS.attemptBytes, jobs: [] };
}
function fakeCloud(options = {}) {
  const first = Date.now() - 10000;
  const manifest = { version: '1.0', approval: 'DEC-G5-001', projectId: TARGET.projectId, location: TARGET.location,
    serviceAccountEmail: TARGET.serviceAccount, firstResourceAt: new Date(first).toISOString(), absoluteExpiresAt: new Date(first + 14 * 86400000).toISOString(),
    resources: REQUIRED_TABLES.map(table => ({ kind: 'table', ...table, status: 'verified',
      expiresAt: new Date(first + (table.datasetId === TARGET.workDataset ? 7 : 14) * 86400000).toISOString() })) };
  const raw = { raw_lines: [], raw_event_versions: [] }, jobs = new Map(), calls = [];
  const makeJob = (id, configuration, data = [], loadCount) => {
    const metadata = { jobReference: { projectId: TARGET.projectId, location: TARGET.location, jobId: id },
      configuration, status: { state: 'DONE' }, statistics: loadCount === undefined ? { query: { totalBytesBilled: String(options.actualBytes ?? 10 * MiB) } } : { load: { outputRows: String(loadCount) } } };
    const job = { metadata, getMetadata: async () => { calls.push({ metadataRead: id }); return [metadata]; }, getQueryResults: async () => [data] };
    jobs.set(id, job); return job;
  };
  const client = { projectId: TARGET.projectId,
    job: id => jobs.get(id) ?? { getMetadata: async () => { throw Object.assign(new Error('absent'), { code: 404 }); } },
    dataset: datasetId => ({ getMetadata: async () => [{ datasetReference: { projectId: TARGET.projectId, datasetId }, location: TARGET.location }],
      table: tableId => ({ getMetadata: async () => [{ type: 'TABLE', tableReference: { projectId: TARGET.projectId, datasetId, tableId },
        schema: REQUIRED_TABLES.find(t => t.tableId === tableId).schema, numBytes: '1000',
        expirationTime: String(Date.parse(manifest.resources.find(t => t.tableId === tableId).expiresAt)) }],
      createLoadJob: async (file, config) => {
        assert.equal(datasetId, TARGET.workDataset); assert(['raw_lines', 'raw_event_versions'].includes(tableId));
        calls.push({ load: tableId, config });
        const rows = (await readFile(file, 'utf8')).trimEnd().split('\n').map(JSON.parse);
        raw[tableId].push(...rows);
        return [makeJob(config.jobId, { load: { ...config, destinationTable: { projectId: TARGET.projectId, datasetId, tableId } } }, [], rows.length)];
      } }) }),
    createQueryJob: async config => {
      assert.doesNotMatch(config.query, /\b(?:INSERT|UPDATE|DELETE|MERGE|CREATE|DROP|TRUNCATE)\b/);
      assert.equal(config.location, TARGET.location); assert(Number(config.maximumBytesBilled) <= LIMITS.queryBytes);
      if (config.dryRun) {
        calls.push({ dry: true, dryStage: config.labels.stage });
        return [{ metadata: { configuration: { dryRun: true }, statistics: { totalBytesProcessed: String(options.estimate ?? 1000) } } }];
      }
      calls.push({ stage: config.labels.stage, config });
      const queryParameters = Object.entries(config.params).map(([name, value]) => ({ name,
        parameterType: { type: Array.isArray(value) ? 'ARRAY' : 'STRING' }, parameterValue: Array.isArray(value) ? { arrayValues: value.map(v => ({ value: v })) } : { value } }));
      const queryConfig = { ...config, queryParameters };
      if (options.wrongParams && config.labels.stage === 'fix_03_d') queryConfig.queryParameters[0].parameterValue.value = 'wrong_batch';
      if (config.query === LIMIT_CONTROL_SQL) {
        if (options.control === 'request_reject') throw Object.assign(new Error('Query exceeded limit for bytes billed: 1.'), { code: 400 });
        if (options.control === 'generic400') throw Object.assign(new Error('unrelated invalid request'), { code: 400 });
        if (options.control === 'permission') throw Object.assign(new Error('permission denied'), { code: 403 });
        if (options.control === 'permission_phrase') throw Object.assign(new Error('Query exceeded limit for bytes billed: 1.'), { code: 403 });
        const job = makeJob(config.jobId, { query: queryConfig });
        if (options.control !== 'accepted') job.metadata.status.errorResult = { reason: options.control === 'wrong_reason' ? 'accessDenied' :
          options.control === 'legacy_reason' ? 'billingTierLimitExceeded' : 'bytesBilledLimitExceeded',
          message: options.control === 'wrong_message' ? 'some other billing failure' : 'Query exceeded limit for bytes billed: 1. 10485760 or higher required.' };
        job.metadata.statistics.query.totalBytesBilled = options.control === 'charged' ? '1' : '0';
        if (['unknown_bytes', 'sdk_create_error', 'pending'].includes(options.control)) delete job.metadata.statistics.query.totalBytesBilled;
        if (options.control === 'wrong_config') job.metadata.configuration.query.maximumBytesBilled = '2';
        if (options.control === 'wrong_target') job.metadata.jobReference.projectId = 'wrong-project';
        if (options.control === 'wrong_binding') job.metadata.configuration.query.queryParameters[0].parameterValue.value = 'wrong_batch';
        if (options.control === 'pending') job.metadata.status.state = 'RUNNING';
        if (['sdk_create_error', 'pending'].includes(options.control))
          throw Object.assign(new Error('Query exceeded limit for bytes billed: 1. 10485760 or higher required.'), { code: 400 });
        return [job];
      }
      let data;
      if (config.query === suite.readSql) {
        const state = published();
        if (options.changedBaseline && config.labels.stage === 'baseline_after') state.manifests[0].published_at = '2026-09-22T02:36:21Z';
        data = rowset(state);
      } else if (config.query === RAW_RECONCILIATION_SQL) {
        const rows = { lines: structuredClone(raw.raw_lines), events: structuredClone(raw.raw_event_versions), manifests: [] };
        if (options.rawTamper === 'payload') rows.events[0].quantity++;
        if (options.rawTamper === 'locator') rows.events[0].record_locator = 'line_events.jsonl:999';
        if (options.rawTamper === 'duplicate') rows.events.push(rows.events[0]);
        data = rowset(rows);
      } else {
        assert.equal(config.query, suite.transformSql);
        const c = suite.admitted.find(row => row.batchId === config.params.batch_id);
        assert(c); const state = candidate(c.source, c.expected);
        if (options.badCandidate && c.caseId === 'FIX-03-D') state.lines[0].remaining_qty++;
        if (options.wrongHReason && c.caseId === 'FIX-03-H') state.lines.pop();
        if (options.wrongKnowledge && c.caseId === 'FIX-02-EARLY-KNOWLEDGE')
          state.events.push({ ...c.source.events.find(event => event.event_id === 'E10' && event.revision === 2) });
        if (config.labels.stage === 'fix_03_d_replay') {
          state.lines.reverse(); state.events.reverse();
          if (options.changedReplay) state.events[0].unexpected_replay_marker = true;
        }
        data = rowset(state);
      }
      return [makeJob(config.jobId, { query: queryConfig }, data)];
    },
  };
  return { client, manifest, calls, raw, jobs };
}
async function run(t, cloud = fakeCloud(), id) {
  const current = attempt(id), dir = await directory(t);
  const result = await runValidationSuite({ client: cloud.client, suite, attempt: current, save: async () => {}, directory: dir, resourceManifest: cloud.manifest });
  return { result, current, cloud };
}

test('default plan is credential-free and pins the complete 17-case suite, D replay and exact 90/96 work rows', async () => {
  const result = await main([]);
  assert.equal(result.mode, 'plan'); assert.equal(result.cloud_execution, 'Not Run');
  assert.equal(result.cases.length, 17); assert.deepEqual(result.work_upload_counts, { raw_lines: 90, raw_event_versions: 96 });
  assert.equal(result.cases.filter(c => c.expected_outcome === 'ACCEPT').length, 8);
  assert.deepEqual(result.candidate_replay, { case_id: 'FIX-03-D', stage: 'fix_03_d_replay', repeats: 1 });
  assert.equal(result.local_admission.filter(c => c.observed === 'REJECT').length, 8);
  assert(suite.admitted.every(c => c.batchId.startsWith('validation_')));
  assert.throws(() => parseArguments(['--execute', '--plan']), /INVALID_ARGUMENTS/);
  assert.throws(() => parseArguments(['--case', 'FIX-03-D']), /INVALID_ARGUMENTS/);
  assert.throws(() => parseArguments(['--dry-run']), /INVALID_ARGUMENTS/);
});

test('one suite verifies all expected outcomes, physical duplicates, last-good reads and service limit without publishing', async t => {
  const { result, current, cloud } = await run(t);
  assert.equal(result.outcome, 'VALIDATION_SUITE_PASS'); assert.equal(result.cases.length, 17);
  assert(result.cases.every(c => c.status === 'PASS'));
  assert.equal(result.cases.find(c => c.case_id === 'FIX-03-H').observed_code, 'GOLDEN_MISMATCH');
  assert.equal(result.cases.filter(c => c.observed_outcome === 'REJECT').length, 9);
  assert.equal(result.raw_occurrences.events.length, 96); assert.equal(result.raw_occurrences.lines.length, 90);
  const earlier = result.cases.find(c => c.case_id === 'FIX-02-EARLY-KNOWLEDGE');
  assert.equal(earlier.actual_candidate.events.length, 10);
  assert.equal(earlier.actual_candidate.lines.reduce((sum, row) => sum + row.overdue_value_cents, 0), 14400);
  assert.equal(result.candidate_replay.status, 'PASS');
  const originalQuery = cloud.calls.find(c => c.stage === 'fix_03_d').config;
  const replayQuery = cloud.calls.find(c => c.stage === 'fix_03_d_replay').config;
  assert.equal(replayQuery.query, originalQuery.query); assert.deepEqual(replayQuery.params, originalQuery.params);
  assert.notEqual(replayQuery.jobId, originalQuery.jobId);
  assert.equal(cloud.calls.filter(c => c.load).length, 2);
  assert.equal(cloud.calls.filter(c => c.stage === 'baseline_before' || c.stage === 'baseline_after').length, 2);
  assert.equal(current.reserved_bytes, LIMITS.attemptBytes); assert(current.billed_bytes < LIMITS.attemptBytes);
  assert(current.projected_billed_bytes <= LIMITS.attemptBytes); assert(current.jobs.filter(j => j.dry_run).length === 27);
  assert.equal(result.limit_control.status, 'PASS'); assert.equal(result.limit_control.job_status, 'DONE');
  assert.equal(result.limit_control.expected_rejection_verified, true);
  assert.equal(result.serving_publication, 'Not Run'); assert.equal(result.desktop_verification, 'Not Run');
});

test('a new reserved rerun reuses both known load IDs and cannot append duplicate raw occurrences', async t => {
  const cloud = fakeCloud();
  await run(t, cloud, 'attemptone');
  const { current } = await run(t, cloud, 'attempttwo');
  assert.equal(cloud.calls.filter(c => c.load).length, 2);
  assert.equal(cloud.raw.raw_lines.length, 90); assert.equal(cloud.raw.raw_event_versions.length, 96);
  assert(current.jobs.filter(j => j.stage.startsWith('load_')).every(j => j.reused_existing_job));
});

test('aggregate scan estimates stop before loads even when each query is below the individual cap', async t => {
  const cloud = fakeCloud({ estimate: 200 * MiB });
  await assert.rejects(run(t, cloud), /PROJECTED_ATTEMPT_LIMIT/);
  assert.equal(cloud.calls.filter(c => c.load || c.stage).length, 0);
});

test('an unexpected candidate mismatch fails fast before further cases or a limit probe', async t => {
  const cloud = fakeCloud({ badCandidate: true });
  await assert.rejects(run(t, cloud), /UNEXPECTED_CANDIDATE_RESULT/);
  assert(!cloud.calls.some(c => c.stage === 'fix_04_midnight_before' || c.stage === 'limit_control'));
});

test('the missing-event case cannot pass by rejecting for an unrelated line mismatch', async t => {
  await assert.rejects(run(t, fakeCloud({ wrongHReason: true })), /UNEXPECTED_CANDIDATE_RESULT/);
});

test('earlier knowledge cannot leak a later revision and duplicate replay must preserve the complete candidate', async t => {
  const knowledge = fakeCloud({ wrongKnowledge: true });
  await assert.rejects(run(t, knowledge), /UNEXPECTED_CANDIDATE_RESULT/);
  assert(!knowledge.calls.some(c => c.stage === 'fix_03_d_replay' || c.stage === 'baseline_after'));
  const replay = fakeCloud({ changedReplay: true });
  await assert.rejects(run(t, replay), /CANDIDATE_REPLAY_CHANGED/);
  assert(!replay.calls.some(c => c.stage === 'baseline_after' || c.stage === 'limit_control'));
});

test('persisted raw reconciliation rejects changed fields, shifted locators and duplicate physical rows', async t => {
  for (const rawTamper of ['payload', 'locator', 'duplicate']) {
    const cloud = fakeCloud({ rawTamper });
    await assert.rejects(run(t, cloud), /RAW_RECONCILIATION_MISMATCH/);
    assert(!cloud.calls.some(c => c.stage === 'fix_03_d'));
  }
});

test('known query IDs must also match the exact case parameter binding', async t => {
  await assert.rejects(run(t, fakeCloud({ wrongParams: true })), /JOB_PARAMETER_MISMATCH/);
});

test('last-good publication timestamp/context changes are not mistaken for unchanged business totals', async t => {
  await assert.rejects(run(t, fakeCloud({ changedBaseline: true })), /GOLDEN_MISMATCH|LAST_GOOD_CHANGED/);
});

test('only an authoritative exact cost-limit rejection is accepted; other failures remain failures', async t => {
  for (const control of ['generic400', 'permission', 'permission_phrase', 'wrong_reason', 'wrong_message', 'accepted', 'charged',
    'pending', 'wrong_config', 'wrong_target', 'wrong_binding']) {
    const cloud = fakeCloud({ control });
    await assert.rejects(run(t, cloud), /UNEXPECTED_LIMIT_CONTROL_RESULT|LIMIT_CONTROL_BILLED_BYTES|LIMIT_CONTROL_JOB_UNSETTLED|JOB_CONFIGURATION_MISMATCH|JOB_TARGET_MISMATCH|JOB_PARAMETER_MISMATCH/);
    assert.equal(cloud.calls.filter(c => c.stage === 'limit_control').length, 1);
    assert.equal(cloud.calls.filter(c => c.stage === 'baseline_after').length, 1);
    assert.equal(cloud.calls.filter(c => c.stage).at(-1).stage, 'limit_control');
  }
  const { result } = await run(t, fakeCloud({ control: 'request_reject' }));
  assert.equal(result.limit_control.job_status, 'ABSENT_VERIFIED');
  assert.equal(result.limit_control.billed_bytes, null);
  assert.match(result.limit_control.observation, /confirmed absent/);
});

test('persisted create-time bytes-limit error is read back; omitted billing remains null with policy inference only', async t => {
  for (const control of ['sdk_create_error', 'unknown_bytes', 'legacy_reason']) {
    const { result, current, cloud } = await run(t, fakeCloud({ control }));
    assert.equal(result.limit_control.status, 'PASS'); assert.equal(result.limit_control.job_status, 'DONE');
    assert.equal(cloud.calls.filter(c => c.stage === 'limit_control').length, 1);
    assert(cloud.calls.some(c => c.metadataRead === result.limit_control.job_id));
    assert.equal(result.limit_control.billed_bytes, control === 'legacy_reason' ? 0 : null);
    assert.equal(result.limit_control.processed_bytes, null);
    assert.equal(result.limit_control.billing_observation, control === 'legacy_reason' ? 'REPORTED_ZERO' : 'NOT_REPORTED');
    assert.equal(result.limit_control.charge_assessment.basis, 'DOCUMENTED_SERVICE_POLICY_INFERENCE');
    assert.equal(result.limit_control.charge_assessment.invoice_verified, false);
    assert.equal(current.reserved_bytes, LIMITS.attemptBytes);
  }
});

test('pure probe classifier binds the exact known job, query, parameters and one-byte limit', () => {
  const metadata = { jobReference: { projectId: TARGET.projectId, location: TARGET.location, jobId: 'known_probe' },
    configuration: { query: { query: LIMIT_CONTROL_SQL, maximumBytesBilled: '1', useLegacySql: false, useQueryCache: false,
      queryParameters: [{ name: 'batch_id', parameterType: { type: 'STRING' }, parameterValue: { value: suite.admitted[0].batchId } }] } },
    status: { state: 'DONE', errorResult: { reason: 'bytesBilledLimitExceeded',
      message: 'Query exceeded limit for bytes billed: 1. 10485760 or higher required.' } } };
  const inspect = candidate => classifyLimitProbeMetadata({ metadata: candidate, jobId: 'known_probe', batchId: suite.admitted[0].batchId });
  assert.equal(inspect(metadata).billed_bytes, null);
  for (const mutate of [
    m => { m.jobReference.jobId = 'different_probe'; },
    m => { m.jobReference.location = 'us-west1'; },
    m => { m.configuration.query.query += ' LIMIT 1'; },
    m => { m.configuration.query.maximumBytesBilled = '0'; },
    m => { m.configuration.query.queryParameters.push(m.configuration.query.queryParameters[0]); },
    m => { m.configuration.query.queryParameters[0].parameterType.type = 'INT64'; },
    m => { m.configuration.query.useQueryCache = true; },
    m => { m.configuration.dryRun = true; },
    m => { m.status.errorResult = { reason: 'billingTierLimitExceeded', message: 'Query exceeded CPU resources' }; },
    m => { m.statistics = { query: { totalBytesBilled: '1' } }; },
  ]) { const changed = structuredClone(metadata); mutate(changed); assert.throws(() => inspect(changed)); }
});

test('observed query bytes are bounded and later job caps shrink to the remaining attempt budget', async t => {
  const tooLarge = fakeCloud({ actualBytes: LIMITS.queryBytes + 1 });
  await assert.rejects(run(t, tooLarge), /QUERY_BYTE_LIMIT/);
  assert.equal(tooLarge.calls.filter(c => c.load).length, 0);
  const cloud = fakeCloud({ actualBytes: 800 * MiB });
  await assert.rejects(run(t, cloud), /QUERY_BYTE_LIMIT/);
  const queries = cloud.calls.filter(c => c.config?.query);
  assert.equal(queries.length, 3);
  assert.equal(Number(queries.at(-1).config.maximumBytesBilled), LIMITS.attemptBytes - 1600 * MiB);
  assert(queries.every(c => Number(c.config.maximumBytesBilled) <= LIMITS.queryBytes));
});

test('the suite uses the common reservation ledger and cannot create a fourth daily attempt', () => {
  const now = new Date(), ready = { schema_version: 1, project_id: TARGET.projectId, location: TARGET.location,
    pipeline_service_account: TARGET.serviceAccount, gate5_decision_ref: 'DEC-G5-001', cloud_execution_authorized: true,
    billing_verified: true, runtime_identity_verified: true, controls_verified: true, observed_at_utc: now.toISOString(),
    cost_evidence_checked_at_utc: now.toISOString(), quota_date: quotaDate(now), known_project_billed_bytes_today: 0 };
  const ledger = { schema_version: 1, attempts: [] };
  reserveAttempt(ledger, ready, 'execute', suite.baselineBatchId, now);
  reserveAttempt(ledger, ready, 'validation-suite', suite.suiteId, now).status = 'FAIL';
  reserveAttempt(ledger, ready, 'validation-suite', suite.suiteId, now);
  assert.throws(() => reserveAttempt(ledger, ready, 'validation-suite', suite.suiteId, now), /DAILY_ATTEMPT_LIMIT/);
  assert.equal(ledger.attempts.reduce((n, a) => n + a.reserved_bytes, 0), 3 * LIMITS.attemptBytes);
});
