import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { VALIDATION_CASES, readValidationCase } from '../../src/data/validation-cases.mjs';
import { buildManifest, canonicalJson, sha256, validateSourcePackage } from '../../src/data/source-package.mjs';

const baseline = JSON.parse(await readFile(new URL('../../fixtures/po/FIX-01/expected.json', import.meta.url), 'utf8'));
const key = event => `${event.event_id}/${event.revision}`;
const failWith = code => error => error.name === 'SourceValidationError' && error.code === code && typeof error.locator === 'string';

// Hand-entered approved headline answers, independent of the SQL and pipeline metrics.
const positiveAnswers = {
  'FIX-03-D': [48, 4, 18, 14400, 2, 2],
  'FIX-04-MIDNIGHT-BEFORE': [48, 1, 4, 2800, 1, 2],
  'FIX-04-MIDNIGHT-AT': [48, 4, 18, 14400, 2, 2],
  'FIX-04-RECEIPT-VOID': [52, 4, 22, 18400, 2, 2],
  'FIX-04-PROMISE-VOID': [48, 5, 33, 17400, 3, 1],
  'FIX-04-FUTURE-BEFORE': [48, 4, 18, 14400, 2, 2],
  'FIX-04-FUTURE-AFTER': [47, 4, 17, 13400, 2, 2],
  'FIX-02-EARLY-KNOWLEDGE': [48, 4, 18, 14400, 2, 2],
};
function checkLiteralArithmetic(expected, source) {
  const master = new Map(source.lines.map(line => [line.line_id, line]));
  for (const line of expected.line_states) {
    const input = master.get(line.line_id);
    assert.equal(input.ordered_qty, line.received_qty + line.cancelled_qty + line.remaining_qty, line.line_id);
    assert.equal(line.remaining_value_cents, line.remaining_qty * input.unit_price_cents, line.line_id);
    assert.equal(line.overdue_value_cents, line.is_overdue ? line.remaining_value_cents : 0, line.line_id);
  }
  const scopes = { ALL: expected.line_states, ...Object.fromEntries(['S1','S2','S3'].map(supplier =>
    [supplier, expected.line_states.filter(line => master.get(line.line_id).supplier_id === supplier)])) };
  for (const [scope, lines] of Object.entries(scopes)) {
    const totals = scope === 'ALL' ? expected.totals : expected.scopes[scope];
    const sum = field => lines.reduce((total, line) => total + line[field], 0);
    for (const field of ['received_qty','cancelled_qty','remaining_qty','overdue_value_cents']) assert.equal(sum(field), totals[field], `${scope}/${field}`);
    assert.equal(lines.reduce((total, line) => total + master.get(line.line_id).ordered_qty, 0), totals.ordered_qty);
    const late = lines.filter(line => line.is_overdue);
    const open = lines.filter(line => line.is_open);
    assert.equal(late.length, totals.overdue_lines);
    assert.equal(late.reduce((total, line) => total + line.remaining_qty, 0), totals.overdue_units);
    assert.equal(open.length, totals.open_lines);
    assert.equal(late.length, totals.overdue_share_numerator);
    assert.equal(open.length, totals.overdue_share_denominator);
    assert.equal(late.length ? Math.max(...late.map(line => line.days_overdue)) : null, totals.max_overdue_days);
    assert.equal(open.filter(line => line.promise_slip_days > 0).length, totals.postponed_open_lines);
  }
}

test('catalog is bounded to eight accepted, eight admission-rejected and one reconciliation-rejected case', async () => {
  assert.equal(VALIDATION_CASES.length, 17);
  assert.equal(new Set(VALIDATION_CASES.map(row => row.caseId)).size, 17);
  assert.equal(VALIDATION_CASES.filter(row => row.outcome === 'ACCEPT').length, 8);
  assert.equal(VALIDATION_CASES.filter(row => row.rejectionStage === 'ADMISSION').length, 8);
  assert.equal(VALIDATION_CASES.filter(row => row.rejectionStage === 'RECONCILIATION').length, 1);
  assert.ok(Object.isFrozen(VALIDATION_CASES));
  assert.ok(VALIDATION_CASES.every(Object.isFrozen));
  await assert.rejects(readValidationCase('../FIX-01'), failWith('UNKNOWN_VALIDATION_CASE'));
  await assert.rejects(readValidationCase('FIX-05'), failWith('UNKNOWN_VALIDATION_CASE'));
});

