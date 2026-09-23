import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCE_FILES, validateMetadata } from '../../powerbi/opp02-proof/validate-metadata.mjs';

const sourceRoot = fileURLToPath(new URL('../../powerbi/opp02-proof/', import.meta.url));
const tempParent = fs.realpathSync(os.tmpdir());
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(tempParent, 'astra-proof-metadata-'));
  t.after(() => {
    // Verify the exact temporary target before recursive removal on Windows.
    assert.equal(path.dirname(path.resolve(dir)), tempParent);
    assert(path.basename(dir).startsWith('astra-proof-metadata-'));
    fs.rmSync(dir, { recursive: true, force: true });
  });
  for (const relative of SOURCE_FILES) {
    const target = path.join(dir, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(sourceRoot, relative), target);
  }
  return dir;
}

test('reads only the 14 allowlisted source files despite caches/settings/binaries anywhere in proof', t => {
  const dir = fixture(t);
  const canaries = [
    '.pbi/cache.abf', 'opp02-proof.Report/.pbi/localSettings.json',
    'opp02-proof.SemanticModel/.pbi/unappliedChanges.json', 'private.bin', 'settings.json',
    'opp02-proof.Report/definition/.pbi/cache.abf',
    'opp02-proof.Report/definition/pages/Proof/visuals/Extra/visual.json',
    'opp02-proof.SemanticModel/definition/tables/private.json',
  ];
  for (const relative of canaries) {
    const file = path.join(dir, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Buffer.from([0xef, 0xbb, 0xbf, 0xff, 0x00]));
  }
  const reads = [];
  const result = validateMetadata(dir, { readFile(file) {
    const relative = path.relative(dir, file).replaceAll('\\', '/');
    assert(SOURCE_FILES.includes(relative), 'Attempted private/non-source read: ' + relative);
    reads.push(relative);
    return fs.readFileSync(file);
  } });
  assert.deepEqual(reads, [...SOURCE_FILES]);
  assert.equal(result.sourceFiles, 14);
  assert.equal(result.visualBindings, 3);
});

test('accepts Desktop BOM/CRLF/annotations, spacing and omitted redundant expression reference without rewriting', t => {
  const dir = fixture(t);
  for (const relative of SOURCE_FILES) {
    const file = path.join(dir, relative);
    let text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').replaceAll('\r\n', '\n');
    if (relative.endsWith('/model.tmdl')) text = text.replace(/^ref expression pBatchId\s*$/gm, '');
    if (relative.endsWith('/PoLines.tmdl')) text = text.replaceAll('\t', '    ')
      .replace('BillingProject = ', 'BillingProject=')
      .replace('Implementation = ', 'Implementation  =  ');
    fs.writeFileSync(file, '\uFEFF' + text.replaceAll('\n', '\r\n'));
  }
  const before = SOURCE_FILES.map(relative => fs.readFileSync(path.join(dir, relative)));
  assert.equal(validateMetadata(dir).jsonFiles, 10);
  assert.equal(validateMetadata(dir).tmdlFiles, 4);
  SOURCE_FILES.forEach((relative, index) => assert.deepEqual(fs.readFileSync(path.join(dir, relative)), before[index]));
});

test('still rejects a broken visual binding or an unauthorized billing target', t => {
  const dir = fixture(t);
  const visualPath = path.join(dir, 'opp02-proof.Report/definition/pages/Proof/visuals/Totals/visual.json');
  const original = fs.readFileSync(visualPath);
  const visual = JSON.parse(original);
  visual.visual.query.queryState.Values.projections[0].field.Measure.Property = 'Missing measure';
  fs.writeFileSync(visualPath, JSON.stringify(visual));
  assert.throws(() => validateMetadata(dir), /Unbound visual field Missing measure/);
  fs.writeFileSync(visualPath, original);
  const tablePath = path.join(dir, 'opp02-proof.SemanticModel/definition/tables/PoLines.tmdl');
  fs.writeFileSync(tablePath, fs.readFileSync(tablePath, 'utf8').replace('BillingProject = "astra-po-lab-20260921"', 'BillingProject = "unapproved-project"'));
  assert.throws(() => validateMetadata(dir), /BillingProject/);
});

test('a redirected source folder cannot make the validator read a hidden settings/cache location', t => {
  const dir = fixture(t);
  const definition = path.join(dir, 'opp02-proof.Report/definition');
  const privateTarget = path.join(dir, '.pbi');
  fs.renameSync(definition, privateTarget);
  fs.symlinkSync(privateTarget, definition, process.platform === 'win32' ? 'junction' : 'dir');
  const reads = [];
  assert.throws(() => validateMetadata(dir, { readFile(file) {
    reads.push(file);
    assert(!file.split(path.sep).includes('.pbi'), 'Must reject before reading private content.');
    return fs.readFileSync(file);
  } }), /permitted location|Redirected source/);
  assert(reads.length < SOURCE_FILES.length);
  assert.throws(() => validateMetadata(privateTarget, { readFile() {
    assert.fail('A private source root must be rejected before any read.');
  } }), /permitted location/);
});
