import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { TextDecoder } from 'node:util';
import { fail, parseStrictJson, SourceValidationError } from './strict-json.mjs';
export { SourceValidationError };

export const SOURCE_CONTRACT = 'SRC-v1.0';
export const GENERATOR_VERSION = 'GEN-01-v1.0';
export const MAX_SOURCE_BYTES = 100 * 1024 * 1024;
export const MAX_SOURCE_RECORDS = 100_000;
const LINE_FIELDS = ['line_id', 'po_id', 'line_number', 'supplier_id', 'buyer_id', 'sku_id', 'ordered_at', 'source_recorded_at', 'initial_promised_date', 'ordered_qty', 'unit_price_cents', 'currency', 'uom'];
const EVENT_FIELDS = ['event_id', 'revision', 'line_id', 'event_type', 'event_at', 'source_recorded_at', 'is_void', 'quantity', 'promised_date', 'reason_code'];
const MANIFEST_FIELDS = ['schema_version', 'source_contract', 'fixture_or_profile', 'generator_version', 'seed', 'provenance_class', 'business_as_of', 'knowledge_cutoff', 'files', 'source_package_hash'];
const FILES = ['po_lines.jsonl', 'line_events.jsonl'];
const HEX = /^[a-f0-9]{64}$/;
const ordinal = (left, right) => left < right ? -1 : left > right ? 1 : 0;
const nyDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' });

export function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
}
export const sha256 = value => createHash('sha256').update(value).digest('hex');

export function safeAdd(left, right, locator = 'arithmetic') {
  if (!Number.isSafeInteger(left) || !Number.isSafeInteger(right) || left < 0 || right < 0 || right > Number.MAX_SAFE_INTEGER - left) {
    fail('ARITHMETIC_LIMIT', locator, 'Nonnegative exact-integer accumulation limit');
  }
  return left + right;
}

function shape(value, fields, locator) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) fail('INVALID_TYPE', locator, 'Object required');
  if (fields.some(field => !Object.hasOwn(value, field)) || Object.keys(value).some(field => !fields.includes(field))) {
    fail('INVALID_SCHEMA', locator, 'Missing or unknown field');
  }
}
function integer(value, min, max, locator) {
  if (!Number.isSafeInteger(value)) fail('INVALID_TYPE', locator, 'Safe integer required');
  if (value < min || value > max) fail('ARITHMETIC_LIMIT', locator, 'Integer outside contract limit');
}
function identifier(value, locator) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(value)) fail('INVALID_TYPE', locator, 'ASCII identifier required');
}
function date(value, locator) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail('INVALID_TYPE', locator, 'ISO date required');
  const parsed = new Date(`${value}T12:00:00Z`);
  if (!Number.isFinite(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) fail('INVALID_TYPE', locator, 'Invalid calendar date');
}
function timestamp(value, locator) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) fail('INVALID_TYPE', locator, 'UTC timestamp with second precision required');
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.valueOf()) || parsed.toISOString() !== value.replace('Z', '.000Z')) fail('INVALID_TYPE', locator, 'Invalid timestamp');
}
export function businessDate(instant) {
  timestamp(instant, 'business_as_of');
  const parts = Object.fromEntries(nyDate.formatToParts(new Date(instant)).map(p => [p.type, p.value]));
  return `${parts.year.padStart(4, '0')}-${parts.month}-${parts.day}`;
}
function chronology(condition, locator) {
  if (!condition) fail('INVALID_CHRONOLOGY', locator, 'Source chronology is inconsistent');
}

function parseRows(text, filename, fields) {
  if (typeof text !== 'string') fail('INVALID_TYPE', filename, 'Source text required');
  if (text === '') return [];
  const rows = text.split('\n');
  if (rows.at(-1) === '') rows.pop();
  if (rows.length > MAX_SOURCE_RECORDS) fail('SOURCE_LIMIT', filename, 'Source record limit');
  return rows.map((raw, index) => {
    const recordLocator = `${filename}:${index + 1}`;
    if (raw.trim() === '') fail('INVALID_JSON', recordLocator, 'Blank source record');
    const parsed = parseStrictJson(raw, recordLocator);
    shape(parsed, fields, recordLocator);
    const record = Object.fromEntries(fields.map(field => [field, parsed[field]]));
    return { record, recordLocator, payloadHash: sha256(canonicalJson(record)) };
  });
}

