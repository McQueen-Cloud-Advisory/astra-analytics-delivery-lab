import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalJson, readPackageEnvelope, sha256 } from '../../src/data/source-package.mjs';
import { batchIdentity, hash, LIMITS } from '../../src/pipeline/core.mjs';
import { LINE_FIELDS, TARGET } from '../../src/pipeline/schemas.mjs';
import { runCloudSlice } from '../../src/pipeline/bigquery.mjs';
import { originalLoadIds, retainedRawSql } from '../../src/pipeline/retained-cloud-history.mjs';
import { main, parseArguments } from '../../scripts/run-pipeline.mjs';
import { fixture, source, source2, oracle, transformSql, readSql, batchId, mockCloud } from '../../test-support/pipeline-cloud.mjs';

const deltaPath = fileURLToPath(new URL('../../fixtures/po/FIX-02-delta/', import.meta.url));
const pinnedParent = await readPackageEnvelope(fileURLToPath(fixture)), envelope = await readPackageEnvelope(deltaPath);
const targetBatchId = batchIdentity(source2);
let nextAttempt = 0;
async function runDelta({ cloud = mockCloud({ correction: true, alreadyPublished: true }), mode = 'execute', failSave = false, deltaOverrides = {} } = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'astra-delta-')), attempt = { id: `delta${++nextAttempt}`, jobs: [] }, saved = [];
  try {
    const result = await runCloudSlice({ client: cloud.client, resourceManifest: cloud.manifest, source: cloud.input, oracle: cloud.expected,
      batchId: targetBatchId, transformSql, readSql, mode, attempt, directory,
      retainedBatch: { source, oracle, batchId }, deltaInput: { pinnedParent, envelope, ...deltaOverrides },
      save: async () => {
        if (failSave && attempt.stage === 'DELTA_PARENT_VERIFIED_AND_COMPOSED') throw new Error('injected durable save failure');
        saved.push({ attempt: structuredClone(attempt), calls: [...cloud.calls] });
      },
    });
    return { result, attempt, saved, cloud };
  } catch (error) { error.cloud = cloud; error.saved = saved; error.attempt = attempt; throw error; }
  finally { assert.ok(directory.startsWith(join(tmpdir(), 'astra-delta-'))); await rm(directory, { recursive: true, force: true }); }
}
const mutateRaw = (cloud, change, index = 0) => {
  const row = JSON.parse(cloud.rawRows[index].row_json); change(row); cloud.rawRows[index].row_json = JSON.stringify(row);
};
const noDownstream = cloud => {
  assert.ok(cloud.calls.every(call => !['read_before', 'transform', 'publish', 'read_after'].includes(call) && !call.startsWith('load:')));
};

test('delta plan is local/unverified and pins resolved identity without admitting incomplete delta alone', async () => {
  const plan = await main(['--delta', deltaPath]);
  assert.equal(plan.mode, 'plan'); assert.equal(plan.batch_id, targetBatchId);
  assert.equal(plan.source_package_hash, source2.sourcePackageHash);
  assert.equal(plan.delta_source_package_hash, envelope.manifest.source_package_hash);
  assert.deepEqual(plan.delta_source_counts, { lines: 0, events: 2 });
  assert.equal(plan.input_mode, 'DELTA_WITH_RETAINED_CLOUD_HISTORY');
  assert.equal(plan.cloud_execution, 'Not Run'); assert.equal(plan.parent_history_verification, 'Not Run'); assert.equal(plan.runtime_composition, 'Not Run');
  await assert.rejects(main(['--input', deltaPath]), /MISSING_LINE/);
  for (const args of [['--delta', deltaPath, '--input', deltaPath], ['--delta', deltaPath, '--stop-before-publish'], ['--delta', deltaPath, '--delta', deltaPath]]) {
    assert.throws(() => parseArguments(args), /INVALID_ARGUMENTS/);
  }
});

