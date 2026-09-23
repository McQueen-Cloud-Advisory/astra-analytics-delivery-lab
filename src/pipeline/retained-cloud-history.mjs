import { isDeepStrictEqual } from 'node:util';
import { canonicalJson, sha256, validateSourcePackage } from '../data/source-package.mjs';
import { LINE_FIELDS, EVENT_FIELDS, TARGET } from './schemas.mjs';
import { requireThat } from './core.mjs';

// All physical occurrences are read, including conflicting hashes or repeated
// locators. Filtering these away would hide corruption in retained history.
export const retainedRawSql = `SELECT 'RAW_LINE' AS row_kind, TO_JSON_STRING(r) AS row_json
FROM \`${TARGET.projectId}.po_work.raw_lines\` r WHERE batch_id = @batch_id
UNION ALL
SELECT 'RAW_EVENT' AS row_kind, TO_JSON_STRING(r) AS row_json
FROM \`${TARGET.projectId}.po_work.raw_event_versions\` r WHERE batch_id = @batch_id`;

export function originalLoadIds(parentBatchId) {
  return Object.fromEntries(['raw_lines', 'raw_event_versions'].map(table => [table, `po_load_${table}_${parentBatchId.slice(6, 54)}`]));
}
function milliseconds(value) {
  const number = Number(value);
  requireThat(value !== undefined && value !== null && Number.isSafeInteger(number) && number >= 0, 'INVALID_LOAD_JOB_TIME');
  return number;
}
export async function readOriginalLoadMetadata(client, parent, resourceManifest) {
  const ids = originalLoadIds(parent.batchId), result = {};
  for (const [table, jobId] of Object.entries(ids)) {
    const [metadata] = await client.job(jobId, { location: TARGET.location }).getMetadata();
    const reference = metadata.jobReference, config = metadata.configuration?.load, destination = config?.destinationTable;
    requireThat(reference?.projectId === TARGET.projectId && reference.location?.toLowerCase() === TARGET.location && reference.jobId === jobId, 'PARENT_LOAD_TARGET_MISMATCH');
    requireThat(metadata.status?.state === 'DONE' && !metadata.status.errorResult, 'PARENT_LOAD_NOT_SUCCESSFUL');
    requireThat(destination?.projectId === TARGET.projectId && destination.datasetId === TARGET.workDataset && destination.tableId === table &&
      config.createDisposition === 'CREATE_NEVER' && config.writeDisposition === 'WRITE_APPEND' && config.sourceFormat === 'NEWLINE_DELIMITED_JSON', 'PARENT_LOAD_CONFIGURATION_MISMATCH');
    const rows = table === 'raw_lines' ? parent.source.physicalCounts.lines : parent.source.physicalCounts.events;
    requireThat(Number(metadata.statistics?.load?.outputRows) === rows, 'PARENT_LOAD_ROW_COUNT_MISMATCH');
    const created = milliseconds(metadata.statistics?.creationTime), started = milliseconds(metadata.statistics?.startTime), ended = milliseconds(metadata.statistics?.endTime);
    requireThat(created >= Date.parse(resourceManifest.firstResourceAt) && started >= created && ended >= started && ended <= Date.now(), 'PARENT_LOAD_TIME_MISMATCH');
    result[table] = { job_id: jobId, project_id: reference.projectId, location: reference.location.toLowerCase(), table_id: table, output_rows: rows,
      creation_time_utc: new Date(created).toISOString(), start_time_utc: new Date(started).toISOString(), end_time_utc: new Date(ended).toISOString(), status: 'DONE' };
  }
  return result;
}
function sourceRecord(row, fields) {
  return Object.fromEntries(fields.map(({ name, type }) => {
    let value = row[name];
    requireThat(value !== undefined, 'RETAINED_RAW_FIELD_MISSING', name);
    if (value !== null && type === 'TIMESTAMP') {
      requireThat(typeof value === 'string' && Number.isFinite(Date.parse(value)), 'RETAINED_RAW_TIMESTAMP_INVALID', name);
      value = new Date(value).toISOString().replace('.000Z', 'Z');
    }
    if (value !== null && type === 'INTEGER' && typeof value === 'string' && /^-?\d+$/.test(value)) value = Number(value);
    if (value !== null && type === 'INTEGER') requireThat(Number.isSafeInteger(value), 'RETAINED_RAW_INTEGER_INVALID', name);
    return [name, value];
  }));
}

