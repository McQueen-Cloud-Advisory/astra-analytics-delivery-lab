import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { TARGET, REQUIRED_TABLES } from './schemas.mjs';
import { PipelineError, requireThat, LIMITS, hash, batchIdentity, contextParams, publicationSql, publicationParams, decodeRows, validateCandidate, validatePublished } from './core.mjs';
import { composeIncrementalPackage } from '../data/retained-history.mjs';
import { canonicalJson } from '../data/source-package.mjs';
import { originalLoadIds, readOriginalLoadMetadata, reconstructRetainedParent, retainedRawSql } from './retained-cloud-history.mjs';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const safeBytes = value => { const n = Number(value); requireThat(value !== undefined && value !== null && Number.isSafeInteger(n) && n >= 0, 'UNKNOWN_QUERY_BYTES'); return n; };
function verifyJobTarget(metadata, jobId) {
  const r = metadata.jobReference;
  requireThat(r?.projectId === TARGET.projectId && r.location?.toLowerCase() === TARGET.location && r.jobId === jobId, 'JOB_TARGET_MISMATCH');
}
export async function findOrCreateJob(client, jobId, create, { sleep = delay, now = Date.now, onMetadata = async () => {} } = {}) {
  let job = client.job(jobId, { location: TARGET.location }), metadata;
  try { [metadata] = await job.getMetadata(); }
  catch (error) { if (Number(error.code) !== 404) throw error; }
  const reused = Boolean(metadata);
  if (!metadata) {
    // A create timeout never triggers another submission here. The known ID is retained for a later poll.
    [job] = await create();
  }
  const deadline = now() + 120000;
  while (true) {
    if (!metadata) [metadata] = await job.getMetadata();
    verifyJobTarget(metadata, jobId);
    await onMetadata(metadata);
    if (metadata.status?.state === 'DONE') {
      const reason = String(metadata.status.errorResult?.reason ?? 'unknown');
      requireThat(!metadata.status.errorResult, 'CLOUD_JOB_FAILED', /^[a-zA-Z0-9_]{1,80}$/.test(reason) ? reason : 'unknown');
      return { job, metadata, reused };
    }
    requireThat(now() < deadline, 'JOB_PENDING', jobId);
    await sleep(1000); metadata = undefined;
  }
}
export async function settlePriorJobs(client, priorAttempts, save) {
  for (const prior of priorAttempts) for (const entry of prior.jobs ?? []) {
    if (!entry.job_id || ['DONE', 'ABSENT_VERIFIED'].includes(entry.status)) continue;
    // Applies to reads/transforms as well as stable load/publication IDs. Never resubmit an uncertain earlier job.
    await findOrCreateJob(client, entry.job_id, async () => { throw new PipelineError('UNKNOWN_PRIOR_JOB', entry.job_id); }, {
      onMetadata: async metadata => { entry.status = metadata.status?.state ?? 'UNKNOWN'; await save(); },
    });
  }
}
const simpleSchema = fields => fields.map(f => ({ name: f.name, type: ({ INT64: 'INTEGER', BOOL: 'BOOLEAN' }[f.type] ?? f.type), mode: f.mode ?? 'NULLABLE' }));
export async function verifyResources(client, manifest, now = Date.now()) {
  requireThat(client.projectId === TARGET.projectId, 'CLIENT_TARGET_MISMATCH');
  requireThat(manifest?.version === '1.0' && manifest.projectId === TARGET.projectId && manifest.location === TARGET.location && manifest.serviceAccountEmail === TARGET.serviceAccount && manifest.approval === 'DEC-G5-001', 'RESOURCE_MANIFEST_TARGET');
  const first = Date.parse(manifest.firstResourceAt), absolute = Date.parse(manifest.absoluteExpiresAt);
  requireThat(Number.isFinite(first) && first <= now && absolute > now && absolute <= first + 14 * 86400000, 'RESOURCE_LIFETIME_EXCEEDED');
  for (const datasetId of [TARGET.workDataset, TARGET.servingDataset]) {
    const [metadata] = await client.dataset(datasetId).getMetadata();
    requireThat(metadata.datasetReference?.projectId === TARGET.projectId && metadata.datasetReference.datasetId === datasetId && metadata.location?.toLowerCase() === TARGET.location, 'DATASET_TARGET_MISMATCH');
  }
  let bytes = 0;
  for (const table of REQUIRED_TABLES) {
    const [metadata] = await client.dataset(table.datasetId).table(table.tableId).getMetadata();
    const ref = metadata.tableReference;
    requireThat(ref?.projectId === TARGET.projectId && ref.datasetId === table.datasetId && ref.tableId === table.tableId && metadata.type === 'TABLE', 'TABLE_TARGET_MISMATCH');
    requireThat(JSON.stringify(simpleSchema(metadata.schema?.fields ?? [])) === JSON.stringify(simpleSchema(table.schema.fields)), 'TABLE_SCHEMA_MISMATCH', table.tableId);
    const expiry = Number(metadata.expirationTime);
    const recorded = manifest.resources?.filter(r => r.kind === 'table' && r.datasetId === table.datasetId && r.tableId === table.tableId);
    requireThat(recorded?.length === 1 && recorded[0].status === 'verified' && expiry === Date.parse(recorded[0].expiresAt) && expiry > now && expiry <= absolute && (table.datasetId !== TARGET.workDataset || expiry <= first + 7 * 86400000), 'TABLE_EXPIRY_INVALID', table.tableId);
    bytes += safeBytes(metadata.numBytes);
  }
  requireThat(bytes <= 5 * LIMITS.queryBytes, 'STORAGE_LIMIT');
  return bytes;
}

