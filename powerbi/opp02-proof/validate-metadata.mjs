// Local source metadata only: never enumerate the project tree or read .pbi,
// settings, caches, binaries, credentials, or arbitrary files added by Desktop.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const defaultRoot = path.dirname(fileURLToPath(import.meta.url));
const report = 'opp02-proof.Report/';
const model = 'opp02-proof.SemanticModel/definition/';
const visualFiles = ['Context', 'Lines', 'Totals'].map(name =>
  `${report}definition/pages/Proof/visuals/${name}/visual.json`);

// This is the deliberately small proof's entire supported source surface.
// New report features need an explicit source-list change, never recursive reads.
export const SOURCE_FILES = Object.freeze([
  'opp02-proof.pbip', `${report}definition.pbir`, 'opp02-proof.SemanticModel/definition.pbism',
  `${report}definition/report.json`, `${report}definition/version.json`,
  `${report}definition/pages/pages.json`, `${report}definition/pages/Proof/page.json`,
  ...visualFiles, `${model}database.tmdl`, `${model}model.tmdl`,
  `${model}expressions.tmdl`, `${model}tables/PoLines.tmdl`,
]);

export function validateMetadata(root = defaultRoot, { readFile = fs.readFileSync } = {}) {
  const rootPath = fs.realpathSync(root);
  const containsPrivateFolder = candidate => candidate.split(path.sep)
    .some(part => /^(?:\.pbi|caches?|settings|autorecovery)$/i.test(part));
  assert(!containsPrivateFolder(path.resolve(root)) && !containsPrivateFolder(rootPath),
    'Source root is not a permitted location.');
  const sources = new Map();
  for (const relative of SOURCE_FILES) {
    assert.match(relative, /\.(?:json|pbip|pbir|pbism|tmdl)$/);
    const target = fs.realpathSync(path.join(rootPath, relative));
    const resolvedRelative = path.relative(rootPath, target);
    assert(!path.isAbsolute(resolvedRelative) && !resolvedRelative.startsWith('..') &&
      !containsPrivateFolder(resolvedRelative),
    'Source metadata resolves outside its permitted location.');
    // An allowlisted name may not be redirected to another file or directory.
    assert.equal(path.normalize(target).toLowerCase(), path.join(rootPath, relative).toLowerCase(),
      'Redirected source metadata is not permitted.');
    const text = new TextDecoder('utf-8', { fatal: true }).decode(readFile(target)).replace(/^\uFEFF/, '');
    sources.set(relative, text);
  }
  const read = relative => {
    assert(sources.has(relative), 'Attempt to read non-allowlisted source metadata.');
    return sources.get(relative);
  };
  const json = relative => JSON.parse(read(relative));
  // Parse every allowlisted JSON source, accepting legal UTF-8 BOM and CRLF.
  for (const relative of SOURCE_FILES.filter(name => !name.endsWith('.tmdl'))) json(relative);
  assert.equal(json('opp02-proof.pbip').artifacts[0].report.path, 'opp02-proof.Report');
  assert.equal(json(`${report}definition.pbir`).datasetReference.byPath.path, '../opp02-proof.SemanticModel');
  assert.equal(json(`${report}definition/pages/pages.json`).activePageName, 'Proof');
  assert.deepEqual(json(`${report}definition/pages/pages.json`).pageOrder, ['Proof']);
  assert.equal(json(`${report}definition/pages/Proof/page.json`).name, 'Proof');
  assert.match(read(`${model}model.tmdl`), /ref\s+table\s+'?PoLines'?/);
  // Desktop can omit a redundant ref expression while preserving expressions.tmdl.
  const table = read(`${model}tables/PoLines.tmdl`);
  const expressions = read(`${model}expressions.tmdl`);
  assert.match(table, /mode\s*:\s*import/);
  const connector = table.match(/GoogleBigQuery\.Database\(\s*\[([^\]]+)\]\s*\)/s)?.[1];
  assert(connector, 'Missing explicit BigQuery connector options.');
  assert.match(connector, /BillingProject\s*=\s*"astra-po-lab-20260921"/);
  assert.match(connector, /Implementation\s*=\s*"2\.0"/);
  assert.match(connector, /UseStorageApi\s*=\s*true/);
  assert.equal((table.match(/WHERE\s+batch_id\s*=/g) || []).length, 2);
  assert.equal((table.match(/&\s*BatchId\s*&/g) || []).length, 2);
  assert.match(expressions, /expression\s+'?pBatchId'?\s*=\s*"[A-Za-z0-9_-]+"/);
  assert.match(table, /Table\.RowCount\(Manifest\)\s*<>\s*1/);
  assert.match(table, /\[status\]\s*<>\s*"READY"/);
  assert.match(table, /\[validation_result\]\s*<>\s*"PASS"/);
  assert.match(table, /\[fixture_id\]\s*<>\s*"FIX-01"/);
  assert.match(table, /DateTimeZone\.FixedUtcNow\(\)/);
  assert.match(table, /UTCNOW\(\)\s*<\s*AsOfUtc/);
  assert.match(table, /Stale synthetic snapshot/);
  assert.doesNotMatch(table, /financial-analytics-demo|LargeResultDataset|Implementation\s*=\s*"1\.0"/);
  const fields = new Set([...table.matchAll(/^[\t ]+(?:measure|column)\s+(?:'([^']+)'|([^ =\r\n]+))/gm)]
    .map(match => match[1] || match[2]));
  for (const file of visualFiles) {
    for (const projection of json(file).visual.query.queryState.Values.projections) {
      const field = projection.field.Measure || projection.field.Column;
      assert.equal(field.Expression.SourceRef.Entity, 'PoLines');
      assert(fields.has(field.Property), 'Unbound visual field ' + field.Property);
    }
  }
  return { sourceFiles: SOURCE_FILES.length, jsonFiles: 10, tmdlFiles: 4, visualBindings: visualFiles.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = validateMetadata();
  console.log(`PASS: ${result.sourceFiles} allowlisted source files, ${result.visualBindings} visual bindings, Import/batch/manifest/freshness guards. No cache/settings/binary traversal; not a Desktop runtime test.`);
}