// This pure check validates observations. Only the runtime caller obtains those
// observations from authenticated BigQuery jobs and persists the actual linkage.
export function reconstructRetainedParent({ rows, pinnedParent, parentBatchId, publishedAt, loadJobs, resourceManifest }) {
  const pinned = validateSourcePackage(pinnedParent);
  const groups = { RAW_LINE: [], RAW_EVENT: [] };
  for (const row of rows) {
    requireThat(Object.hasOwn(groups, row.row_kind) && typeof row.row_json === 'string', 'RETAINED_RAW_RESULT_INVALID');
    groups[row.row_kind].push(JSON.parse(row.row_json));
  }
  const ingestions = {}, originEvidence = [];
  const reconstruct = (kind, file, fields, expected, table) => {
    requireThat(groups[kind].length === expected.length, 'RETAINED_RAW_COUNT_MISMATCH', table);
    const byLocator = new Map();
    const job = loadJobs[table], ingestedTimes = new Set();
    requireThat(job?.status === 'DONE', 'PARENT_LOAD_NOT_SUCCESSFUL');
    for (const row of groups[kind]) {
      requireThat(row.batch_id === parentBatchId && row.source_package_hash === pinned.sourcePackageHash, 'RETAINED_RAW_IDENTITY_MISMATCH');
      requireThat(typeof row.record_locator === 'string' && !byLocator.has(row.record_locator), 'RETAINED_RAW_LOCATOR_MISMATCH');
      const record = sourceRecord(row, fields), payloadHash = sha256(canonicalJson(record));
      requireThat(row.payload_hash === payloadHash, 'RETAINED_RAW_PAYLOAD_HASH_MISMATCH', row.record_locator);
      const ingested = Date.parse(row.ingested_at);
      requireThat(typeof row.ingested_at === 'string' && Number.isFinite(ingested) && ingested >= Date.parse(resourceManifest.firstResourceAt) && ingested <= Date.parse(job.end_time_utc) &&
        ingested <= Date.parse(publishedAt) && Date.parse(job.end_time_utc) <= Date.parse(publishedAt), 'RETAINED_RAW_INGESTION_TIME_MISMATCH');
      ingestedTimes.add(row.ingested_at);
      byLocator.set(row.record_locator, { record, payloadHash, ingestedAt: row.ingested_at });
    }
    requireThat(ingestedTimes.size === 1, 'RETAINED_RAW_INGESTION_TIME_MISMATCH');
    const records = expected.map(occurrence => {
      const observed = byLocator.get(occurrence.recordLocator);
      requireThat(observed && observed.payloadHash === occurrence.payloadHash && isDeepStrictEqual(observed.record, occurrence.record), 'RETAINED_RAW_SOURCE_MISMATCH', occurrence.recordLocator);
      originEvidence.push({ table_id: table, record_locator: occurrence.recordLocator, payload_hash: observed.payloadHash, ingested_at: observed.ingestedAt, load_job_id: job.job_id });
      return observed.record;
    });
    const text = records.map(record => JSON.stringify(record)).join('\n') + (records.length ? '\n' : '');
    requireThat(sha256(text) === pinned.manifest.files[file].sha256, 'RETAINED_RAW_FILE_HASH_MISMATCH', file);
    ingestions[table] = [...ingestedTimes][0];
    return text;
  };
  const linesText = reconstruct('RAW_LINE', 'po_lines.jsonl', LINE_FIELDS, pinned.physicalLines, 'raw_lines');
  const eventsText = reconstruct('RAW_EVENT', 'line_events.jsonl', EVENT_FIELDS, pinned.physicalEvents, 'raw_event_versions');
  const parent = { manifest: structuredClone(pinned.manifest), linesText, eventsText };
  validateSourcePackage(parent);
  return { parent, ingestions, physical_occurrence_evidence: originEvidence };
}