function validateLine(line, at) {
  for (const field of ['line_id', 'po_id', 'supplier_id', 'buyer_id', 'sku_id']) identifier(line[field], `${at}/${field}`);
  integer(line.line_number, 1, 1_000_000, `${at}/line_number`);
  integer(line.ordered_qty, 1, 1_000_000, `${at}/ordered_qty`);
  integer(line.unit_price_cents, 0, 100_000_000, `${at}/unit_price_cents`);
  timestamp(line.ordered_at, `${at}/ordered_at`);
  timestamp(line.source_recorded_at, `${at}/source_recorded_at`);
  date(line.initial_promised_date, `${at}/initial_promised_date`);
  chronology(line.source_recorded_at >= line.ordered_at && line.initial_promised_date >= businessDate(line.ordered_at), at);
  if (line.currency !== 'USD' || line.uom !== 'EA') fail('INVALID_TYPE', at, 'Only USD and EA are supported');
}
function validateEvent(event, line, at) {
  for (const field of ['event_id', 'line_id']) identifier(event[field], `${at}/${field}`);
  integer(event.revision, 1, 1_000_000, `${at}/revision`);
  if (!['RECEIPT', 'CANCEL', 'PROMISE'].includes(event.event_type) || typeof event.is_void !== 'boolean') fail('INVALID_TYPE', at, 'Invalid event type or void flag');
  timestamp(event.event_at, `${at}/event_at`);
  timestamp(event.source_recorded_at, `${at}/source_recorded_at`);
  if (!line) fail('MISSING_LINE', at, 'Referenced line is absent');
  chronology(event.event_at >= line.ordered_at && event.source_recorded_at >= event.event_at && event.source_recorded_at >= line.source_recorded_at, at);
  if (event.is_void) {
    if (event.quantity !== null || event.promised_date !== null || event.reason_code !== null) fail('INVALID_TYPE', at, 'Void payload must be null');
  } else if (event.event_type === 'PROMISE') {
    date(event.promised_date, `${at}/promised_date`);
    chronology(event.promised_date >= businessDate(line.ordered_at), at);
    if (event.quantity !== null || event.reason_code !== null) fail('INVALID_TYPE', at, 'Promise has no quantity or reason');
  } else {
    integer(event.quantity, 1, 1_000_000, `${at}/quantity`);
    if (event.promised_date !== null) fail('INVALID_TYPE', at, 'Quantity event has no promised date');
    if (event.event_type === 'RECEIPT' && event.reason_code !== null) fail('INVALID_TYPE', at, 'Receipt has no cancellation reason');
    if (event.event_type === 'CANCEL' && !['SUPPLIER_CANCEL', 'BUYER_CANCEL', 'CLOSE_SHORT'].includes(event.reason_code)) fail('INVALID_TYPE', at, 'Cancellation reason required');
  }
}

function fileDetails(text) {
  return { record_count: text === '' ? 0 : text.split('\n').length - (text.endsWith('\n') ? 1 : 0), byte_count: Buffer.byteLength(text, 'utf8'), sha256: sha256(text) };
}
export function packageHash(manifest) {
  const { source_package_hash: excluded, ...identity } = manifest;
  return sha256(canonicalJson(identity));
}

// Metadata generation never computes business expectations or source transactions.
export function buildManifest({ fixtureOrProfile, businessAsOf, knowledgeCutoff, linesText, eventsText }) {
  const manifest = {
    schema_version: '1.0', source_contract: SOURCE_CONTRACT, fixture_or_profile: fixtureOrProfile,
    generator_version: GENERATOR_VERSION, seed: null, provenance_class: 'SYNTHETIC',
    business_as_of: businessAsOf, knowledge_cutoff: knowledgeCutoff,
    files: { 'po_lines.jsonl': fileDetails(linesText), 'line_events.jsonl': fileDetails(eventsText) },
  };
  manifest.source_package_hash = packageHash(manifest);
  return manifest;
}