for (const descriptor of VALIDATION_CASES) {
  test(`${descriptor.caseId}: exact pinned bytes reach their intended validation boundary`, async () => {
    const fixture = await readValidationCase(descriptor.caseId);
    const { manifest, linesText, eventsText } = fixture.package;
    assert.equal(manifest.fixture_or_profile, 'FIX-01');
    assert.equal(manifest.source_contract, 'SRC-v1.0');
    assert.equal(manifest.provenance_class, 'SYNTHETIC');
    assert.equal(canonicalJson(manifest), canonicalJson(buildManifest({ fixtureOrProfile: 'FIX-01', businessAsOf: manifest.business_as_of,
      knowledgeCutoff: manifest.knowledge_cutoff, linesText, eventsText })));
    if (descriptor.rejectionStage === 'ADMISSION') {
      assert.equal(fixture.expected, null);
      assert.throws(() => validateSourcePackage(fixture.package), failWith(descriptor.rejectionCode));
      return;
    }
    const source = validateSourcePackage(fixture.package);
    const expected = fixture.expected;
    assert.equal(expected.fixture_id, 'FIX-01');
    assert.equal(expected.oracle_version, 'FIX-v1.0');
    assert.equal(expected.business_as_of, manifest.business_as_of);
    assert.equal(expected.knowledge_cutoff, manifest.knowledge_cutoff);
    if (descriptor.caseId === 'FIX-03-H') {
      // The omitted record is intentional; never adapt the answer to bad input.
      assert.deepEqual(expected, baseline);
      assert.equal(source.physicalCounts.events, 9);
      assert.equal(expected.counts.physical_events, 10);
      assert.equal(source.events.some(event => event.event_id === 'E01'), false);
      assert.notDeepEqual(source.events.map(key), expected.keys.event_versions);
      assert.equal(descriptor.rejectionCode, 'GOLDEN_MISMATCH');
      return;
    }
    assert.deepEqual(source.lines.map(line => line.line_id), expected.keys.line_ids);
    assert.deepEqual(source.events.filter(event => event.source_recorded_at <= manifest.knowledge_cutoff).map(key), expected.keys.event_versions);
    assert.deepEqual([source.physicalCounts.lines, source.physicalCounts.events, source.lines.length, source.events.length],
      [expected.counts.physical_lines, expected.counts.physical_events, expected.counts.canonical_lines, expected.counts.canonical_event_versions]);
    assert.deepEqual(expected.event_states.map(key), expected.keys.event_versions);
    assert.equal(expected.event_states.filter(event => event.is_winning_revision).length, expected.counts.winning_events);
    const totals = expected.totals;
    assert.deepEqual([totals.remaining_qty, totals.overdue_lines, totals.overdue_units, totals.overdue_value_cents,
      totals.max_overdue_days, totals.postponed_open_lines], positiveAnswers[descriptor.caseId]);
    checkLiteralArithmetic(expected, source);
  });
}

test('duplicate case retains eleven physical records and the original independent business answers', async () => {
  const fixture = await readValidationCase('FIX-03-D');
  const source = validateSourcePackage(fixture.package);
  assert.deepEqual(source.duplicateCounts, {lines:0, events:1});
  assert.equal(source.physicalEvents[0].payloadHash, source.physicalEvents[10].payloadHash);
  const answer = structuredClone(fixture.expected); answer.counts.physical_events = 10;
  assert.deepEqual(answer, baseline);
});