export async function runCloudSlice({ client, source, oracle, batchId, transformSql, readSql, mode, attempt, save, directory, resourceManifest, stopBeforePublish = false, retainedBatch, deltaInput }) {
  requireThat(['execute', 'dry-run'].includes(mode), 'INVALID_CLOUD_MODE');
  requireThat(!stopBeforePublish || (mode === 'execute' && source.manifest.fixture_or_profile === 'FIX-02'), 'INVALID_CONTROLLED_STOP');
  requireThat(source.manifest.fixture_or_profile !== 'FIX-02' || retainedBatch?.source?.manifest?.fixture_or_profile === 'FIX-01', 'MISSING_RETAINED_BASELINE');
  requireThat(!deltaInput || (source.manifest.fixture_or_profile === 'FIX-02' && retainedBatch && !stopBeforePublish), 'INVALID_DELTA_MODE');
  attempt.stage = 'VERIFYING_RESOURCES'; await save();
  const currentStorage = await verifyResources(client, resourceManifest);
  attempt.stage = 'RESOURCES_VERIFIED'; await save();
  // Literal ten-line source, raw metadata and serving copies fit well below this conservative reservation.
  requireThat(currentStorage + 1024 ** 2 <= 5 * LIMITS.queryBytes, 'STORAGE_LIMIT');
  const transformHash = hash(transformSql), ctx = contextParams(source, batchId);
  const transformParams = { batch_id: batchId, business_as_of: ctx.business_as_of, knowledge_cutoff: ctx.knowledge_cutoff };
  let billed = 0;
  const query = async (stage, sql, params, { script = false, stable = false, dry = false } = {}) => {
    const remaining = LIMITS.attemptBytes - billed;
    const cap = Math.min(LIMITS.queryBytes, Math.floor(remaining / (script ? 4 : 1)));
    requireThat(cap > 0, 'ATTEMPT_BYTE_LIMIT');
    const queryConfig = { query: sql, params, location: TARGET.location, useLegacySql: false, maximumBytesBilled: String(cap),
      useQueryCache: false, labels: { experiment: 'opp02', slice: source.manifest.fixture_or_profile.toLowerCase().replace('-', ''), stage } };
    if (script) queryConfig.scriptOptions = { statementByteBudget: String(cap), statementTimeoutMs: '120000' };
    if (dry) {
      attempt.stage = `DRY_RUN_REQUEST:${stage}`; await save();
      const [job] = await client.createQueryJob({ ...queryConfig, dryRun: true });
      const metadata = job.metadata;
      // Dry-run jobs have no persistent job ID. Bind the request and explicit client project.
      requireThat(metadata?.configuration?.dryRun === true, 'NOT_A_DRY_RUN');
      const estimated = safeBytes(metadata.statistics?.totalBytesProcessed);
      requireThat(estimated <= remaining && estimated <= (script ? cap * 4 : cap), 'PROJECTED_BYTE_LIMIT');
      attempt.jobs.push({ stage, dry_run: true, estimated_bytes: estimated, maximum_bytes_billed: cap });
      attempt.stage = `DRY_RUN_COMPLETE:${stage}`; await save();
      return estimated;
    }
    const jobId = `po_${stage}_${batchId.slice(6, 38)}_${hash(sql).slice(0, 12)}${stable ? '' : `_${attempt.id}`}`;
    const entry = { stage, job_id: jobId, maximum_bytes_billed: cap, status: 'SUBMISSION_PENDING' };
    attempt.jobs.push(entry); await save();
    const { job, metadata } = await findOrCreateJob(client, jobId, () => client.createQueryJob({ ...queryConfig, jobId }), {
      onMetadata: async m => {
        requireThat(m.configuration?.query?.query === sql && safeBytes(m.configuration.query.maximumBytesBilled) <= cap, 'JOB_CONFIGURATION_MISMATCH');
        if (script) requireThat(safeBytes(m.configuration.query.scriptOptions?.statementByteBudget) <= cap, 'SCRIPT_CAP_MISSING');
        entry.status = m.status?.state ?? 'UNKNOWN'; await save();
      },
    });
    const actual = safeBytes(metadata.statistics?.query?.totalBytesBilled);
    billed += actual; entry.billed_bytes = actual; attempt.billed_bytes = billed; await save();
    requireThat(billed <= LIMITS.attemptBytes, 'ATTEMPT_BYTE_LIMIT');
    if (script) return [];
    const [rows] = await job.getQueryResults({ maxResults: 1000, autoPaginate: false });
    requireThat(rows.length < 1000, 'UNEXPECTED_RESULT_SIZE');
    return rows;
  };
  const reconcileRetained = async () => {
    if (!retainedBatch) return undefined;
    const rows = decodeRows(await query('read_retained', readSql, { batch_id: retainedBatch.batchId }));
    const candidate = validatePublished(rows, retainedBatch.source, retainedBatch.oracle, retainedBatch.batchId, transformHash);
    return { batch_id: retainedBatch.batchId, validation: 'PASS', line_count: candidate.lines.length, event_count: candidate.events.length };
  };

  // Before uploads: validate query syntax and conservative scan estimates against already provisioned tables.
  const readEstimate = await query('read_estimate', readSql, { batch_id: batchId }, { dry: true });
  const transformEstimate = await query('transform_estimate', transformSql, transformParams, { dry: true });
  const publishEstimate = await query('publish_estimate', publicationSql, { batch_id: batchId, lines_json: '[]', events_json: '[]', manifest_json: '[]' }, { dry: true, script: true });
  const rawEstimate = deltaInput ? await query('parent_raw_estimate', retainedRawSql, { batch_id: retainedBatch.batchId }, { dry: true }) : 0;
  const estimated = readEstimate * (deltaInput ? 4 : retainedBatch ? 3 : 2) + transformEstimate + publishEstimate + rawEstimate;
  requireThat(estimated <= LIMITS.attemptBytes, 'PROJECTED_ATTEMPT_LIMIT');
  if (mode === 'dry-run') return { outcome: 'DRY_RUN_ONLY', batch_id: batchId, estimated_bytes: estimated, google_sql_execution: 'Not Run', parent_history_verification: 'Not Run' };

  let deltaEvidence;
  if (deltaInput) {
    attempt.stage = 'VERIFYING_ACCEPTED_PARENT'; await save();
    const parentRows = decodeRows(await query('read_parent', readSql, { batch_id: retainedBatch.batchId }));
    validatePublished(parentRows, retainedBatch.source, retainedBatch.oracle, retainedBatch.batchId, transformHash);
    attempt.parent_load_job_ids = originalLoadIds(retainedBatch.batchId); await save();
    const loadJobs = await readOriginalLoadMetadata(client, retainedBatch, resourceManifest);
    const rawRows = await query('read_parent_raw', retainedRawSql, { batch_id: retainedBatch.batchId });
    const reconstructed = reconstructRetainedParent({ rows: rawRows, pinnedParent: deltaInput.pinnedParent, parentBatchId: retainedBatch.batchId,
      publishedAt: parentRows.manifests[0].published_at, loadJobs, resourceManifest });
    const composed = composeIncrementalPackage({ parent: reconstructed.parent, delta: deltaInput.envelope });
    requireThat(composed.source.sourcePackageHash === source.sourcePackageHash && batchIdentity(composed.source) === batchId, 'DELTA_RESOLVED_IDENTITY_MISMATCH');
    source = composed.source;
    const binding = {
      version: 'RUNTIME-RETAINED-PARENT-v1.0', verification: 'PASS', verified_at_utc: new Date().toISOString(),
      project_id: TARGET.projectId, location: TARGET.location, runtime_identity: TARGET.serviceAccount,
      parent_batch_id: retainedBatch.batchId, parent_source_package_hash: retainedBatch.source.sourcePackageHash,
      parent_published_at: parentRows.manifests[0].published_at, parent_status: 'READY', parent_validation_result: 'PASS',
      parent_read_job_id: attempt.jobs.find(j => j.stage === 'read_parent' && j.job_id).job_id,
      parent_raw_read_job_id: attempt.jobs.find(j => j.stage === 'read_parent_raw' && j.job_id).job_id,
      original_load_jobs: loadJobs,
      raw_table_expirations: resourceManifest.resources.filter(r => r.kind === 'table' && r.datasetId === TARGET.workDataset)
        .map(r => ({ dataset_id: r.datasetId, table_id: r.tableId, expires_at_utc: r.expiresAt })),
      physical_occurrence_evidence: reconstructed.physical_occurrence_evidence,
    };
    const provenance = { composition: composed.composition, cloud_parent_binding: binding };
    deltaEvidence = { ...provenance, provenance_hash: hash(canonicalJson(provenance)) };
    // Durable evidence must succeed before existing-target reconciliation or any
    // downstream load/publication. No caller-provided READY flag is consulted.
    attempt.delta_provenance = deltaEvidence; attempt.stage = 'DELTA_PARENT_VERIFIED_AND_COMPOSED'; await save();
  }
  const deltaStatus = deltaEvidence ? { parent_history_verification: 'Pass', runtime_composition: 'Pass' } : {};

  const previous = decodeRows(await query('read_before', readSql, { batch_id: batchId }));
  if (previous.lines.length || previous.events.length || previous.manifests.length) {
    validatePublished(previous, source, oracle, batchId, transformHash);
    const retained = await reconcileRetained();
    return { outcome: 'VERIFIED_NO_OP', batch_id: batchId, billed_bytes: billed, line_count: previous.lines.length, publication: 'Pass',
      publication_action: 'EXISTING_BATCH_VERIFIED', new_batch_published: false, retained_batch: retained, delta_provenance: deltaEvidence, ...deltaStatus };
  }
  for (const [tableId, records] of [['raw_lines', source.physicalLines], ['raw_event_versions', source.physicalEvents]]) {
    const path = join(directory, `${batchId}-${tableId}.jsonl`), jobId = `po_load_${tableId}_${batchId.slice(6, 54)}`;
    const ingestedAt = new Date().toISOString();
    await writeFile(path, records.map(r => JSON.stringify({ ...r.record, batch_id: batchId, source_package_hash: source.sourcePackageHash, record_locator: r.recordLocator, payload_hash: r.payloadHash, ingested_at: ingestedAt })).join('\n') + '\n');
    const entry = { stage: `load_${tableId}`, job_id: jobId, status: 'SUBMISSION_PENDING' }; attempt.jobs.push(entry); await save();
    const config = { jobId, location: TARGET.location, sourceFormat: 'NEWLINE_DELIMITED_JSON', createDisposition: 'CREATE_NEVER', writeDisposition: 'WRITE_APPEND', autodetect: false, ignoreUnknownValues: false, maxBadRecords: 0 };
    const { metadata, reused } = await findOrCreateJob(client, jobId, () => client.dataset(TARGET.workDataset).table(tableId).createLoadJob(path, config), {
      onMetadata: async m => {
        const c = m.configuration?.load, d = c?.destinationTable;
        requireThat(d?.projectId === TARGET.projectId && d.datasetId === TARGET.workDataset && d.tableId === tableId && c.createDisposition === 'CREATE_NEVER' && c.writeDisposition === 'WRITE_APPEND', 'LOAD_CONFIGURATION_MISMATCH');
        entry.status = m.status?.state ?? 'UNKNOWN'; await save();
      },
    });
    requireThat(Number(metadata.statistics?.load?.outputRows) === records.length, 'LOAD_ROW_COUNT_MISMATCH');
    entry.output_rows = records.length; entry.reused_existing_job = reused; await save();
  }
  // Re-estimate after uploads; estimates against empty tables were not evidence of populated scan cost.
  await query('populated_estimate', transformSql, transformParams, { dry: true });
  const candidate = validateCandidate(decodeRows(await query('transform', transformSql, transformParams)), source, oracle);
  attempt.validation = 'PASS'; await save();
  if (stopBeforePublish) {
    const retained = await reconcileRetained();
    attempt.stage = 'CONTROLLED_STOP_BEFORE_PUBLICATION'; await save();
    return { outcome: 'CONTROLLED_STOP_BEFORE_PUBLICATION', batch_id: batchId, candidate_validation: 'PASS', publication: 'Not Run', expected_controlled_stop: true,
      billed_bytes: billed, retained_batch: retained, desktop_verification: 'Not Run' };
  }
  const publishParams = publicationParams(candidate, source, batchId, transformHash);
  await query('publish_final_estimate', publicationSql, publishParams, { dry: true, script: true });
  await query('publish', publicationSql, publishParams, { script: true, stable: true });
  const published = decodeRows(await query('read_after', readSql, { batch_id: batchId }));
  validatePublished(published, source, oracle, batchId, transformHash);
  const retained = await reconcileRetained();
  return { outcome: 'PUBLISHED_AND_RECONCILED', batch_id: batchId, line_count: candidate.lines.length, event_count: candidate.events.length, billed_bytes: billed,
    validation: 'PASS', publication: 'Pass', publication_action: 'NEW_BATCH_PUBLISHED', new_batch_published: true,
    retained_batch: retained, delta_provenance: deltaEvidence, ...deltaStatus, desktop_verification: 'Not Run' };
}
