import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { canonicalJson, validateSourcePackage } from '../data/source-package.mjs';
import { VALIDATION_CASES } from '../data/validation-cases.mjs';
import { TARGET, LINE_FIELDS, EVENT_FIELDS } from './schemas.mjs';
import { LIMITS, PipelineError, requireThat, hash, batchIdentity, decodeRows, validateCandidate, validatePublished } from './core.mjs';
import { findOrCreateJob, verifyResources } from './bigquery.mjs';

export const SUITE_VERSION = 'FIX02-FIX04-v1.1';
const MiB = 1024 ** 2;
const transformPin = '22152ebc8fd883f5185ee31305a5a7339250611957b6e8dcb441470715b104bb';
const readPin = '45589f992a71fb296b3c8a2102314a77311c3c3b1ca3510ec0210973a092d4fa';
const parentPin = 'd770f164353581d3c890d5bba4ca47b6ebef38142dbb36988c1a2807970a9c6f';
export const RAW_RECONCILIATION_SQL = `SELECT 'LINE' AS row_kind, TO_JSON_STRING(r) AS row_json
FROM \`${TARGET.projectId}.${TARGET.workDataset}.raw_lines\` r WHERE batch_id IN UNNEST(@batch_ids)
UNION ALL
SELECT 'EVENT' AS row_kind, TO_JSON_STRING(r) AS row_json
FROM \`${TARGET.projectId}.${TARGET.workDataset}.raw_event_versions\` r WHERE batch_id IN UNNEST(@batch_ids)`;
export const LIMIT_CONTROL_SQL = `SELECT line_id FROM \`${TARGET.projectId}.${TARGET.workDataset}.raw_lines\` WHERE batch_id = @batch_id`;
const bytes = value => {
  const n = Number(value);
  requireThat(value !== undefined && value !== null && Number.isSafeInteger(n) && n >= 0, 'UNKNOWN_QUERY_BYTES');
  return n;
};
const snapshotHash = result => hash(canonicalJson(Object.fromEntries(Object.entries(result).map(([kind, rows]) =>
  [kind, [...rows].sort((a, b) => canonicalJson(a).localeCompare(canonicalJson(b)))]))));
const limitMessage = value => typeof value === 'string' && /Query exceeded limit for bytes billed(?:\b|:)/.test(value);
const limitPolicy = 'https://docs.cloud.google.com/bigquery/docs/best-practices-costs#restrict_the_number_of_bytes_billed_per_query';
function verifyQueryConfiguration(metadata, spec, cap) {
  const q = metadata.configuration?.query;
  requireThat(q?.query === spec.sql && q.useLegacySql === false && q.useQueryCache === false && bytes(q.maximumBytesBilled) <= cap,
    'JOB_CONFIGURATION_MISMATCH');
  const parameters = Object.fromEntries((q.queryParameters ?? []).map(p => [p.name,
    p.parameterType?.type === 'ARRAY' ? p.parameterValue?.arrayValues?.map(v => v.value) : p.parameterValue?.value]));
  requireThat(isDeepStrictEqual(parameters, spec.params), 'JOB_PARAMETER_MISMATCH');
}

