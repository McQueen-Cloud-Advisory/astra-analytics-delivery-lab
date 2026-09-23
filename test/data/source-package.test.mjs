import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildManifest, businessDate, canonicalJson, packageHash, readSourcePackage, safeAdd, selectWinningEvents, sha256, SourceValidationError, validateSourcePackage } from '../../src/data/source-package.mjs';
import { parseStrictJson } from '../../src/data/strict-json.mjs';
import { materializeGolden, parseArgs } from '../../scripts/generate-po-fixture.mjs';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const fixtureDir = id => join(repository, 'fixtures', 'po', id);
const loadText = (id, name) => readFile(join(fixtureDir(id), name), 'utf8');
const baseLines = await loadText('FIX-01', 'po_lines.jsonl');
const baseEvents = await loadText('FIX-01', 'line_events.jsonl');
const lineRows = () => baseLines.trimEnd().split('\n').map(JSON.parse);
const eventRows = () => baseEvents.trimEnd().split('\n').map(JSON.parse);
const serialize = records => records.map(record => JSON.stringify(record)).join('\n') + '\n';
const oracle = async id => JSON.parse(await loadText(id, 'expected.json'));

function candidate({ lines = baseLines, events = baseEvents, asOf = '2026-09-21T12:00:00Z', cutoff = asOf } = {}) {
  return { linesText: lines, eventsText: events, manifest: buildManifest({fixtureOrProfile:'FIX-01',businessAsOf:asOf,knowledgeCutoff:cutoff,linesText:lines,eventsText:events}) };
}
function rejects(input, code, locatorPattern) {
  assert.throws(() => validateSourcePackage(input), error => {
    assert.ok(error instanceof SourceValidationError);
    assert.equal(error.code, code);
    if (locatorPattern) assert.match(error.locator, locatorPattern);
    return true;
  });
}
function faultEvent(overrides = {}) {
  return {event_id:'E99',revision:1,line_id:'L01',event_type:'RECEIPT',event_at:'2026-09-19T15:00:00Z',source_recorded_at:'2026-09-19T15:05:00Z',is_void:false,quantity:1,promised_date:null,reason_code:null,...overrides};
}

for (const fixture of ['FIX-01', 'FIX-02']) {
  test(`${fixture} literal identities and counts match the separate frozen oracle`, async () => {
    const admitted = await readSourcePackage(fixtureDir(fixture));
    const expected = await oracle(fixture);
    assert.deepEqual(admitted.lines.map(line => line.line_id), expected.keys.line_ids);
    assert.deepEqual(admitted.events.map(event => `${event.event_id}/${event.revision}`), expected.keys.event_versions);
    assert.equal(admitted.physicalCounts.lines, expected.counts.physical_lines);
    assert.equal(admitted.physicalCounts.events, expected.counts.physical_events);
    assert.equal(admitted.lines.length, expected.counts.canonical_lines);
    assert.equal(admitted.events.length, expected.counts.canonical_event_versions);
    assert.equal(selectWinningEvents(admitted.events, admitted.manifest, admitted.lines).length, expected.counts.winning_events);
    assert.deepEqual(admitted.duplicateCounts, {lines:0,events:0});
    assert.equal(admitted.manifest.business_as_of, expected.business_as_of);
    assert.equal(admitted.manifest.knowledge_cutoff, expected.knowledge_cutoff);
    assert.equal(businessDate(admitted.manifest.business_as_of), expected.business_date);
  });
}

test('FIX-02 corrections replace a revision and preserve separate late-arrival identity', async () => {
  const admitted = await readSourcePackage(fixtureDir('FIX-02'));
  const selected = selectWinningEvents(admitted.events, admitted.manifest, admitted.lines);
  assert.equal(selected.find(event => event.event_id === 'E10').quantity, 3);
  assert.equal(selected.find(event => event.event_id === 'E10').revision, 2);
  assert.equal(selected.find(event => event.event_id === 'E11').quantity, 2);
  const earlier = selectWinningEvents(admitted.events, {...admitted.manifest,knowledge_cutoff:'2026-09-21T12:00:00Z'}, admitted.lines);
  assert.equal(earlier.find(event => event.event_id === 'E10').quantity, 5);
  assert.equal(earlier.some(event => event.event_id === 'E11'), false);
  assert.equal(admitted.events.length, 12, 'Selection must not delete retained revisions');
});