test('mocked accepted cloud parent is reconstructed before composition; existing FIX-02 is an honest no-op', async () => {
  const cloud = mockCloud({ correction: true, alreadyPublished: true }); cloud.rawRows.reverse();
  // TO_JSON_STRING can encode INT64 as decimal strings. TIMESTAMP equivalence
  // must reconstruct the reviewed UTC-second source bytes, regardless of .000.
  for (const resultRow of cloud.rawRows) {
    const row = JSON.parse(resultRow.row_json);
    for (const key of ['line_number', 'ordered_qty', 'unit_price_cents', 'revision', 'quantity']) if (Number.isInteger(row[key])) row[key] = String(row[key]);
    for (const key of ['ordered_at', 'source_recorded_at', 'event_at']) if (row[key]) row[key] = row[key].replace('Z', '.000Z');
    resultRow.row_json = JSON.stringify(row);
  }
  const { result, attempt, saved } = await runDelta({ cloud });
  assert.equal(result.outcome, 'VERIFIED_NO_OP'); assert.equal(result.publication_action, 'EXISTING_BATCH_VERIFIED'); assert.equal(result.new_batch_published, false);
  assert.equal(result.parent_history_verification, 'Pass'); assert.equal(result.runtime_composition, 'Pass');
  assert.deepEqual(cloud.calls.filter(c => c !== 'dry'), ['read_parent', 'read_parent_raw', 'read_before', 'read_retained']);
  const { composition, cloud_parent_binding: binding, provenance_hash: provenanceHash } = result.delta_provenance;
  assert.equal(provenanceHash, hash(canonicalJson({ composition, cloud_parent_binding: binding })));
  assert.equal(composition.scope, 'LOCAL_COMPOSITION_ONLY'); assert.equal(composition.cloud_acceptance_linkage, 'Not Run');
  assert.equal(composition.parent.source_package_hash, source.sourcePackageHash); assert.equal(composition.delta.source_package_hash, envelope.manifest.source_package_hash);
  assert.equal(composition.resolved.source_package_hash, source2.sourcePackageHash); assert.equal(composition.physical_occurrence_origins.events.length, 12);
  assert.equal(binding.verification, 'PASS'); assert.equal(binding.parent_status, 'READY'); assert.equal(binding.parent_validation_result, 'PASS');
  assert.equal(binding.runtime_identity, TARGET.serviceAccount); assert.equal(binding.physical_occurrence_evidence.length, 20);
  assert.deepEqual(attempt.parent_load_job_ids, originalLoadIds(batchId));
  assert.ok(Object.values(originalLoadIds(batchId)).every(id => cloud.metadataReads.includes(id)));
  assert.equal(binding.parent_read_job_id, attempt.jobs.find(j => j.stage === 'read_parent').job_id);
  assert.equal(binding.parent_raw_read_job_id, attempt.jobs.find(j => j.stage === 'read_parent_raw').job_id);
  const durable = saved.find(s => s.attempt.stage === 'DELTA_PARENT_VERIFIED_AND_COMPOSED');
  assert.deepEqual(durable.attempt.delta_provenance, result.delta_provenance); assert.ok(!durable.calls.includes('read_before'));
  assert.ok(cloud.queryConfigs.every(config => Number(config.maximumBytesBilled) <= LIMITS.queryBytes && config.location === TARGET.location));
  assert.equal(attempt.billed_bytes, 4 * 10485760); assert.ok(attempt.billed_bytes <= LIMITS.attemptBytes);
  assert.doesNotMatch(retainedRawSql, /source_package_hash\s*=/);
});

