import { mkdir, readFile, readdir, realpath, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildManifest, canonicalJson, GENERATOR_VERSION, readSourcePackage } from '../src/data/source-package.mjs';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = resolve(repository, '.lab', 'fixtures');
const filenames = ['po_lines.jsonl', 'line_events.jsonl', 'manifest.json'];
const within = (parent, child) => { const path = relative(parent, child); return path !== '' && !path.startsWith('..') && !isAbsolute(path); };

async function safeDestination(output) {
  const destination = resolve(output);
  if (!within(outputRoot, destination)) throw new Error('Output must be a child directory of .lab/fixtures');
  // Refuse an existing junction/symlink ancestor that redirects writes out of the repository.
  let existing = destination;
  while (true) {
    try {
      const actual = await realpath(existing);
      const actualRepository = await realpath(repository);
      if (actual !== actualRepository && !within(actualRepository, actual)) throw new Error('Output ancestor resolves outside the repository');
      break;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      existing = dirname(existing);
    }
  }
  return destination;
}

export async function materializeGolden({ fixture, output, spec = GENERATOR_VERSION }) {
  if (!['FIX-01', 'FIX-02'].includes(fixture)) throw new Error('Only FIX-01 and FIX-02 are implemented');
  if (spec !== GENERATOR_VERSION) throw new Error('Unsupported generator specification');
  const destination = await safeDestination(output);
  const source = resolve(repository, 'fixtures', 'po', fixture);
  const admitted = await readSourcePackage(source);
  const [linesText, eventsText] = await Promise.all(filenames.slice(0, 2).map(name => readFile(resolve(source, name), 'utf8')));
  const manifest = buildManifest({ fixtureOrProfile: fixture, businessAsOf: admitted.manifest.business_as_of, knowledgeCutoff: admitted.manifest.knowledge_cutoff, linesText, eventsText });
  if (canonicalJson(manifest) !== canonicalJson(admitted.manifest)) throw new Error('Reviewed source manifest differs from materialized metadata');
  const content = [linesText, eventsText, `${JSON.stringify(manifest, null, 2)}\n`];
  await mkdir(dirname(destination), { recursive: true });
  try {
    await mkdir(destination);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const entries = await readdir(destination);
    if (entries.length !== filenames.length || entries.some(name => !filenames.includes(name))) throw new Error('Output exists with unrelated content; refusing to overwrite');
    const existing = await Promise.all(filenames.map(name => readFile(resolve(destination, name), 'utf8')));
    if (existing.some((text, index) => text !== content[index])) throw new Error('Output differs; refusing to overwrite');
    return { fixture, output: destination, sourcePackageHash: manifest.source_package_hash, created: false };
  }
  for (let index = 0; index < filenames.length; index++) await writeFile(resolve(destination, filenames[index]), content[index], { flag: 'wx' });
  return { fixture, output: destination, sourcePackageHash: manifest.source_package_hash, created: true };
}

export function parseArgs(args) {
  const options = {};
  const supported = ['--profile', '--case', '--spec', '--output'];
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!supported.includes(key) || Object.hasOwn(options, key) || !value || value.startsWith('--')) throw new Error('Use --profile golden --case FIX-01|FIX-02 --spec GEN-01-v1.0 --output .lab/fixtures/<name>');
    options[key] = value;
  }
  if (supported.some(key => !Object.hasOwn(options, key)) || options['--profile'] !== 'golden') throw new Error('Only the explicit golden profile is implemented');
  return { fixture: options['--case'], output: options['--output'], spec: options['--spec'] };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { console.log(JSON.stringify(await materializeGolden(parseArgs(process.argv.slice(2))), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