function validateManifest(manifest, linesText, eventsText) {
  shape(manifest, MANIFEST_FIELDS, 'manifest.json');
  if (manifest.schema_version !== '1.0' || manifest.source_contract !== SOURCE_CONTRACT || manifest.generator_version !== GENERATOR_VERSION) fail('UNSUPPORTED_VERSION', 'manifest.json', 'Unsupported contract or generator');
  if (!['FIX-01', 'FIX-02'].includes(manifest.fixture_or_profile) || manifest.seed !== null || manifest.provenance_class !== 'SYNTHETIC') fail('UNSUPPORTED_PROFILE', 'manifest.json', 'Only literal golden packages are implemented');
  timestamp(manifest.business_as_of, 'manifest.json/business_as_of');
  timestamp(manifest.knowledge_cutoff, 'manifest.json/knowledge_cutoff');
  chronology(manifest.knowledge_cutoff >= manifest.business_as_of, 'manifest.json');
  shape(manifest.files, FILES, 'manifest.json/files');
  if (!HEX.test(manifest.source_package_hash)) fail('INVALID_TYPE', 'manifest.json/source_package_hash', 'SHA-256 required');
  const texts = [linesText, eventsText];
  let bytes = 0;
  let records = 0;
  for (const [index, name] of FILES.entries()) {
    const at = `manifest.json/files/${name}`;
    const expected = manifest.files[name];
    shape(expected, ['record_count', 'byte_count', 'sha256'], at);
    integer(expected.record_count, 0, MAX_SOURCE_RECORDS, at);
    integer(expected.byte_count, 0, MAX_SOURCE_BYTES, at);
    if (typeof expected.sha256 !== 'string' || !HEX.test(expected.sha256)) fail('INVALID_TYPE', at, 'SHA-256 required');
    if (typeof texts[index] !== 'string') fail('INVALID_TYPE', name, 'Source text required');
    const actual = fileDetails(texts[index]);
    bytes = safeAdd(bytes, actual.byte_count, at);
    records = safeAdd(records, actual.record_count, at);
    if (actual.sha256 !== expected.sha256 || actual.record_count !== expected.record_count || actual.byte_count !== expected.byte_count) fail('HASH_OR_COUNT_MISMATCH', name, 'File bytes or count do not match manifest');
  }
  if (bytes > MAX_SOURCE_BYTES || records > MAX_SOURCE_RECORDS) fail('SOURCE_LIMIT', 'manifest.json', 'Combined source envelope exceeded');
  if (packageHash(manifest) !== manifest.source_package_hash) fail('HASH_OR_COUNT_MISMATCH', 'manifest.json', 'Package identity does not match manifest');
}

// This selection supports admission only. SQL owns published business calculations.
export function selectWinningEvents(events, manifest, lines) {
  const eligible = new Set(lines.filter(line => line.ordered_at <= manifest.business_as_of && line.source_recorded_at <= manifest.knowledge_cutoff).map(line => line.line_id));
  const winners = new Map();
  for (const event of events) {
    if (!eligible.has(event.line_id) || event.source_recorded_at > manifest.knowledge_cutoff || event.event_at > manifest.business_as_of) continue;
    if (!winners.has(event.event_id) || event.revision > winners.get(event.event_id).revision) winners.set(event.event_id, event);
  }
  return [...winners.values()].sort((a, b) => ordinal(a.event_at, b.event_at) || ordinal(a.event_id, b.event_id));
}