// Pure, read-only evidence classifier. A service-policy inference never fills in
// missing billing statistics or changes the original failed attempt/reservation.
export function classifyLimitProbeMetadata({ metadata, jobId, batchId }) {
  const ref = metadata?.jobReference;
  requireThat(ref?.projectId === TARGET.projectId && ref.location?.toLowerCase() === TARGET.location && ref.jobId === jobId,
    'JOB_TARGET_MISMATCH');
  requireThat(metadata.status?.state === 'DONE', 'LIMIT_CONTROL_JOB_UNSETTLED');
  verifyQueryConfiguration(metadata, { sql: LIMIT_CONTROL_SQL, params: { batch_id: batchId } }, 1);
  requireThat(metadata.configuration.dryRun !== true && bytes(metadata.configuration.query.maximumBytesBilled) === 1,
    'JOB_CONFIGURATION_MISMATCH');
  const parameters = metadata.configuration.query.queryParameters;
  requireThat(parameters.length === 1 && parameters[0].name === 'batch_id' && parameters[0].parameterType?.type === 'STRING',
    'JOB_PARAMETER_MISMATCH');
  const failure = metadata.status.errorResult;
  // bytesBilledLimitExceeded is the observed service response. Retain compatibility
  // with billing-tier spelling only with the exact bytes-limit message and probe binding;
  // an unrelated billingTierLimitExceeded error cannot satisfy this control.
  requireThat(['bytesBilledLimitExceeded', 'billingTierLimitExceeded'].includes(failure?.reason) && limitMessage(failure?.message),
    'UNEXPECTED_LIMIT_CONTROL_RESULT');
  const nullableBytes = value => value === undefined || value === null ? null : bytes(value);
  const billed = nullableBytes(metadata.statistics?.query?.totalBytesBilled);
  const processed = nullableBytes(metadata.statistics?.query?.totalBytesProcessed ?? metadata.statistics?.totalBytesProcessed);
  requireThat(billed === null || billed === 0, 'LIMIT_CONTROL_BILLED_BYTES');
  return { status: 'PASS', job_id: jobId, job_status: 'DONE', maximum_bytes_billed: 1,
    failure_reason: failure.reason, expected_rejection_verified: true, billed_bytes: billed, processed_bytes: processed,
    billing_observation: billed === null ? 'NOT_REPORTED' : 'REPORTED_ZERO',
    observation: 'Known job metadata verifies the exact maximum-bytes rejection',
    charge_assessment: { basis: 'DOCUMENTED_SERVICE_POLICY_INFERENCE', expected_query_charge: 'No query charge',
      source_url: limitPolicy, invoice_verified: false } };
}

// All source cases and independent expectations are read/pinned by the local catalog.
// This prepares one sealed suite, not an unbounded wrapper around pipeline starts.
export function prepareValidationSuite({ cases, baselineSource, baselineOracle, transformSql, readSql, codeHashes = {} }) {
  requireThat(hash(transformSql) === transformPin && hash(readSql) === readPin && baselineSource.sourcePackageHash === parentPin, 'SUITE_BASELINE_MISMATCH');
  requireThat(cases.length === 17 && cases.every((c, index) => c.caseId === VALIDATION_CASES[index].caseId &&
    c.sourcePackageHash === VALIDATION_CASES[index].sourcePackageHash && c.expectedSha256 === VALIDATION_CASES[index].expectedSha256 &&
    c.outcome === VALIDATION_CASES[index].outcome && c.rejectionStage === VALIDATION_CASES[index].rejectionStage &&
    c.rejectionCode === VALIDATION_CASES[index].rejectionCode), 'SUITE_CATALOG_MISMATCH');
  const prepared = cases.map(c => {
    let source;
    try { source = validateSourcePackage(c.package); }
    catch (error) {
      requireThat(c.rejectionStage === 'ADMISSION' && error.name === 'SourceValidationError' && error.code === c.rejectionCode,
        'UNEXPECTED_ADMISSION_RESULT', c.caseId);
      return { ...c, admission: { status: 'PASS', observed: 'REJECT', code: error.code, locator: error.locator } };
    }
    requireThat(c.rejectionStage !== 'ADMISSION', 'EXPECTED_ADMISSION_REJECTION_MISSING', c.caseId);
    requireThat(source.sourcePackageHash === c.sourcePackageHash, 'SUITE_SOURCE_MISMATCH', c.caseId);
    const batchId = `validation_${c.caseId.toLowerCase().replaceAll('-', '_')}_${hash([SUITE_VERSION, c.caseId, source.sourcePackageHash].join('|'))}`;
    return { ...c, source, batchId, admission: { status: 'PASS', observed: 'ACCEPT' } };
  });
  const admitted = prepared.filter(c => c.source);
  const raw = Object.fromEntries([['raw_lines', 'physicalLines'], ['raw_event_versions', 'physicalEvents']].map(([table, field]) =>
    [table, admitted.flatMap(c => c.source[field].map(r => ({ ...r.record, batch_id: c.batchId,
      source_package_hash: c.source.sourcePackageHash, record_locator: r.recordLocator, payload_hash: r.payloadHash })))]));
  requireThat(admitted.length === 9 && prepared.filter(c => !c.source).length === 8 && raw.raw_lines.length === 90 && raw.raw_event_versions.length === 96,
    'SUITE_COUNT_MISMATCH');
  const identity = { version: SUITE_VERSION, transform_sha256: hash(transformSql), read_sha256: hash(readSql),
    candidate_replay: { case_id: 'FIX-03-D', stage: 'fix_03_d_replay', repeats: 1 },
    cases: prepared.map(c => ({ case_id: c.caseId, source_package_hash: c.sourcePackageHash, expected_sha256: c.expectedSha256,
      expected_outcome: c.outcome, rejection_stage: c.rejectionStage, rejection_code: c.rejectionCode, batch_id: c.batchId ?? null })) };
  return { identity, suiteId: `validation_suite_${hash(canonicalJson(identity))}`, cases: prepared, admitted, raw,
    baselineSource, baselineOracle, baselineBatchId: batchIdentity(baselineSource), transformSql, readSql, codeHashes };
}