test('mocked absent FIX-02 follows normal bounded publication only after parent provenance is durably saved', async () => {
  const cloud = mockCloud({ correction: true }), parentBefore = JSON.stringify(cloud.batches.get(batchId));
  const { result, saved, attempt } = await runDelta({ cloud });
  assert.equal(result.outcome, 'PUBLISHED_AND_RECONCILED'); assert.equal(result.publication_action, 'NEW_BATCH_PUBLISHED'); assert.equal(result.new_batch_published, true);
  assert.equal(result.parent_history_verification, 'Pass'); assert.equal(result.runtime_composition, 'Pass');
  assert.equal(result.event_count, 12); assert.equal(JSON.stringify(cloud.batches.get(batchId)), parentBefore);
  assert.deepEqual(cloud.calls.filter(c => c.startsWith('load:')), ['load:raw_lines', 'load:raw_event_versions']);
  const durable = saved.find(s => s.attempt.stage === 'DELTA_PARENT_VERIFIED_AND_COMPOSED'); noDownstream({ calls: durable.calls });
  assert.ok(cloud.calls.indexOf('read_parent_raw') < cloud.calls.indexOf('load:raw_lines'));
  assert.ok(cloud.calls.indexOf('transform') < cloud.calls.indexOf('publish'));
  assert.ok(attempt.jobs.filter(j => !j.dry_run && !j.stage.startsWith('load_')).every(j => j.maximum_bytes_billed <= LIMITS.queryBytes));
  assert.equal(attempt.billed_bytes, 7 * 10485760);
});

test('dry-run never reads acceptance history or claims runtime composition', async () => {
  const { result, attempt, cloud } = await runDelta({ mode: 'dry-run' });
  assert.equal(result.outcome, 'DRY_RUN_ONLY'); assert.equal(result.parent_history_verification, 'Not Run');
  assert.equal(attempt.delta_provenance, undefined); assert.ok(cloud.calls.every(c => c === 'dry')); assert.equal(cloud.metadataReads.length, 0);
  assert.equal(result.estimated_bytes, 7000);
});

test('failure to persist provenance prevents target reconciliation and every downstream mutation', async () => {
  await assert.rejects(runDelta({ failSave: true }), error => {
    assert.match(error.message, /injected durable save failure/); noDownstream(error.cloud);
    assert.ok(error.attempt.delta_provenance); assert.ok(!error.saved.some(s => s.attempt.stage === 'DELTA_PARENT_VERIFIED_AND_COMPOSED')); return true;
  });
});

for (const [label, change] of [
  ['no READY manifest', p => { p.manifests = []; }],
  ['failed manifest', p => { p.manifests[0].validation_result = 'FAIL'; }],
  ['wrong source hash', p => { p.manifests[0].source_package_hash = 'wrong'; }],
  ['incorrect published fact', p => { p.lines[0].remaining_qty++; }],
]) test(`actual parent evidence required: ${label}`, async () => {
  const cloud = mockCloud({ correction: true, alreadyPublished: true }); change(cloud.batches.get(batchId));
  await assert.rejects(runDelta({ cloud, deltaOverrides: { accepted: true, status: 'READY', validation_result: 'PASS' } }), error => {
    noDownstream(error.cloud); assert.ok(!cloud.calls.includes('read_parent_raw')); assert.equal(error.attempt.delta_provenance, undefined); return true;
  });
});

