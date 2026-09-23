import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { composeIncrementalPackage } from '../../src/data/retained-history.mjs';
import { buildManifest, canonicalJson, readPackageEnvelope, readSourcePackage, sha256, validatePackageEnvelope, validateSourcePackage } from '../../src/data/source-package.mjs';

const directory = name => fileURLToPath(new URL(`../../fixtures/po/${name}/`, import.meta.url));
const parent = await readPackageEnvelope(directory('FIX-01'));
const delta = await readPackageEnvelope(directory('FIX-02-delta'));
const complete = await readPackageEnvelope(directory('FIX-02'));
const oracle = JSON.parse(await readFile(new URL('../../fixtures/po/FIX-02/expected.json', import.meta.url), 'utf8'));
function changedDelta({ linesText = delta.linesText, eventsText = delta.eventsText } = {}) {
  return { linesText, eventsText, manifest: buildManifest({ fixtureOrProfile: 'FIX-02', businessAsOf: delta.manifest.business_as_of,
    knowledgeCutoff: delta.manifest.knowledge_cutoff, linesText, eventsText }) };
}
const eventLines = delta.eventsText.trimEnd().split('\n').map(JSON.parse);
const serialize = rows => rows.map(row => JSON.stringify(row)).join('\n') + '\n';
const failure = code => error => error.name === 'SourceValidationError' && error.code === code;

