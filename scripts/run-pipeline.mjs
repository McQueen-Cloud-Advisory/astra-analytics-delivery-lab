#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readSourcePackage } from '../src/data/source-package.mjs';
import { TARGET, REQUIRED_TABLES } from '../src/pipeline/schemas.mjs';
import { batchIdentity, hash, LIMITS, PipelineError, publicationSql, requireThat, safeFailure, validateReadiness } from '../src/pipeline/core.mjs';
import { reserveAttempt, withLedger, writeJson } from '../src/pipeline/ledger.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
export function parseArguments(args) {
  const options = { mode: 'plan', input: join(root, 'fixtures/po/FIX-01'), readiness: join(root, '.lab/cloud-readiness.json'), stopBeforePublish: false };
  let explicitMode = false;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (['--plan', '--dry-run', '--execute'].includes(arg)) {
      requireThat(!explicitMode, 'INVALID_ARGUMENTS', 'Choose one mode'); options.mode = arg.slice(2); explicitMode = true;
    } else if (arg === '--stop-before-publish') {
      requireThat(!options.stopBeforePublish, 'INVALID_ARGUMENTS', 'Duplicate controlled-stop flag'); options.stopBeforePublish = true;
    } else if (['--input', '--readiness'].includes(arg)) {
      requireThat(args[index + 1] && !args[index + 1].startsWith('--'), 'INVALID_ARGUMENTS', arg);
      options[arg.slice(2)] = resolve(args[++index]);
    } else throw new PipelineError('INVALID_ARGUMENTS', 'Only --plan, --dry-run, --execute, --input, --readiness and --stop-before-publish are supported');
  }
  requireThat(!(options.stopBeforePublish && options.mode === 'dry-run'), 'INVALID_ARGUMENTS', 'Controlled stop requires an execution or local plan');
  return options;
}
async function readPinnedFixture(source) {
  const fixturePath = join(root, 'fixtures/po', source.manifest.fixture_or_profile);
  const pinned = JSON.parse(await readFile(join(fixturePath, 'manifest.json'), 'utf8'));
  requireThat(source.sourcePackageHash === pinned.source_package_hash, 'PINNED_PACKAGE_MISMATCH');
  const oracleText = await readFile(join(fixturePath, 'expected.json'), 'utf8');
  return { oracle: JSON.parse(oracleText), oracleHash: hash(oracleText) };
}
export async function main(args) {
  const options = parseArguments(args);
  const source = await readSourcePackage(options.input), batchId = batchIdentity(source);
  const { oracle, oracleHash } = await readPinnedFixture(source);
  requireThat(!options.stopBeforePublish || source.manifest.fixture_or_profile === 'FIX-02', 'CONTROLLED_STOP_FIX02_ONLY');
  let retainedBatch;
  if (source.manifest.fixture_or_profile === 'FIX-02') {
    const retainedSource = await readSourcePackage(join(root, 'fixtures/po/FIX-01'));
    const retained = await readPinnedFixture(retainedSource);
    retainedBatch = { source: retainedSource, oracle: retained.oracle, batchId: batchIdentity(retainedSource) };
  }
  const transformSql = await readFile(join(root, 'sql/fix01-transform.sql'), 'utf8');
  const readSql = await readFile(join(root, 'sql/read-published-batch.sql'), 'utf8');
  const plan = { mode: options.mode, fixture: source.manifest.fixture_or_profile, source_package_hash: source.sourcePackageHash, oracle_sha256: oracleHash, batch_id: batchId, target: TARGET,
    tables: REQUIRED_TABLES.map(t => `${TARGET.projectId}.${t.datasetId}.${t.tableId}`), source_counts: source.physicalCounts,
    transform_sha256: hash(transformSql), publication_sha256: hash(publicationSql), bounds: LIMITS, controlled_stop_before_publication: options.stopBeforePublish,
    retained_batch_id: retainedBatch?.batchId, cloud_execution: 'Not Run', publication: 'Not Run', desktop_verification: 'Not Run' };
  if (options.mode === 'plan') return plan;
  const readiness = validateReadiness(JSON.parse(await readFile(options.readiness, 'utf8')));
  const resourceManifest = JSON.parse(await readFile(join(root, '.lab/resource-manifest.json'), 'utf8'));
  const directory = join(root, '.lab/pipeline');
  return withLedger(directory, async (ledger, save) => {
    const attempt = reserveAttempt(ledger, readiness, options.mode, batchId); await save();
    try {
      attempt.stage = 'AUTH_CLIENT_INITIALIZING'; await save();
      // No credential/library import occurs in default local plan mode.
      const { createBigQueryClient } = await import('../src/cloud/auth.mjs');
      const { runCloudSlice, settlePriorJobs } = await import('../src/pipeline/bigquery.mjs');
      const client = await createBigQueryClient();
      attempt.stage = 'SETTLING_PRIOR_JOBS'; await save();
      await settlePriorJobs(client, ledger.attempts.filter(a => a.id !== attempt.id), save);
      const result = await runCloudSlice({ client, source, oracle, batchId, transformSql, readSql, mode: options.mode, attempt, save, directory, resourceManifest,
        stopBeforePublish: options.stopBeforePublish, retainedBatch });
      attempt.status = result.expected_controlled_stop ? 'CONTROLLED_STOP' : 'PASS'; attempt.completed_at_utc = new Date().toISOString(); attempt.result = result; await save();
      const evidence = { ...plan, ...result, cloud_execution: options.mode === 'execute' ? 'Pass' : 'Not Run', attempt_id: attempt.id, jobs: attempt.jobs, gate5_decision_ref: readiness.gate5_decision_ref };
      await writeJson(join(directory, `${attempt.id}-result.json`), evidence);
      return evidence;
    } catch (error) {
      attempt.status = 'FAIL'; attempt.completed_at_utc = new Date().toISOString(); attempt.failure = safeFailure(error); await save();
      // SDK/auth errors can contain local paths or credential response details. Persist only safe reason codes/job IDs.
      if (error instanceof PipelineError) throw error;
      throw new PipelineError(attempt.failure.code, 'Inspect the recorded job IDs and scoped readiness before any retry');
    }
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).then(result => {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (result.expected_controlled_stop) process.exitCode = 2;
  }).catch(error => {
    const safe = error instanceof PipelineError ? error.message : (error.name === 'SourceValidationError' ? `${error.code}: ${error.locator}` : 'LOCAL_VALIDATION_FAILED');
    process.stderr.write(`${safe}\n`); process.exitCode = 1;
  });
}
