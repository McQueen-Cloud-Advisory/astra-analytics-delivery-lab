import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { canonicalJson, readSourcePackage, selectWinningEvents, sha256 } from '../../src/data/source-package.mjs';

// These constants preserve the previously reviewed business oracle before adding event annotations.
// They were fingerprinted from the literal expected files, not from SQL or computed source results.
const businessOracleHashes = {
  'FIX-01': '71a586d9b838b087b1b9be3e2ef7653e510d024e6162c3c9a85d9fae463a6476',
  'FIX-02': '3f93da705b39a87cfddbb4b01a0c70a6c395859ef446cce783d429bd7e8d840f',
};
const packageHashes = {
  'FIX-01': 'd770f164353581d3c890d5bba4ca47b6ebef38142dbb36988c1a2807970a9c6f',
  'FIX-02': '7233ba96d4b491bbecb6c83fd292940e66a27706d63aaa014f0959d23f0f4c20',
};
const fixtureRoot = id => new URL(`../../fixtures/po/${id}/`, import.meta.url);
const expected = async id => JSON.parse(await readFile(new URL('expected.json', fixtureRoot(id)), 'utf8'));
const key = row => `${row.event_id}/${row.revision}`;

for (const id of ['FIX-01', 'FIX-02']) {
  test(`${id} event annotations cover every retained revision without changing the business oracle or source identity`, async () => {
    const oracle = await expected(id);
    const source = await readSourcePackage(fileURLToPath(fixtureRoot(id)));
    const { event_states: states, ...previousBusinessOracle } = oracle;
    assert.equal(sha256(canonicalJson(previousBusinessOracle)), businessOracleHashes[id]);
    assert.equal(source.sourcePackageHash, packageHashes[id]);
    assert.deepEqual(states.map(key), oracle.keys.event_versions);
    assert.equal(new Set(states.map(key)).size, states.length);
    assert.equal(states.length, oracle.counts.canonical_event_versions);
    assert.equal(states.filter(row => row.is_winning_revision).length, oracle.counts.winning_events);
    for (const row of states) {
      assert.deepEqual(Object.keys(row).sort(), ['event_id','revision','is_winning_revision','contributes_to_state','is_superseded','is_future_effective'].sort());
      for (const flag of ['is_winning_revision','contributes_to_state','is_superseded','is_future_effective']) assert.equal(typeof row[flag], 'boolean');
    }
    const selected = selectWinningEvents(source.events, source.manifest, source.lines);
    assert.deepEqual(selected.map(key).sort(), states.filter(row => row.is_winning_revision).map(key).sort());
  });
}

test('FIX-02 retains the superseded receipt and selects the two independently specified late changes', async () => {
  const oracle = await expected('FIX-02');
  assert.deepEqual(oracle.event_states.filter(row => row.is_superseded), [
    {event_id:'E10',revision:1,is_winning_revision:false,contributes_to_state:false,is_superseded:true,is_future_effective:false},
  ]);
  assert.deepEqual(oracle.event_states.filter(row => ['E10/2','E11/1'].includes(key(row))), [
    {event_id:'E10',revision:2,is_winning_revision:true,contributes_to_state:true,is_superseded:false,is_future_effective:false},
    {event_id:'E11',revision:1,is_winning_revision:true,contributes_to_state:true,is_superseded:false,is_future_effective:false},
  ]);
  assert.equal(oracle.event_states.some(row => row.is_future_effective), false);
  assert.equal(oracle.event_states.filter(row => row.contributes_to_state).length, 11);
});

test('replaying full FIX-02 source at the original knowledge cutoff selects the independent FIX-01 event oracle', async () => {
  const source = await readSourcePackage(fileURLToPath(fixtureRoot('FIX-02')));
  const first = await expected('FIX-01');
  const selected = selectWinningEvents(source.events, {...source.manifest,knowledge_cutoff:first.knowledge_cutoff}, source.lines);
  assert.deepEqual(selected.map(key).sort(), first.event_states.filter(row => row.is_winning_revision).map(key).sort());
  assert.equal(selected.find(row => row.event_id === 'E10').quantity, 5);
  assert.equal(selected.some(row => row.event_id === 'E11'), false);
});
