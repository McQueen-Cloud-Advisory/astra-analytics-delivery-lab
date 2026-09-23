import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { TARGET, LINE_FIELDS, EVENT_FIELDS, SNAPSHOT_FIELDS, EVIDENCE_FIELDS, MANIFEST_FIELDS } from './schemas.mjs';

export const GiB = 1024 ** 3;
export const LIMITS = Object.freeze({ queryBytes: GiB, attemptBytes: 2 * GiB, dailyBytes: 10 * GiB, attempts: 3 });
export const SUPPORTED_FIXTURES = Object.freeze(['FIX-01', 'FIX-02']);
export class PipelineError extends Error {
  constructor(code, detail = '') { super(`${code}${detail ? `: ${detail}` : ''}`); this.code = code; }
}
export function safeFailure(error) {
  const code = String(error?.code ?? '');
  const result = { code: /^[A-Z0-9_]{1,80}$/.test(code) && !/^\d+$/.test(code) ? code : 'CLOUD_OPERATION_FAILED' };
  const status = Number(error?.code);
  if (Number.isInteger(status) && status >= 100 && status <= 599) result.http_status = status;
  const reason = error?.errors?.[0]?.reason;
  if (typeof reason === 'string' && /^[a-zA-Z0-9_]{1,80}$/.test(reason)) result.reason = reason;
  return result;
}
export function requireThat(condition, code, detail) { if (!condition) throw new PipelineError(code, detail); }
export const hash = value => createHash('sha256').update(value).digest('hex');
export function quotaDate(now) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now).map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}
export function validateReadiness(value, now = new Date()) {
  requireThat(value?.schema_version === 1 && value.project_id === TARGET.projectId && value.location === TARGET.location && value.pipeline_service_account === TARGET.serviceAccount, 'READINESS_TARGET');
  for (const key of ['cloud_execution_authorized', 'billing_verified', 'runtime_identity_verified', 'controls_verified']) requireThat(value[key] === true, 'READINESS_INCOMPLETE', key);
  requireThat(typeof value.gate5_decision_ref === 'string' && value.gate5_decision_ref.length > 0, 'MISSING_GATE5_REFERENCE');
  for (const [key, hours] of [['observed_at_utc', 24], ['cost_evidence_checked_at_utc', 48]]) {
    const age = now.valueOf() - Date.parse(value[key]);
    requireThat(Number.isFinite(age) && age >= 0 && age <= hours * 3600000, 'READINESS_STALE', key);
  }
  requireThat(value.quota_date === quotaDate(now), 'READINESS_QUOTA_DATE');
  requireThat(Number.isSafeInteger(value.known_project_billed_bytes_today) && value.known_project_billed_bytes_today >= 0, 'READINESS_USAGE_UNKNOWN');
  requireThat(value.known_project_billed_bytes_today + LIMITS.attemptBytes <= LIMITS.dailyBytes, 'DAILY_BYTE_LIMIT');
  return value;
}
export function batchIdentity(source) {
  const m = source.manifest;
  requireThat(SUPPORTED_FIXTURES.includes(m.fixture_or_profile) && m.source_contract === 'SRC-v1.0' && m.provenance_class === 'SYNTHETIC', 'UNSUPPORTED_FIXTURE');
  const prefix = m.fixture_or_profile.toLowerCase().replace('-', '');
  return `${prefix}_${hash([source.sourcePackageHash, m.business_as_of, m.knowledge_cutoff, m.source_contract].join('|'))}`;
}
export function contextParams(source, batchId) {
  return { batch_id: batchId, business_as_of: source.manifest.business_as_of, knowledge_cutoff: source.manifest.knowledge_cutoff,
    source_package_hash: source.sourcePackageHash, contract_version: source.manifest.source_contract, provenance_class: 'SYNTHETIC' };
}
const same = (actual, expected, detail) => requireThat(isDeepStrictEqual(actual, expected), 'GOLDEN_MISMATCH', detail);
const sorted = (rows, key) => [...rows].sort((a, b) => key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0);
const projection = (row, names) => Object.fromEntries(names.map(n => [n, row[n]]));
function normalized(row, fields) {
  return Object.fromEntries(fields.map(({ name, type }) => {
    let value = row[name];
    if (value !== null && type === 'TIMESTAMP') value = new Date(value).toISOString().replace('.000Z', 'Z');
    if (value !== null && type === 'INTEGER' && typeof value === 'string' && /^-?\d+$/.test(value)) value = Number(value);
    if (value !== null && type === 'INTEGER') requireThat(Number.isSafeInteger(value), 'UNSAFE_RESULT_INTEGER', name);
    requireThat(value !== undefined, 'MISSING_RESULT_FIELD', name);
    return [name, value];
  }));
}
export function decodeRows(rows) {
  const result = { lines: [], events: [], manifests: [] };
  for (const row of rows) {
    const group = { LINE: 'lines', EVENT: 'events', MANIFEST: 'manifests' }[row.row_kind];
    requireThat(group && typeof row.row_json === 'string', 'INVALID_RESULT_ROW');
    result[group].push(JSON.parse(row.row_json));
  }
  return result;
}
export function metrics(lines) {
  const open = lines.filter(l => l.is_open), overdue = lines.filter(l => l.is_overdue);
  const sum = (rows, key) => rows.reduce((a, r) => { const n = a + r[key]; requireThat(Number.isSafeInteger(n), 'UNSAFE_RESULT_TOTAL', key); return n; }, 0);
  return { ordered_qty: sum(lines, 'ordered_qty'), received_qty: sum(lines, 'received_qty'), cancelled_qty: sum(lines, 'cancelled_qty'), remaining_qty: sum(lines, 'remaining_qty'),
    open_lines: open.length, overdue_lines: overdue.length, overdue_units: sum(overdue, 'remaining_qty'), overdue_value_cents: sum(overdue, 'overdue_value_cents'),
    overdue_share_numerator: overdue.length, overdue_share_denominator: open.length, max_overdue_days: overdue.length ? Math.max(...overdue.map(l => l.days_overdue)) : null,
    postponed_open_lines: open.filter(l => l.promise_slip_days > 0).length };
}
export function validateCandidate(result, source, oracle) {
  same([oracle.fixture_id, oracle.oracle_version, oracle.business_as_of, oracle.knowledge_cutoff], [source.manifest.fixture_or_profile, 'FIX-v1.0', source.manifest.business_as_of, source.manifest.knowledge_cutoff], 'oracle context');
  const contextNames = new Set(['batch_id', 'business_as_of', 'knowledge_cutoff', 'source_package_hash', 'contract_version', 'provenance_class', 'published_at']);
  const lineFields = SNAPSHOT_FIELDS.filter(f => !contextNames.has(f.name));
  const eventFields = EVIDENCE_FIELDS.filter(f => !contextNames.has(f.name));
  const lines = sorted(result.lines.map(r => normalized(r, lineFields)), r => r.line_id);
  const events = sorted(result.events.map(r => normalized(r, eventFields)), r => `${r.event_id}/${r.revision}`);
  same(lines.map(l => l.line_id), [...oracle.keys.line_ids].sort(), 'line identities');
  same(events.map(e => `${e.event_id}/${e.revision}`), [...oracle.keys.event_versions].sort(), 'event/version identities');
  same([source.physicalCounts.lines, source.physicalCounts.events, source.lines.length, source.events.length, events.filter(e => e.is_winning_revision).length],
    [oracle.counts.physical_lines, oracle.counts.physical_events, oracle.counts.canonical_lines, oracle.counts.canonical_event_versions, oracle.counts.winning_events], 'source/revision counts');
  for (const line of lines) {
    const input = source.lines.find(l => l.line_id === line.line_id);
    same(projection(line, LINE_FIELDS.map(f => f.name)), input, `source line ${line.line_id}`);
    const expected = oracle.line_states.find(l => l.line_id === line.line_id);
    same(projection(line, Object.keys(expected)), expected, `line state ${line.line_id}`);
    same(line.source_business_date, oracle.business_date, `business date ${line.line_id}`);
  }
  for (const event of events) {
    same(projection(event, EVENT_FIELDS.map(f => f.name)), source.events.find(e => e.event_id === event.event_id && e.revision === event.revision), `source event ${event.event_id}`);
  }
  requireThat(Array.isArray(oracle.event_states), 'MISSING_EVENT_ORACLE');
  const stateFields = ['event_id', 'revision', 'is_winning_revision', 'contributes_to_state', 'is_superseded', 'is_future_effective'];
  same(events.map(event => projection(event, stateFields)), sorted(oracle.event_states, e => `${e.event_id}/${e.revision}`), 'independent event states');
  same(metrics(lines), oracle.totals, 'all-line metrics');
  for (const [supplier, expected] of Object.entries(oracle.scopes)) same(metrics(lines.filter(l => l.supplier_id === supplier)), expected, `supplier ${supplier}`);
  return { lines, events };
}
export function validatePublished(result, source, oracle, batchId, transformHash) {
  requireThat(result.manifests.length === 1, 'INCOMPLETE_PUBLISHED_BATCH');
  const m = normalized(result.manifests[0], MANIFEST_FIELDS);
  const expected = { ...contextParams(source, batchId), status: 'READY', validation_result: 'PASS', fixture_id: source.manifest.fixture_or_profile, source_line_count: source.physicalCounts.lines,
    source_event_count: source.physicalCounts.events, canonical_event_count: source.events.length, published_line_count: source.lines.length, transform_sha256: transformHash };
  same(projection(m, Object.keys(expected)), expected, 'published manifest');
  requireThat(Number.isFinite(Date.parse(m.published_at)), 'INVALID_PUBLISHED_AT');
  for (const row of [...result.lines, ...result.events]) {
    const actualContext = normalized(row, MANIFEST_FIELDS.slice(0, 7));
    same(actualContext, { ...contextParams(source, batchId), published_at: m.published_at }, 'batch context');
  }
  return validateCandidate(result, source, oracle);
}