export function validationSuitePlan(suite) {
  return { mode: 'plan', suite_id: suite.suiteId, ...suite.identity, code_sha256: suite.codeHashes, target: TARGET,
    work_upload_counts: { raw_lines: suite.raw.raw_lines.length, raw_event_versions: suite.raw.raw_event_versions.length },
    local_admission: suite.cases.map(c => ({ case_id: c.caseId, ...c.admission })), retained_batch_id: suite.baselineBatchId,
    bounds: LIMITS, cloud_execution: 'Not Run', serving_publication: 'Not Run', desktop_verification: 'Not Run',
    scope: 'One reserved validation attempt; work-only loads and production SQL candidate checks. No serving publication or delta/DAX acceptance.' };
}

function normalizedRaw(row, fields) {
  return Object.fromEntries(fields.map(({ name, type }) => {
    let value = row[name];
    if (value !== null && type === 'TIMESTAMP') {
      requireThat(Number.isFinite(Date.parse(value)), 'RAW_RECONCILIATION_MISMATCH');
      value = new Date(value).toISOString().replace('.000Z', 'Z');
    }
    if (value !== null && type === 'INTEGER' && typeof value === 'string') value = Number(value);
    requireThat(value !== undefined, 'RAW_RECONCILIATION_MISMATCH');
    return [name, value];
  }));
}

export function reconcileRawOccurrences(rows, suite) {
  const decoded = decodeRows(rows);
  requireThat(decoded.manifests.length === 0, 'RAW_RECONCILIATION_MISMATCH');
  for (const [kind, table, fields] of [['lines', 'raw_lines', LINE_FIELDS], ['events', 'raw_event_versions', EVENT_FIELDS]]) {
    const expected = new Map(suite.raw[table].map(row => [`${row.batch_id}|${row.record_locator}`, row]));
    requireThat(decoded[kind].length === expected.size, 'RAW_RECONCILIATION_MISMATCH', kind);
    for (const row of decoded[kind]) {
      const key = `${row.batch_id}|${row.record_locator}`, wanted = expected.get(key);
      requireThat(wanted && row.source_package_hash === wanted.source_package_hash && row.payload_hash === wanted.payload_hash &&
        Number.isFinite(Date.parse(row.ingested_at)), 'RAW_RECONCILIATION_MISMATCH', kind);
      requireThat(isDeepStrictEqual(normalizedRaw(row, fields), Object.fromEntries(fields.map(f => [f.name, wanted[f.name]]))),
        'RAW_RECONCILIATION_MISMATCH', kind);
      expected.delete(key);
    }
    requireThat(expected.size === 0, 'RAW_RECONCILIATION_MISMATCH', kind);
  }
  return decoded;
}

