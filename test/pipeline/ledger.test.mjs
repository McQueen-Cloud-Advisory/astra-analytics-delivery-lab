import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { writeJson } from '../../src/pipeline/ledger.mjs';

async function withJournal(callback) {
  const prefix = join(tmpdir(), 'astra-ledger-retry-');
  const directory = await mkdtemp(prefix), path = join(directory, 'attempt-ledger.json');
  const previous = '{"status":"previous-valid-journal"}\n';
  await writeFile(path, previous);
  try { await callback({ directory, path, previous }); }
  finally { assert.ok(directory.startsWith(prefix)); await rm(directory, { recursive: true, force: true }); }
}

for (const code of ['EPERM', 'EBUSY', 'EACCES']) {
  test(`transient ${code} retries the same atomic rename and preserves the old journal until success`, async () => {
    await withJournal(async ({ directory, path, previous }) => {
      const replacement = { status: 'new-valid-journal', jobs: ['known-job'] }, calls = [], waits = [];
      await writeJson(path, replacement, {
        renameFile: async (source, target) => {
          calls.push([source, target]);
          assert.equal(target, path);
          assert.equal(await readFile(path, 'utf8'), previous);
          assert.deepEqual(JSON.parse(await readFile(source, 'utf8')), replacement);
          if (calls.length < 3) throw Object.assign(new Error('simulated sharing lock'), { code });
          return rename(source, target);
        },
        wait: async milliseconds => { waits.push(milliseconds); },
      });
      assert.equal(calls.length, 3); assert.deepEqual(waits, [50, 100]);
      assert.ok(calls.every(([source, target]) => source === calls[0][0] && target === path));
      assert.deepEqual(JSON.parse(await readFile(path, 'utf8')), replacement);
      assert.deepEqual(await readdir(directory), ['attempt-ledger.json']);
    });
  });
}

test('persistent sharing failure stops after five atomic attempts and retains old journal plus complete temp', async () => {
  await withJournal(async ({ directory, path, previous }) => {
    const replacement = { status: 'complete-candidate', jobs: ['existing-cloud-job'] }, waits = [], calls = [];
    const failure = Object.assign(new Error('persistent sharing lock'), { code: 'EPERM' });
    await assert.rejects(writeJson(path, replacement, {
      renameFile: async (source, target) => { calls.push([source, target]); throw failure; },
      wait: async milliseconds => { waits.push(milliseconds); },
    }), error => error === failure);
    assert.equal(calls.length, 5); assert.deepEqual(waits, [50, 100, 200, 400]);
    assert.ok(calls.every(([source, target]) => source === calls[0][0] && target === path));
    assert.equal(await readFile(path, 'utf8'), previous);
    assert.deepEqual(JSON.parse(await readFile(calls[0][0], 'utf8')), replacement);
    assert.equal((await readdir(directory)).length, 2);
  });
});

test('non-transient rename errors fail immediately without removing the old journal or candidate', async () => {
  await withJournal(async ({ path, previous }) => {
    let calls = 0, temp;
    await assert.rejects(writeJson(path, { status: 'candidate' }, {
      renameFile: async source => { calls++; temp = source; throw Object.assign(new Error('not retryable'), { code: 'ENOENT' }); },
      wait: async () => assert.fail('non-transient failure must not wait'),
    }), error => error.code === 'ENOENT');
    assert.equal(calls, 1); assert.equal(await readFile(path, 'utf8'), previous);
    assert.deepEqual(JSON.parse(await readFile(temp, 'utf8')), { status: 'candidate' });
  });
});