// Explicit columns/casts make schema review and dry-run validation possible without DDL.
const casts = { STRING: 'STRING', INTEGER: 'INT64', BOOLEAN: 'BOOL', TIMESTAMP: 'TIMESTAMP', DATE: 'DATE' };
function insertFromJson(table, fields, param) {
  const expressions = fields.map(f => f.name === 'published_at' ? 'CURRENT_TIMESTAMP()' : `CAST(JSON_VALUE(r, '$.${f.name}') AS ${casts[f.type]})`);
  return `INSERT INTO \`${TARGET.projectId}.${TARGET.servingDataset}.${table}\` (${fields.map(f => f.name).join(', ')})\nSELECT ${expressions.join(', ')}\nFROM UNNEST(JSON_QUERY_ARRAY(@${param})) AS r;`;
}
export const publicationSql = `-- All serving rows and READY manifest become visible together. No DDL.\nBEGIN TRANSACTION;\nASSERT (\n  (SELECT COUNT(*) FROM \`${TARGET.projectId}.po_serving.po_line_snapshot\` WHERE batch_id = @batch_id) +\n  (SELECT COUNT(*) FROM \`${TARGET.projectId}.po_serving.event_evidence\` WHERE batch_id = @batch_id) +\n  (SELECT COUNT(*) FROM \`${TARGET.projectId}.po_serving.batch_manifest\` WHERE batch_id = @batch_id)\n) = 0 AS 'Batch already exists; inspect and reconcile before another attempt';\n${insertFromJson('po_line_snapshot', SNAPSHOT_FIELDS, 'lines_json')}\n${insertFromJson('event_evidence', EVIDENCE_FIELDS, 'events_json')}\n${insertFromJson('batch_manifest', MANIFEST_FIELDS, 'manifest_json')}\nCOMMIT TRANSACTION;\n`;
export function publicationParams(candidate, source, batchId, transformHash) {
  const context = contextParams(source, batchId);
  return { batch_id: batchId, lines_json: JSON.stringify(candidate.lines.map(r => ({ ...r, ...context }))), events_json: JSON.stringify(candidate.events.map(r => ({ ...r, ...context }))),
    manifest_json: JSON.stringify([{ ...context, status: 'READY', validation_result: 'PASS', fixture_id: source.manifest.fixture_or_profile, source_line_count: source.physicalCounts.lines, source_event_count: source.physicalCounts.events,
      canonical_event_count: source.events.length, published_line_count: candidate.lines.length, transform_sha256: transformHash }]) };
}