test('two new records plus retained FIX-01 reproduce exact independent FIX-02 bytes, manifest and identities', () => {
  const result = composeIncrementalPackage({ parent, delta });
  assert.equal(delta.linesText, ''); assert.equal(delta.physicalEvents.length, 2);
  assert.equal(result.package.linesText, complete.linesText);
  assert.equal(result.package.eventsText, complete.eventsText);
  assert.equal(canonicalJson(result.package.manifest), canonicalJson(complete.manifest));
  assert.equal(result.source.sourcePackageHash, '7233ba96d4b491bbecb6c83fd292940e66a27706d63aaa014f0959d23f0f4c20');
  assert.deepEqual(result.source.events.map(e => `${e.event_id}/${e.revision}`), oracle.keys.event_versions);
  assert.deepEqual(result.source.lines.map(l => l.line_id), oracle.keys.line_ids);
});
test('envelope integrity is explicitly separate from complete-history admission', async () => {
  assert.equal(delta.validationScope, 'PACKAGE_INTEGRITY_AND_RECORD_STRUCTURE_ONLY');
  assert.equal(delta.completeHistoryAdmission, 'Not Run');
  assert.throws(() => validateSourcePackage(delta), failure('MISSING_LINE'));
  await assert.rejects(readSourcePackage(directory('FIX-02-delta')), failure('MISSING_LINE'));
  assert.equal((await readSourcePackage(directory('FIX-01'))).events.length, 10);
});
test('composition preserves exact parent/delta hashes and every physical occurrence origin', () => {
  const { source, composition } = composeIncrementalPackage({ parent, delta });
  assert.equal(composition.parent.source_package_hash, parent.manifest.source_package_hash);
  assert.equal(composition.delta.source_package_hash, delta.manifest.source_package_hash);
  assert.equal(canonicalJson(composition.delta.files), canonicalJson(delta.manifest.files));
  const origins = composition.physical_occurrence_origins;
  assert.equal(origins.lines.length, 10); assert.equal(origins.events.length, 12);
  assert.ok(origins.lines.every(o => o.role === 'RETAINED_PARENT'));
  assert.ok(origins.events.slice(0, 10).every(o => o.role === 'RETAINED_PARENT'));
  assert.deepEqual(origins.events.slice(10).map(o => [o.role, o.source_record_locator, o.resolved_record_locator]),
    [['DELTA', 'line_events.jsonl:1', 'line_events.jsonl:11'], ['DELTA', 'line_events.jsonl:2', 'line_events.jsonl:12']]);
  assert.deepEqual(origins.events.map(o => o.payload_hash), source.physicalEvents.map(e => e.payloadHash));
  const { composition_hash, ...identity } = composition;
  assert.equal(composition_hash, sha256(canonicalJson(identity)));
});
test('composition is deterministic, leaves inputs unchanged and never accepts a caller cloud-approval flag', () => {
  const before = canonicalJson({ parent, delta });
  const first = composeIncrementalPackage({ parent, delta, parentAccepted: true, cloudAccepted: true,
    parentReceipt: { status: 'READY', validation_result: 'PASS', source_package_hash: parent.manifest.source_package_hash } });
  const second = composeIncrementalPackage({ parent, delta });
  assert.equal(canonicalJson(first), canonicalJson(second));
  assert.equal(canonicalJson({ parent, delta }), before);
  assert.equal(first.composition.scope, 'LOCAL_COMPOSITION_ONLY');
  assert.equal(first.composition.cloud_acceptance_linkage, 'Not Run');
  assert.equal(first.composition.cloud_execution, 'Not Run');
  first.composition.parent.files['po_lines.jsonl'].record_count = 0;
  assert.equal(parent.manifest.files['po_lines.jsonl'].record_count, 10);
});
test('missing or substituted parent fails instead of inferring retained source history', () => {
  assert.throws(() => composeIncrementalPackage({ delta }), failure('MISSING_PARENT'));
  assert.throws(() => composeIncrementalPackage({ parent }), failure('MISSING_DELTA'));
  assert.throws(() => composeIncrementalPackage({ parent: complete, delta }), failure('PINNED_PARENT_MISMATCH'));
});
test('stale package hashes cannot masquerade as checked envelope inputs', () => {
  assert.throws(() => composeIncrementalPackage({ parent, delta: { ...delta, eventsText: delta.eventsText.replace('"quantity":3', '"quantity":4') } }), failure('HASH_OR_COUNT_MISMATCH'));
  assert.throws(() => validatePackageEnvelope({ ...delta, manifest: { ...delta.manifest, unexpected: true } }), failure('INVALID_SCHEMA'));
});
test('a conflicting revision against retained history rejects the whole composition with its real reason', () => {
  const existing = JSON.parse(parent.eventsText.split('\n')[0]); existing.quantity = 5;
  const fault = changedDelta({ eventsText: serialize([existing, ...eventLines]) });
  assert.throws(() => composeIncrementalPackage({ parent, delta: fault }), failure('CONFLICTING_REVISION'));
});
test('revision gaps and changed event identity are rejected after union with parent history', () => {
  const gap = changedDelta({ eventsText: serialize([{ ...eventLines[0], revision: 3 }, eventLines[1]]) });
  assert.throws(() => composeIncrementalPackage({ parent, delta: gap }), failure('REVISION_GAP'));
  const changed = changedDelta({ eventsText: serialize([{ ...eventLines[0], event_at: '2026-09-19T10:00:00Z' }, eventLines[1]]) });
  assert.throws(() => composeIncrementalPackage({ parent, delta: changed }), failure('IMMUTABLE_EVENT_CHANGED'));
});
test('immutable parent lines cannot be overwritten by a delta', () => {
  const changed = JSON.parse(parent.linesText.split('\n')[0]); changed.ordered_qty = 11;
  assert.throws(() => composeIncrementalPackage({ parent, delta: changedDelta({ linesText: serialize([changed]) }) }), failure('CONFLICTING_LINE'));
});
test('unknown masters and valid-but-unreviewed delta subsets fail without widening the pinned proof', () => {
  const unknown = changedDelta({ eventsText: serialize([{ ...eventLines[0], line_id: 'L99' }, eventLines[1]]) });
  assert.throws(() => composeIncrementalPackage({ parent, delta: unknown }), failure('MISSING_LINE'));
  const subset = changedDelta({ eventsText: serialize([eventLines[0]]) });
  assert.throws(() => composeIncrementalPackage({ parent, delta: subset }), failure('PINNED_DELTA_MISMATCH'));
});
test('extra duplicate physical input is retained by envelope parsing and rejected by the exact delta pin, never silently discarded', () => {
  const duplicated = changedDelta({ eventsText: delta.eventsText + serialize([eventLines[0]]) });
  const before = duplicated.eventsText;
  const envelope = validatePackageEnvelope(duplicated);
  assert.equal(envelope.physicalEvents.length, 3);
  assert.deepEqual(envelope.physicalEvents.map(e => e.recordLocator), ['line_events.jsonl:1', 'line_events.jsonl:2', 'line_events.jsonl:3']);
  assert.equal(envelope.physicalEvents[0].payloadHash, envelope.physicalEvents[2].payloadHash);
  assert.throws(() => composeIncrementalPackage({ parent, delta: duplicated }), failure('PINNED_DELTA_MISMATCH'));
  assert.equal(duplicated.eventsText, before);
});
test('caller-supplied parsed occurrence arrays cannot replace the records bound by source bytes', () => {
  const result = composeIncrementalPackage({ parent: { ...parent, physicalLines: [], physicalEvents: [] }, delta: { ...delta, physicalEvents: [] } });
  assert.equal(result.composition.physical_occurrence_origins.lines.length, 10);
  assert.equal(result.composition.physical_occurrence_origins.events.length, 12);
});