export function validateSourcePackage({ manifest, linesText, eventsText }) {
  if (typeof manifest === 'string') manifest = parseStrictJson(manifest, 'manifest.json');
  validateManifest(manifest, linesText, eventsText);
  const physicalLines = parseRows(linesText, FILES[0], LINE_FIELDS);
  const physicalEvents = parseRows(eventsText, FILES[1], EVENT_FIELDS);
  const lineMap = new Map();
  const businessKeys = new Map();
  for (const { record: line, recordLocator: at, payloadHash } of physicalLines) {
    validateLine(line, at);
    const prior = lineMap.get(line.line_id);
    const key = `${line.po_id}/${line.line_number}`;
    if ((prior && prior.payloadHash !== payloadHash) || (businessKeys.has(key) && businessKeys.get(key) !== line.line_id)) fail('CONFLICTING_LINE', at, 'Immutable line or business key conflict');
    lineMap.set(line.line_id, { record: line, payloadHash });
    businessKeys.set(key, line.line_id);
  }
  const revisionMap = new Map();
  for (const occurrence of physicalEvents) {
    const { record: event, recordLocator: at, payloadHash } = occurrence;
    validateEvent(event, lineMap.get(event.line_id)?.record, at);
    const key = `${event.event_id}/${event.revision}`;
    if (revisionMap.has(key) && revisionMap.get(key).payloadHash !== payloadHash) fail('CONFLICTING_REVISION', at, 'Event revision has differing payloads');
    revisionMap.set(key, occurrence);
  }
  const lines = [...lineMap.values()].map(p => p.record).sort((a, b) => ordinal(a.line_id, b.line_id));
  const versions = [...revisionMap.values()].sort((a, b) => ordinal(a.record.event_id, b.record.event_id) || a.record.revision - b.record.revision);
  let prior;
  for (const { record: event, recordLocator: at } of versions) {
    if (!prior || prior.event_id !== event.event_id) {
      if (event.revision !== 1) fail('REVISION_GAP', at, 'History must start at revision 1');
    } else {
      if (event.revision !== prior.revision + 1) fail('REVISION_GAP', at, 'Revision history is incomplete');
      if (event.line_id !== prior.line_id || event.event_type !== prior.event_type || event.event_at !== prior.event_at) fail('IMMUTABLE_EVENT_CHANGED', at, 'Event identity changed across revisions');
      chronology(event.source_recorded_at > prior.source_recorded_at, at);
    }
    prior = event;
  }
  const events = versions.map(p => p.record);
  const consumed = new Map();
  const promises = new Map();
  for (const event of selectWinningEvents(events, manifest, lines)) {
    if (event.is_void) continue;
    const at = revisionMap.get(`${event.event_id}/${event.revision}`).recordLocator;
    if (event.event_type === 'PROMISE') {
      const key = `${event.line_id}/${event.event_at}`;
      if (promises.has(key) && promises.get(key) !== event.promised_date) fail('CONFLICTING_PROMISE_TIME', at, 'Different promises have the same effective time');
      promises.set(key, event.promised_date);
    } else {
      const total = safeAdd(consumed.get(event.line_id) ?? 0, event.quantity, at);
      if (total > lineMap.get(event.line_id).record.ordered_qty) fail('QUANTITY_EXCEEDS_ORDER', at, 'Effective receipts and cancellations exceed ordered quantity');
      consumed.set(event.line_id, total);
    }
  }
  // Ordered value bounds every nonnegative remaining/overdue monetary subset.
  let totalQuantity = 0;
  let totalCents = 0;
  for (const line of lines) {
    totalQuantity = safeAdd(totalQuantity, line.ordered_qty, line.line_id);
    totalCents = safeAdd(totalCents, line.ordered_qty * line.unit_price_cents, line.line_id);
  }
  return {
    manifest, lines, events, physicalLines, physicalEvents,
    physicalCounts: { lines: physicalLines.length, events: physicalEvents.length },
    duplicateCounts: { lines: physicalLines.length - lines.length, events: physicalEvents.length - events.length },
    sourcePackageHash: manifest.source_package_hash,
  };
}

export async function readSourcePackage(directory) {
  const contents = await Promise.all([...FILES, 'manifest.json'].map(async name => {
    const buffer = await readFile(join(directory, name));
    if (buffer.byteLength > MAX_SOURCE_BYTES) fail('SOURCE_LIMIT', name, 'File exceeds source byte limit');
    if (buffer.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf]))) fail('INVALID_JSON', name, 'UTF-8 BOM is prohibited');
    try { return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(buffer); }
    catch { fail('INVALID_JSON', name, 'Invalid UTF-8'); }
  }));
  return validateSourcePackage({ linesText: contents[0], eventsText: contents[1], manifest: contents[2] });
}
