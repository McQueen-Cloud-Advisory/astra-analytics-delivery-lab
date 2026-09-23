import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { inspectText, scanRepository, scanExitCode } from '../../scripts/check-secrets.mjs';

// Deliberately assembled inert patterns; no real token or contiguous candidate
// value is stored in this test source, repository evidence or test output.
const samples = {
  oauth_access_token: ['ya' + '29.' + 'a'.repeat(35), '"access_' + 'token": "' + 'b'.repeat(35) + '"'],
  oauth_refresh_token: ['1' + '//' + 'c'.repeat(35), '"refresh_' + 'token": "' + 'd'.repeat(35) + '"'],
  private_key: ['-----' + 'BEGIN ' + 'PRIVATE KEY' + '-----', '-----' + 'BEGIN RSA ' + 'PRIVATE KEY' + '-----'],
  github_token: ['gh' + 'p_' + 'e'.repeat(36), 'github_' + 'pat_' + 'f'.repeat(70)],
  google_api_key: ['AI' + 'za' + 'g'.repeat(35)],
};
const tempParent = fs.realpathSync(os.tmpdir());
function repo(t) {
  const root = fs.mkdtempSync(path.join(tempParent, 'astra-source-scan-'));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), tempParent);
    assert(path.basename(root).startsWith('astra-source-scan-'));
    fs.rmSync(root, { recursive: true, force: true });
  });
  const git = args => execFileSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false', '-C', root, ...args],
    { stdio: ['ignore', 'pipe', 'pipe'] });
  git(['init', '--quiet']);
  const write = (file, body) => {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, body);
  };
  return { root, git, write };
}

test('detects the bounded token families without returning any secret text', () => {
  for (const [kind, texts] of Object.entries(samples)) {
    for (const text of texts) {
      const result = inspectText(text);
      assert.deepEqual(result, [kind]);
      assert(!JSON.stringify(result).includes(text));
    }
  }
  assert.deepEqual(inspectText('fake-test-token; public project ID; key names: access_token, refresh_token; SHA-256 ' + 'a'.repeat(64)), []);
  assert.deepEqual(inspectText(samples.github_token[0] + '\n' + samples.github_token[0]), ['github_token']);
});

test('Git inventory includes tracked and untracked source, historical oracle JSON, and excludes ignored source', t => {
  const { root, git, write } = repo(t);
  write('.gitignore', 'ignored/\n');
  write('src/clean.mjs', 'export const value = 1;\n');
  write('fixtures/po/oracle-history/old.json', JSON.stringify({ accidental: samples.google_api_key[0] }));
  git(['add', '.gitignore', 'src/clean.mjs', 'fixtures/po/oracle-history/old.json']);
  write('new.md', samples.github_token[0]);
  write('ignored/leak.json', samples.oauth_access_token[0]);
  const reads = [];
  const result = scanRepository(root, { readFile(file) {
    const relative = path.relative(root, file).replaceAll('\\', '/');
    assert(!relative.startsWith('ignored/'));
    reads.push(relative);
    return fs.readFileSync(file);
  } });
  assert.deepEqual(result.findings, [
    { file: 'fixtures/po/oracle-history/old.json', kind: 'google_api_key' },
    { file: 'new.md', kind: 'github_token' },
  ]);
  assert.deepEqual(result.errors, []);
  assert.equal(result.scannedFiles, 4);
  assert.equal(reads.length, 4);
  assert.equal(scanExitCode(result), 1);
  for (const texts of Object.values(samples)) for (const text of texts) assert(!JSON.stringify(result).includes(text));
});