for (const [label, change, code] of [
  ['payload hash', c => mutateRaw(c, r => { r.payload_hash = 'wrong'; }), 'RETAINED_RAW_PAYLOAD_HASH_MISMATCH'],
  ['changed source fact with internally matching hash', c => mutateRaw(c, r => { r.ordered_qty++; r.payload_hash = sha256(canonicalJson(Object.fromEntries(LINE_FIELDS.map(f => [f.name, r[f.name]])))); }), 'RETAINED_RAW_SOURCE_MISMATCH'],
  ['locator', c => mutateRaw(c, r => { r.record_locator = 'po_lines.jsonl:999'; }), 'RETAINED_RAW_SOURCE_MISMATCH'],
  ['source identity', c => mutateRaw(c, r => { r.source_package_hash = 'wrong'; }), 'RETAINED_RAW_IDENTITY_MISMATCH'],
  ['batch identity', c => mutateRaw(c, r => { r.batch_id = 'wrong'; }), 'RETAINED_RAW_IDENTITY_MISMATCH'],
  ['missing physical occurrence', c => c.rawRows.pop(), 'RETAINED_RAW_COUNT_MISMATCH'],
  ['extra physical occurrence', c => c.rawRows.push(structuredClone(c.rawRows[0])), 'RETAINED_RAW_COUNT_MISMATCH'],
  ['duplicate locator replacing missing row', c => { c.rawRows[1] = structuredClone(c.rawRows[0]); }, 'RETAINED_RAW_LOCATOR_MISMATCH'],
  ['invalid ingestion timestamp', c => mutateRaw(c, r => { r.ingested_at = 'invalid'; }), 'RETAINED_RAW_INGESTION_TIME_MISMATCH'],
  ['ingestion before resource existed', c => mutateRaw(c, r => { r.ingested_at = '2000-01-01T00:00:00Z'; }), 'RETAINED_RAW_INGESTION_TIME_MISMATCH'],
  ['ingestion after original load', c => mutateRaw(c, r => { r.ingested_at = new Date(Date.parse(c.manifest.firstResourceAt) + 2700).toISOString(); }), 'RETAINED_RAW_INGESTION_TIME_MISMATCH'],
  ['inconsistent table ingestion times', c => mutateRaw(c, r => { r.ingested_at = new Date(Date.parse(c.manifest.firstResourceAt) + 1100).toISOString(); }), 'RETAINED_RAW_INGESTION_TIME_MISMATCH'],
]) test(`retained raw tampering fails closed: ${label}`, async () => {
  const cloud = mockCloud({ correction: true, alreadyPublished: true }); change(cloud);
  await assert.rejects(runDelta({ cloud }), error => { assert.equal(error.code, code); noDownstream(error.cloud); assert.equal(error.attempt.delta_provenance, undefined); return true; });
});

for (const [label, change, code] of [
  ['failed load', m => { m.status.errorResult = { reason: 'invalid' }; }, 'PARENT_LOAD_NOT_SUCCESSFUL'],
  ['wrong location', m => { m.jobReference.location = 'US'; }, 'PARENT_LOAD_TARGET_MISMATCH'],
  ['wrong table', m => { m.configuration.load.destinationTable.tableId = 'other'; }, 'PARENT_LOAD_CONFIGURATION_MISMATCH'],
  ['wrong row count', m => { m.statistics.load.outputRows = '9'; }, 'PARENT_LOAD_ROW_COUNT_MISMATCH'],
  ['missing completion time', m => { delete m.statistics.endTime; }, 'INVALID_LOAD_JOB_TIME'],
  ['load created before resource existed', m => { m.statistics.creationTime = '0'; }, 'PARENT_LOAD_TIME_MISMATCH'],
]) test(`original accepted load metadata required: ${label}`, async () => {
  const cloud = mockCloud({ correction: true, alreadyPublished: true }); change(cloud.jobs.get(originalLoadIds(batchId).raw_lines).metadata);
  await assert.rejects(runDelta({ cloud }), error => { assert.equal(error.code, code); noDownstream(error.cloud); assert.ok(!cloud.calls.includes('read_parent_raw')); return true; });
});

test('expired resources stop before parent history queries or composition', async () => {
  const cloud = mockCloud({ correction: true, alreadyPublished: true }); cloud.manifest.absoluteExpiresAt = new Date(Date.now() - 1).toISOString();
  await assert.rejects(runDelta({ cloud }), error => { assert.equal(error.code, 'RESOURCE_LIFETIME_EXCEEDED'); assert.equal(cloud.calls.length, 0); return true; });
});

test('missing original load job is not created or replaced from local files', async () => {
  const cloud = mockCloud({ correction: true, alreadyPublished: true }); cloud.jobs.delete(originalLoadIds(batchId).raw_lines);
  await assert.rejects(runDelta({ cloud }), error => { assert.equal(error.code, 404); noDownstream(error.cloud); assert.ok(!cloud.calls.includes('read_parent_raw')); return true; });
});