test('voids distinguish superseded and winning noncontributing revisions with null payloads', async () => {
  for (const [caseId, eventId] of [['FIX-04-RECEIPT-VOID','E01'], ['FIX-04-PROMISE-VOID','E07']]) {
    const fixture = await readValidationCase(caseId);
    const source = validateSourcePackage(fixture.package);
    const revision = source.events.find(event => event.event_id === eventId && event.revision === 2);
    assert.deepEqual([revision.is_void, revision.quantity, revision.promised_date, revision.reason_code], [true,null,null,null]);
    assert.equal(revision.source_recorded_at, '2026-09-21T12:15:00Z');
    assert.deepEqual(fixture.expected.event_states.filter(event => event.event_id === eventId), [
      {event_id:eventId,revision:1,is_winning_revision:false,contributes_to_state:false,is_superseded:true,is_future_effective:false},
      {event_id:eventId,revision:2,is_winning_revision:true,contributes_to_state:false,is_superseded:false,is_future_effective:false},
    ]);
  }
});

test('same known future event is independently annotated before and after its effective cutoff', async () => {
  const before = await readValidationCase('FIX-04-FUTURE-BEFORE');
  const after = await readValidationCase('FIX-04-FUTURE-AFTER');
  assert.equal(before.package.linesText, after.package.linesText);
  assert.equal(before.package.eventsText, after.package.eventsText);
  assert.notEqual(before.sourcePackageHash, after.sourcePackageHash);
  assert.deepEqual(before.expected.event_states.at(-1), {event_id:'E12',revision:1,is_winning_revision:true,contributes_to_state:false,is_superseded:false,is_future_effective:true});
  assert.deepEqual(after.expected.event_states.at(-1), {event_id:'E12',revision:1,is_winning_revision:true,contributes_to_state:true,is_superseded:false,is_future_effective:false});
  assert.deepEqual(before.expected.totals, baseline.totals);
});

test('earlier knowledge replay retains all twelve physical versions but expects only ten known event rows', async () => {
  const fixture = await readValidationCase('FIX-02-EARLY-KNOWLEDGE');
  const source = validateSourcePackage(fixture.package);
  assert.equal(fixture.package.eventsText, await readFile(new URL('../../fixtures/po/FIX-02/line_events.jsonl', import.meta.url), 'utf8'));
  assert.equal(fixture.package.linesText, await readFile(new URL('../../fixtures/po/FIX-02/po_lines.jsonl', import.meta.url), 'utf8'));
  assert.equal(source.events.length, 12);
  assert.equal(source.physicalCounts.events, 12);
  assert.deepEqual(fixture.expected.keys.event_versions, baseline.keys.event_versions);
  assert.deepEqual(fixture.expected.event_states, baseline.event_states);
  assert.equal(fixture.expected.event_states.find(event => event.event_id === 'E10').is_winning_revision, true);
  assert.equal(fixture.expected.event_states.some(event => event.event_id === 'E11'), false);
  const answer = structuredClone(fixture.expected);
  answer.counts.physical_events = 10; answer.counts.canonical_event_versions = 10;
  assert.deepEqual(answer, baseline);
});

test('existing FIX-01 and FIX-02 source and independent oracle bytes stay unchanged', async () => {
  for (const [id, packageHash, oracleHash] of [
    ['FIX-01','d770f164353581d3c890d5bba4ca47b6ebef38142dbb36988c1a2807970a9c6f','6d897f8b1c8d7e92c8a3e3a69d8b6c53ce2df0f9a39b0ca10f85b86059328223'],
    ['FIX-02','7233ba96d4b491bbecb6c83fd292940e66a27706d63aaa014f0959d23f0f4c20','b855a4d8ef008b25d1552a493ed54acb17ead5c39f1a8015f4e7ba635b9a67ff'],
  ]) {
    const directory = new URL(`../../fixtures/po/${id}/`, import.meta.url);
    const manifest = JSON.parse(await readFile(new URL('manifest.json', directory), 'utf8'));
    assert.equal(manifest.source_package_hash, packageHash);
    const source = validateSourcePackage({manifest,linesText:await readFile(new URL('po_lines.jsonl',directory),'utf8'),eventsText:await readFile(new URL('line_events.jsonl',directory),'utf8')});
    assert.equal(source.sourcePackageHash, packageHash);
    assert.equal(sha256(await readFile(new URL('expected.json', directory))), oracleHash);
    assert.equal(canonicalJson(manifest), canonicalJson(source.manifest));
  }
});