test('flags tracked private paths without reading them; excludes untracked private paths and binaries', t => {
  const { root, git, write } = repo(t);
  const privateFiles = ['.pbi/cache.abf', '.lab/local.json', 'node_modules/package/index.js',
    'credentials/client.json', '.env', '.env.example', 'nested/.pbi/settings.json',
    'nested/settings.json', 'application_default_credentials.json', 'identity.pem'];
  for (const file of privateFiles) write(file, Buffer.from([0xff, 0x00]));
  git(['add', '--', ...privateFiles]);
  write('untracked/.pbi/cache.abf', Buffer.from([0xff, 0x00]));
  write('image.png', Buffer.from([0xff, 0x00]));
  write('safe.json', '{}');
  const reads = [];
  const result = scanRepository(root, { readFile(file) {
    reads.push(path.relative(root, file).replaceAll('\\', '/'));
    assert.equal(path.basename(file), 'safe.json');
    return fs.readFileSync(file);
  } });
  assert.deepEqual(reads, ['safe.json']);
  assert.deepEqual(result.findings.map(f => f.file), [...privateFiles].sort());
  assert(result.findings.every(f => f.kind === 'tracked_private_path'));
  assert.equal(result.skippedPrivateFiles, privateFiles.length + 1);
  assert.equal(result.skippedNonSourceFiles, 1);
  assert.deepEqual(result.errors, []);
});

test('rejects redirected source folders before private content reads', t => {
  const { root, git, write } = repo(t);
  write('src/allowed.json', '{}');
  git(['add', 'src/allowed.json']);
  fs.renameSync(path.join(root, 'src'), path.join(root, '.pbi'));
  fs.symlinkSync(path.join(root, '.pbi'), path.join(root, 'src'), process.platform === 'win32' ? 'junction' : 'dir');
  const result = scanRepository(root, { readFile() { assert.fail('Redirected/private contents must not be read.'); } });
  assert(result.errors.some(error => error.file === 'src/allowed.json' && error.kind === 'redirected_source_path'));
  assert.equal(result.scannedFiles, 0);
  assert.equal(scanExitCode(result), 2);
  const privateRoot = scanRepository(path.join(root, '.pbi'), { readFile() { assert.fail('Private root read.'); } });
  assert.deepEqual(privateRoot.errors, [{ file: '.', kind: 'private_or_redirected_root' }]);
});

test('fails closed on unreadable, oversized or non-text source without exposing error payloads', t => {
  const { root, write } = repo(t);
  write('bad.json', Buffer.from([0xff]));
  write('nul.json', Buffer.from([0x00]));
  write('large.json', 'x'.repeat(2 * 1024 * 1024 + 1));
  write('unreadable.json', '{}');
  const sensitiveError = samples.oauth_access_token[0];
  const result = scanRepository(root, { readFile(file) {
    assert.notEqual(path.basename(file), 'large.json', 'Size limit must precede content read.');
    if (path.basename(file) === 'unreadable.json') throw new Error(sensitiveError);
    return fs.readFileSync(file);
  } });
  assert.deepEqual(result.errors.map(error => error.kind), [
    'source_read_or_encoding_failed', 'source_size_limit', 'non_text_source', 'source_read_or_encoding_failed',
  ]);
  assert(!JSON.stringify(result).includes(sensitiveError));
  assert.equal(scanExitCode(result), 2);
});

test('clean known source produces exit zero while unscanned types remain explicit', t => {
  const { root, write } = repo(t);
  write('README.md', 'Sanitized documentation.');
  write('unknown.custom', 'Not a supported source type.');
  const result = scanRepository(root);
  assert.equal(result.scannedFiles, 1);
  assert.equal(result.skippedNonSourceFiles, 1);
  assert.deepEqual(result.findings, []);
  assert.deepEqual(result.errors, []);
  assert.equal(scanExitCode(result), 0);
});

test('CLI emits sanitized JSON and returns nonzero for a finding, zero after removal', t => {
  const { root, write } = repo(t);
  write('scripts/check-secrets.mjs', fs.readFileSync(new URL('../../scripts/check-secrets.mjs', import.meta.url)));
  write('src/example.json', JSON.stringify({ accidental: samples.google_api_key[0] }));
  const run = () => spawnSync(process.execPath, [path.join(root, 'scripts/check-secrets.mjs')],
    { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const found = run();
  assert.equal(found.status, 1);
  assert.equal(found.stderr, '');
  assert.deepEqual(JSON.parse(found.stdout).findings, [{ file: 'src/example.json', kind: 'google_api_key' }]);
  assert(!found.stdout.includes(samples.google_api_key[0]));
  write('src/example.json', '{}');
  const clean = run();
  assert.equal(clean.status, 0);
  assert.equal(clean.stderr, '');
  assert.deepEqual(JSON.parse(clean.stdout).findings, []);
});