export async function runValidationSuite({ client, suite, attempt, save, directory, resourceManifest }) {
  requireThat(attempt.mode === 'validation-suite' && attempt.reserved_bytes === LIMITS.attemptBytes && attempt.batch_id === suite.suiteId,
    'SUITE_ATTEMPT_REQUIRED');
  attempt.suite_id = suite.suiteId; attempt.suite_identity = suite.identity; attempt.code_sha256 = suite.codeHashes;
  attempt.case_results = suite.cases.map(c => ({ case_id: c.caseId, expected_outcome: c.outcome, expected_stage: c.rejectionStage,
    expected_code: c.rejectionCode, admission: c.admission, status: 'Not Run' }));
  await save();
  const storage = await verifyResources(client, resourceManifest);
  requireThat(storage + 2 * MiB <= 5 * LIMITS.queryBytes, 'STORAGE_LIMIT');
  let billed = 0;
  const replayCase = suite.admitted.find(c => c.caseId === suite.identity.candidate_replay.case_id);
  const specs = [
    { stage: 'baseline_before', sql: suite.readSql, params: { batch_id: suite.baselineBatchId }, tables: 3 },
    { stage: 'raw_reconcile', sql: RAW_RECONCILIATION_SQL, params: { batch_ids: suite.admitted.map(c => c.batchId) }, tables: 2 },
    ...suite.admitted.map(c => ({ stage: c.caseId.toLowerCase().replaceAll('-', '_'), caseId: c.caseId, sql: suite.transformSql,
      params: { batch_id: c.batchId, business_as_of: c.source.manifest.business_as_of, knowledge_cutoff: c.source.manifest.knowledge_cutoff }, tables: 2 })),
    { stage: suite.identity.candidate_replay.stage, sql: suite.transformSql,
      params: { batch_id: replayCase.batchId, business_as_of: replayCase.source.manifest.business_as_of,
        knowledge_cutoff: replayCase.source.manifest.knowledge_cutoff }, tables: 2 },
    { stage: 'baseline_after', sql: suite.readSql, params: { batch_id: suite.baselineBatchId }, tables: 3 },
    { stage: 'limit_control', sql: LIMIT_CONTROL_SQL, params: { batch_id: suite.admitted[0].batchId }, tables: 1 },
  ];
  const configFor = (spec, cap) => ({ query: spec.sql, params: spec.params, location: TARGET.location, useLegacySql: false,
    maximumBytesBilled: String(cap), useQueryCache: false, labels: { experiment: 'opp02', slice: 'validation', stage: spec.stage } });
  const preflight = async (selected, phase) => {
    let projected = billed;
    for (const spec of selected) {
      const [job] = await client.createQueryJob({ ...configFor(spec, LIMITS.queryBytes), dryRun: true });
      requireThat(job.metadata?.configuration?.dryRun === true, 'NOT_A_DRY_RUN');
      const estimate = bytes(job.metadata.statistics?.totalBytesProcessed);
      if (phase === 'populated' && spec.stage === 'limit_control') requireThat(estimate > 1, 'LIMIT_CONTROL_UNTESTABLE');
      // On-demand minimums apply per referenced table, even to these tiny inputs.
      const conservative = Math.max(estimate, spec.tables * 10 * MiB);
      requireThat(conservative <= LIMITS.queryBytes, 'PROJECTED_BYTE_LIMIT');
      projected += conservative;
      requireThat(projected <= LIMITS.attemptBytes, 'PROJECTED_ATTEMPT_LIMIT');
      attempt.jobs.push({ stage: `${phase}_${spec.stage}`, dry_run: true, estimated_bytes: estimate,
        conservative_projected_bytes: conservative, maximum_bytes_billed: LIMITS.queryBytes });
      await save();
    }
    attempt.projected_billed_bytes = projected; await save();
    return projected;
  };
  const query = async spec => {
    const cap = Math.min(LIMITS.queryBytes, LIMITS.attemptBytes - billed);
    requireThat(cap >= spec.tables * 10 * MiB, 'ATTEMPT_BYTE_LIMIT');
    const jobId = `po_val_${spec.stage}_${hash(canonicalJson([suite.suiteId, spec.sql, spec.params])).slice(0, 20)}_${attempt.id}`;
    const entry = { stage: spec.stage, job_id: jobId, maximum_bytes_billed: cap, status: 'SUBMISSION_PENDING' };
    attempt.jobs.push(entry); attempt.stage = spec.stage; await save();
    const { job, metadata } = await findOrCreateJob(client, jobId, () => client.createQueryJob({ ...configFor(spec, cap), jobId }), {
      onMetadata: async m => { verifyQueryConfiguration(m, spec, cap); entry.status = m.status?.state ?? 'UNKNOWN'; await save(); },
    });
    const actual = bytes(metadata.statistics?.query?.totalBytesBilled);
    billed += actual;
    entry.billed_bytes = actual; attempt.billed_bytes = billed; await save();
    requireThat(actual <= cap, 'QUERY_BYTE_LIMIT');
    requireThat(billed <= LIMITS.attemptBytes, 'ATTEMPT_BYTE_LIMIT');
    const [rows] = await job.getQueryResults({ maxResults: 1000, autoPaginate: false });
    requireThat(rows.length < 1000, 'UNEXPECTED_RESULT_SIZE');
    return rows;
  };
  await preflight(specs, 'preload');
  const before = decodeRows(await query(specs[0]));
  validatePublished(before, suite.baselineSource, suite.baselineOracle, suite.baselineBatchId, hash(suite.transformSql));
  attempt.retained_before = before; await save();
  // Bracket actual expected admission failures with last-good cloud reads.
  for (const c of suite.cases.filter(row => !row.source)) {
    let observed;
    try { validateSourcePackage(c.package); }
    catch (error) { if (error.name === 'SourceValidationError') observed = error; else throw error; }
    requireThat(observed?.code === c.rejectionCode, 'UNEXPECTED_ADMISSION_RESULT', c.caseId);
    Object.assign(attempt.case_results.find(row => row.case_id === c.caseId), { observed_outcome: 'REJECT',
      observed_code: observed.code, record_locator: observed.locator, checked_at_utc: new Date().toISOString(), status: 'PASS' });
    await save();
  }

  for (const tableId of ['raw_lines', 'raw_event_versions']) {
    const records = suite.raw[tableId], payloadIdentity = hash(canonicalJson(records));
    const jobId = `po_val_load_${tableId}_${payloadIdentity.slice(0, 48)}`;
    const file = join(directory, `${attempt.id}-${tableId}.jsonl`), ingestedAt = new Date().toISOString();
    const text = records.map(r => JSON.stringify({ ...r, ingested_at: ingestedAt })).join('\n') + '\n';
    requireThat(Buffer.byteLength(text) <= 100 * MiB, 'SOURCE_LIMIT');
    await writeFile(file, text, { flag: 'wx' });
    const entry = { stage: `load_${tableId}`, job_id: jobId, physical_identity_sha256: payloadIdentity,
      upload_sha256: hash(text), status: 'SUBMISSION_PENDING' };
    attempt.jobs.push(entry); await save();
    const config = { jobId, location: TARGET.location, sourceFormat: 'NEWLINE_DELIMITED_JSON', createDisposition: 'CREATE_NEVER',
      writeDisposition: 'WRITE_APPEND', autodetect: false, ignoreUnknownValues: false, maxBadRecords: 0 };
    const { metadata, reused } = await findOrCreateJob(client, jobId,
      () => client.dataset(TARGET.workDataset).table(tableId).createLoadJob(file, config), {
        onMetadata: async m => {
          const q = m.configuration?.load, d = q?.destinationTable;
          requireThat(d?.projectId === TARGET.projectId && d.datasetId === TARGET.workDataset && d.tableId === tableId &&
            q.createDisposition === 'CREATE_NEVER' && q.writeDisposition === 'WRITE_APPEND' && q.sourceFormat === 'NEWLINE_DELIMITED_JSON' &&
            !q.autodetect && !q.ignoreUnknownValues && Number(q.maxBadRecords ?? 0) === 0, 'LOAD_CONFIGURATION_MISMATCH');
          entry.status = m.status?.state ?? 'UNKNOWN'; await save();
        },
      });
    requireThat(bytes(metadata.statistics?.load?.outputRows) === records.length, 'LOAD_ROW_COUNT_MISMATCH');
    entry.output_rows = records.length; entry.reused_existing_job = reused; await save();
  }
  // All remaining scans are estimated again against populated work tables.
  await preflight(specs.slice(1), 'populated');
  attempt.raw_occurrences = reconcileRawOccurrences(await query(specs[1]), suite); await save();
  for (const spec of specs.filter(s => s.caseId)) {
    const c = suite.admitted.find(row => row.caseId === spec.caseId), record = attempt.case_results.find(row => row.case_id === c.caseId);
    const actual = decodeRows(await query(spec)); record.actual_candidate = actual; await save();
    let rejection;
    try { validateCandidate(actual, c.source, c.expected); }
    catch (error) {
      requireThat(c.rejectionStage === 'RECONCILIATION' && error instanceof PipelineError && error.code === c.rejectionCode,
        'UNEXPECTED_CANDIDATE_RESULT', c.caseId);
      requireThat(c.caseId !== 'FIX-03-H' || error.message === 'GOLDEN_MISMATCH: event/version identities',
        'UNEXPECTED_CANDIDATE_RESULT', c.caseId);
      rejection = error.code;
    }
    requireThat(c.outcome === 'ACCEPT' ? !rejection : rejection === c.rejectionCode, 'EXPECTED_RECONCILIATION_REJECTION_MISSING', c.caseId);
    record.observed_outcome = rejection ? 'REJECT' : 'ACCEPT'; record.observed_code = rejection ?? null; record.status = 'PASS'; await save();
  }

  // Repeat the identical D candidate SELECT under a distinct known job ID.
  // The existing physical rows are reused; this is no additional upload/publication.
  const replay = decodeRows(await query(specs.find(s => s.stage === suite.identity.candidate_replay.stage)));
  validateCandidate(replay, replayCase.source, replayCase.expected);
  const original = attempt.case_results.find(c => c.case_id === replayCase.caseId).actual_candidate;
  requireThat(snapshotHash(original) === snapshotHash(replay), 'CANDIDATE_REPLAY_CHANGED');
  attempt.candidate_replay = { case_id: replayCase.caseId, status: 'PASS', actual_candidate: replay, sha256: snapshotHash(replay) };
  await save();

  // Preserve the complete case/last-good proof before the final read-only control
  // probe, which may legitimately stop if the service omits required evidence.
  const after = decodeRows(await query(specs.find(s => s.stage === 'baseline_after')));
  validatePublished(after, suite.baselineSource, suite.baselineOracle, suite.baselineBatchId, hash(suite.transformSql));
  requireThat(snapshotHash(before) === snapshotHash(after), 'LAST_GOOD_CHANGED');
  attempt.retained_after = after; await save();

  // Deliberately lower the cap on an ordinary tiny-table SELECT. No large scan.
  const spec = specs.at(-1), jobId = `po_val_limit_${hash(suite.suiteId).slice(0, 20)}_${attempt.id}`;
  const entry = { stage: 'limit_control', job_id: jobId, maximum_bytes_billed: 1, status: 'SUBMISSION_PENDING' };
  attempt.jobs.push(entry); await save();
  let controlResult;
  try {
    await findOrCreateJob(client, jobId, () => client.createQueryJob({ ...configFor(spec, 1), jobId }), {
      onMetadata: async m => { verifyQueryConfiguration(m, spec, 1); entry.status = m.status?.state ?? 'UNKNOWN'; await save(); },
    });
    throw new PipelineError('LIMIT_CONTROL_NOT_ENFORCED');
  } catch (error) {
    // The SDK can reject createQueryJob before onMetadata even though the service
    // persisted the failed job. Always read the known ID; never submit it again.
    let metadata;
    try { [metadata] = await client.job(jobId, { location: TARGET.location }).getMetadata(); }
    catch (lookup) {
      requireThat(Number(lookup.code) === 404, 'LIMIT_CONTROL_JOB_UNSETTLED');
      requireThat(Number(error.code) === 400 && (limitMessage(error.message) || error.errors?.some(e => limitMessage(e.message))),
        'UNEXPECTED_LIMIT_CONTROL_RESULT');
      controlResult = { status: 'PASS', job_id: jobId, job_status: 'ABSENT_VERIFIED', maximum_bytes_billed: 1,
        failure_reason: 'bytes_billed_limit', expected_rejection_verified: true, billed_bytes: null, processed_bytes: null,
        billing_observation: 'NO_JOB_STATISTICS', observation: 'Server rejected request; known job confirmed absent',
        charge_assessment: { basis: 'DOCUMENTED_SERVICE_POLICY_INFERENCE', expected_query_charge: 'No query charge',
          source_url: limitPolicy, invoice_verified: false } };
    }
    if (metadata) controlResult = classifyLimitProbeMetadata({ metadata, jobId, batchId: spec.params.batch_id });
  }
  Object.assign(entry, controlResult, { status: controlResult.job_status }); await save();
  return { outcome: 'VALIDATION_SUITE_PASS', suite_id: suite.suiteId, suite_identity: suite.identity, code_sha256: suite.codeHashes,
    cases: attempt.case_results, candidate_replay: attempt.candidate_replay,
    raw_occurrences: attempt.raw_occurrences, work_upload_counts: validationSuitePlan(suite).work_upload_counts,
    retained_batch: { batch_id: suite.baselineBatchId, validation: 'PASS', before, after, sha256: snapshotHash(after) },
    limit_control: controlResult, billed_bytes: billed,
    billed_bytes_scope: 'Sum of reported successful-query billed bytes; absent probe statistics remain null',
    serving_publication: 'Not Run', desktop_verification: 'Not Run',
    scope: 'Work-only candidate validation; not case serving publication, delta acceptance or DAX/host proof.' };
}