test('exact duplicate records retain raw occurrences while property order is semantically irrelevant', () => {
  const reverseFields = Object.fromEntries(Object.entries(eventRows()[0]).reverse());
  const result = validateSourcePackage(candidate({events:baseEvents + JSON.stringify(reverseFields) + '\n',lines:baseLines + JSON.stringify(lineRows()[0]) + '\n'}));
  assert.deepEqual(result.physicalCounts, {lines:11,events:11});
  assert.deepEqual(result.duplicateCounts, {lines:1,events:1});
  assert.equal(result.physicalEvents[0].payloadHash, result.physicalEvents[10].payloadHash);
  assert.equal(result.physicalEvents[10].recordLocator, 'line_events.jsonl:11');
  assert.equal(result.events.length, 10);
});

test('canonical hashing has fixed encoding and the standard SHA-256 abc vector', () => {
  assert.equal(canonicalJson({z:[true,null],a:{y:2,x:1}}), '{"a":{"x":1,"y":2},"z":[true,null]}');
  assert.equal(sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  const first = candidate().manifest;
  const reordered = Object.fromEntries(Object.entries(first).reverse());
  assert.equal(packageHash(first), packageHash(reordered));
  assert.notEqual(packageHash(first), packageHash({...first,knowledge_cutoff:'2026-09-21T13:00:00Z'}));
});

test('conflicting event revision never uses physical last-row wins', () => {
  const bad = {...eventRows()[0],quantity:5};
  rejects(candidate({events:baseEvents + JSON.stringify(bad) + '\n'}), 'CONFLICTING_REVISION', /:11$/);
  rejects(candidate({events:JSON.stringify(bad) + '\n' + baseEvents}), 'CONFLICTING_REVISION');
});
test('immutable line payload or business key collision blocks admission', () => {
  rejects(candidate({lines:baseLines + JSON.stringify({...lineRows()[0],unit_price_cents:1100}) + '\n'}), 'CONFLICTING_LINE');
  rejects(candidate({lines:baseLines + JSON.stringify({...lineRows()[0],line_id:'ANOTHER'}) + '\n'}), 'CONFLICTING_LINE');
});
test('over-receipt and unknown line have the independently specified rejection reason', () => {
  rejects(candidate({events:baseEvents + JSON.stringify(faultEvent({quantity:7})) + '\n'}), 'QUANTITY_EXCEEDS_ORDER');
  rejects(candidate({events:baseEvents + JSON.stringify(faultEvent({line_id:'L99'})) + '\n'}), 'MISSING_LINE');
});
test('short-close cancellation participates in the same quantity limit', () => {
  rejects(candidate({events:baseEvents + JSON.stringify(faultEvent({line_id:'L04',event_type:'CANCEL',quantity:1,reason_code:'CLOSE_SHORT'})) + '\n'}), 'QUANTITY_EXCEEDS_ORDER');
});
test('source-consistent omission is caught by independent keys, not a self-consistent manifest', async () => {
  const result = validateSourcePackage(candidate({events:serialize(eventRows().slice(1))}));
  const expected = await oracle('FIX-01');
  assert.throws(() => assert.deepEqual(result.events.map(event => `${event.event_id}/${event.revision}`), expected.keys.event_versions));
});

const invalidNumbers = [
  ['"four"', 'INVALID_TYPE'], ['4.0','INVALID_TYPE'], ['4.5','INVALID_TYPE'], ['4e0','INVALID_TYPE'],
  ['NaN','INVALID_TYPE'], ['Infinity','INVALID_TYPE'], ['-1','ARITHMETIC_LIMIT'], ['0','ARITHMETIC_LIMIT'],
  ['1000001','ARITHMETIC_LIMIT'], ['9007199254740993','ARITHMETIC_LIMIT'], ['9007199254740992','ARITHMETIC_LIMIT'],
];
for (const [token, code] of invalidNumbers) {
  test(`quantity token ${token} is rejected before arithmetic`, () => rejects(candidate({events:baseEvents.replace('"quantity":4', `"quantity":${token}`)}), code, /line_events\.jsonl:1/));
}
for (const [field, token] of [['unit_price_cents','100000001'], ['ordered_qty','1000001'], ['line_number','1000001']]) {
  test(`${field} is bounded independently of BigQuery INT64`, () => {
    const lines = lineRows();
    lines[1][field] = Number(token);
    rejects(candidate({lines:serialize(lines)}), 'ARITHMETIC_LIMIT');
  });
}
test('exact integer accumulation accepts the ceiling and rejects the next cent', () => {
  assert.equal(safeAdd(9_007_199_254_740_000, 991), Number.MAX_SAFE_INTEGER);
  assert.throws(() => safeAdd(9_007_199_254_740_000, 992), {code:'ARITHMETIC_LIMIT'});
  assert.throws(() => safeAdd(Number.MAX_SAFE_INTEGER + 1, 0), {code:'ARITHMETIC_LIMIT'});
});

test('duplicate JSON properties, including escaped aliases, are rejected', () => {
  rejects(candidate({events:baseEvents.replace('"quantity":4', '"quantity":4,"quantity":4')}), 'DUPLICATE_JSON_KEY');
  rejects(candidate({events:baseEvents.replace('"quantity":4', '"quantity":4,"quantit\\u0079":4')}), 'DUPLICATE_JSON_KEY');
  assert.throws(() => parseStrictJson('{"files":{},"files":{}}'), {code:'DUPLICATE_JSON_KEY'});
});
test('case-sensitive canonical ordering does not depend on machine locale', () => {
  const events = eventRows();
  events[0].event_id = 'a';
  events[1].event_id = 'Z';
  const result = validateSourcePackage(candidate({events:serialize(events)}));
  const ids = result.events.map(event => event.event_id);
  assert.ok(ids.indexOf('Z') < ids.indexOf('a'));
});
test('deep JSON is rejected with a located admission error instead of exhausting the call stack', () => {
  assert.throws(() => parseStrictJson('['.repeat(20) + '0' + ']'.repeat(20), 'line_events.jsonl:1'), {code:'INVALID_JSON',locator:'line_events.jsonl:1'});
});
for (const [title, text, code] of [
  ['blank record', baseEvents + '\n', 'INVALID_JSON'],
  ['unknown field', baseEvents.replace('"quantity":4','"quantity":4,"extra":true'), 'INVALID_SCHEMA'],
  ['missing field', baseEvents.replace('"quantity":4,',''), 'INVALID_SCHEMA'],
  ['null identifier', baseEvents.replace('"event_id":"E01"','"event_id":null'), 'INVALID_TYPE'],
  ['invalid identifier', baseEvents.replace('"event_id":"E01"','"event_id":"E/01"'), 'INVALID_TYPE'],
  ['invalid date', baseEvents.replace('2026-09-23','2026-02-30'), 'INVALID_TYPE'],
  ['offset timestamp', baseEvents.replace('2026-09-19T14:00:00Z','2026-09-19T14:00:00+00:00'), 'INVALID_TYPE'],
  ['fractional timestamp', baseEvents.replace('2026-09-19T14:00:00Z','2026-09-19T14:00:00.000Z'), 'INVALID_TYPE'],
]) {
  test(`${title} fails complete-candidate admission`, () => rejects(candidate({events:text}), code));
}
test('source and revision chronology cannot be repaired by file order', () => {
  const events = eventRows();
  rejects(candidate({events:serialize([{...events[0],event_at:'2026-09-06T14:00:00Z'},...events.slice(1)])}), 'INVALID_CHRONOLOGY');
  rejects(candidate({events:serialize([{...events[0],source_recorded_at:'2026-09-19T13:00:00Z'},...events.slice(1)])}), 'INVALID_CHRONOLOGY');
  const lines = lineRows();
  lines[0].source_recorded_at = '2026-09-20T00:00:00Z';
  rejects(candidate({lines:serialize(lines)}), 'INVALID_CHRONOLOGY');
  rejects(candidate({events:baseEvents + JSON.stringify({...events[0],revision:2,quantity:3}) + '\n'}), 'INVALID_CHRONOLOGY');
});
test('revision histories are contiguous, physically reorderable and immutable in identity', async () => {
  const events = eventRows();
  rejects(candidate({events:baseEvents + JSON.stringify({...events[9],revision:3,quantity:3,source_recorded_at:'2026-09-20T12:00:00Z'}) + '\n'}), 'REVISION_GAP');
  rejects(candidate({events:serialize([{...events[0],revision:2},...events.slice(1)])}), 'REVISION_GAP');
  for (const changed of [{line_id:'L02'}, {event_at:'2026-09-19T14:01:00Z'}, {event_type:'CANCEL',reason_code:'BUYER_CANCEL'}]) {
    rejects(candidate({events:baseEvents + JSON.stringify({...events[0],revision:2,source_recorded_at:'2026-09-20T12:00:00Z',...changed}) + '\n'}), 'IMMUTABLE_EVENT_CHANGED');
  }
  const later = await loadText('FIX-02','line_events.jsonl');
  const result = validateSourcePackage(candidate({events:serialize(later.trimEnd().split('\n').map(JSON.parse).reverse()),cutoff:'2026-09-21T13:00:00Z'}));
  assert.deepEqual(result.events.map(e => `${e.event_id}/${e.revision}`), (await oracle('FIX-02')).keys.event_versions);
});
test('different same-time promises conflict while equivalent promises can coexist', () => {
  const promise = faultEvent({line_id:'L06',event_type:'PROMISE',event_at:'2026-09-19T09:00:00Z',source_recorded_at:'2026-09-19T09:06:00Z',quantity:null,promised_date:'2026-09-24'});
  rejects(candidate({events:baseEvents + JSON.stringify(promise) + '\n'}), 'CONFLICTING_PROMISE_TIME');
  assert.equal(validateSourcePackage(candidate({events:baseEvents + JSON.stringify({...promise,promised_date:'2026-09-23'}) + '\n'})).events.length, 11);
});
test('voids replace source events without payload, negative receipts or deletion', () => {
  const revision = {...eventRows()[0],revision:2,source_recorded_at:'2026-09-21T12:15:00Z',is_void:true,quantity:null};
  const result = validateSourcePackage(candidate({events:baseEvents + JSON.stringify(revision) + '\n',cutoff:'2026-09-21T13:00:00Z'}));
  assert.equal(selectWinningEvents(result.events,result.manifest,result.lines).find(e => e.event_id === 'E01').is_void, true);
  assert.equal(result.events.filter(e => e.event_id === 'E01').length, 2);
  rejects(candidate({events:baseEvents + JSON.stringify({...revision,quantity:4}) + '\n',cutoff:'2026-09-21T13:00:00Z'}), 'INVALID_TYPE');
});
test('future-effective event is retained but cannot leak into an earlier business snapshot', () => {
  const event = faultEvent({event_id:'E12',event_at:'2026-09-21T12:30:00Z',source_recorded_at:'2026-09-21T12:35:00Z'});
  const result = validateSourcePackage(candidate({events:baseEvents + JSON.stringify(event) + '\n',cutoff:'2026-09-21T13:00:00Z'}));
  assert.equal(result.events.length, 11);
  assert.equal(selectWinningEvents(result.events,result.manifest,result.lines).some(e => e.event_id === 'E12'), false);
  assert.equal(selectWinningEvents(result.events,{...result.manifest,business_as_of:'2026-09-21T13:00:00Z'},result.lines).some(e => e.event_id === 'E12'), true);
});
test('America/New_York date changes at the specified local midnight', () => {
  assert.equal(businessDate('2026-09-21T03:59:59Z'), '2026-09-20');
  assert.equal(businessDate('2026-09-21T04:00:00Z'), '2026-09-21');
});
test('manifest integrity errors are distinct from deliberately rehashed semantic faults', () => {
  const base = candidate();
  rejects({...base,eventsText:baseEvents + ' '}, 'HASH_OR_COUNT_MISMATCH');
  rejects({...base,manifest:{...base.manifest,source_package_hash:'0'.repeat(64)}}, 'HASH_OR_COUNT_MISMATCH');
  const wrongCount = structuredClone(base);
  wrongCount.manifest.files['line_events.jsonl'].record_count = 11;
  wrongCount.manifest.source_package_hash = packageHash(wrongCount.manifest);
  rejects(wrongCount, 'HASH_OR_COUNT_MISMATCH');
  rejects({...base,manifest:{...base.manifest,schema_version:'2.0'}}, 'UNSUPPORTED_VERSION');
  rejects({...base,manifest:{...base.manifest,fixture_or_profile:'coverage'}}, 'UNSUPPORTED_PROFILE');
  rejects(candidate({cutoff:'2026-09-21T11:00:00Z'}), 'INVALID_CHRONOLOGY');
});

test('materialization is byte-reproducible, bounded and does not copy or change the independent oracle', async t => {
  const anchor = join(repository, '.lab', 'fixtures');
  await mkdir(anchor, {recursive:true});
  const scratch = await mkdtemp(join(anchor, 'admission-test-'));
  assert.ok(relative(anchor, scratch).startsWith('admission-test-'));
  t.after(async () => { if (resolve(scratch).startsWith(resolve(anchor) + '\\') || resolve(scratch).startsWith(resolve(anchor) + '/')) await rm(scratch,{recursive:true,force:true}); });
  const expectedBefore = await loadText('FIX-01','expected.json');
  const one = await materializeGolden({fixture:'FIX-01',output:join(scratch,'one')});
  const two = await materializeGolden({fixture:'FIX-01',output:join(scratch,'two')});
  assert.equal(one.sourcePackageHash,two.sourcePackageHash);
  for (const name of ['po_lines.jsonl','line_events.jsonl','manifest.json']) assert.deepEqual(await readFile(join(one.output,name)),await readFile(join(two.output,name)));
  assert.deepEqual((await readdir(one.output)).sort(),['line_events.jsonl','manifest.json','po_lines.jsonl']);
  assert.equal((await materializeGolden({fixture:'FIX-01',output:one.output})).created,false);
  assert.equal(await loadText('FIX-01','expected.json'),expectedBefore);
  await writeFile(join(two.output,'unrelated.txt'),'retain me');
  await assert.rejects(materializeGolden({fixture:'FIX-01',output:two.output}),/refusing to overwrite/);
  assert.equal(await readFile(join(two.output,'unrelated.txt'),'utf8'),'retain me');
  await assert.rejects(materializeGolden({fixture:'FIX-01',output:fixtureDir('FIX-01')}),/child directory/);
  await assert.rejects(materializeGolden({fixture:'coverage',output:join(scratch,'coverage')}),/Only FIX/);
  await assert.rejects(materializeGolden({fixture:'FIX-01',spec:'future',output:join(scratch,'future')}),/Unsupported/);
  await writeFile(join(one.output,'line_events.jsonl'),Buffer.from([0xff]));
  await assert.rejects(readSourcePackage(one.output),{code:'INVALID_JSON',locator:'line_events.jsonl'});
});
test('CLI rejects implicit scale profiles, missing flags and duplicate options', () => {
  const good = ['--profile','golden','--case','FIX-01','--spec','GEN-01-v1.0','--output','.lab/fixtures/FIX-01'];
  assert.deepEqual(parseArgs(good),{fixture:'FIX-01',spec:'GEN-01-v1.0',output:'.lab/fixtures/FIX-01'});
  assert.throws(() => parseArgs(good.concat('--case','FIX-02')));
  assert.throws(() => parseArgs(['--profile','coverage','--rows','100']));
  assert.throws(() => parseArgs(good.slice(0,-2)));
});
