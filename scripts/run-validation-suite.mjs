#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readSourcePackage } from '../src/data/source-package.mjs';
import { VALIDATION_CASES, readValidationCase } from '../src/data/validation-cases.mjs';
import { hash, PipelineError, requireThat, safeFailure, validateReadiness } from '../src/pipeline/core.mjs';
import { prepareValidationSuite, validationSuitePlan, runValidationSuite } from '../src/pipeline/validation-suite.mjs';
import { reserveAttempt, withLedger, writeJson } from '../src/pipeline/ledger.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
export function parseArguments(args) {
  const options = { mode: 'plan', readiness: join(root, '.lab/cloud-readiness.json') };
  let explicit = false;
  for (let index = 0; index < args.length; index++) {
    if (['--plan', '--execute'].includes(args[index])) {
      requireThat(!explicit, 'INVALID_ARGUMENTS'); explicit = true; options.mode = args[index].slice(2);
    } else if (args[index] === '--readiness') {
      requireThat(args[index + 1] && !args[index + 1].startsWith('--'), 'INVALID_ARGUMENTS'); options.readiness = resolve(args[++index]);
    } else throw new PipelineError('INVALID_ARGUMENTS', 'Only --plan, --execute and --readiness are supported');
  }
  return options;
}
export async function loadSuite() {
  const [cases, baselineSource, baselineOracle, transformSql, readSql] = await Promise.all([
    Promise.all(VALIDATION_CASES.map(c => readValidationCase(c.caseId))), readSourcePackage(join(root, 'fixtures/po/FIX-01')),
    readFile(join(root, 'fixtures/po/FIX-01/expected.json'), 'utf8').then(JSON.parse),
    readFile(join(root, 'sql/fix01-transform.sql'), 'utf8'), readFile(join(root, 'sql/read-published-batch.sql'), 'utf8'),
  ]);
  const files = ['src/pipeline/validation-suite.mjs', 'scripts/run-validation-suite.mjs', 'src/pipeline/core.mjs',
    'src/pipeline/bigquery.mjs', 'src/pipeline/ledger.mjs', 'src/data/source-package.mjs', 'src/data/validation-cases.mjs'];
  const codeHashes = Object.fromEntries(await Promise.all(files.map(async file => [file, hash(await readFile(join(root, file)))])));
  return prepareValidationSuite({ cases, baselineSource, baselineOracle, transformSql, readSql, codeHashes });
}
export async function main(args) {
  const options = parseArguments(args), suite = await loadSuite(), plan = validationSuitePlan(suite);
  if (options.mode === 'plan') return plan;
  const readiness = validateReadiness(JSON.parse(await readFile(options.readiness, 'utf8')));
  const resourceManifest = JSON.parse(await readFile(join(root, '.lab/resource-manifest.json'), 'utf8'));
  const directory = join(root, '.lab/pipeline');
  return withLedger(directory, async (ledger, save) => {
    const attempt = reserveAttempt(ledger, readiness, 'validation-suite', suite.suiteId); await save();
    try {
      // Neither this import nor any credentials/cloud requests occur in plan mode.
      const { createBigQueryClient } = await import('../src/cloud/auth.mjs');
      const { settlePriorJobs } = await import('../src/pipeline/bigquery.mjs');
      const client = await createBigQueryClient();
      await settlePriorJobs(client, ledger.attempts.filter(a => a.id !== attempt.id), save);
      const result = await runValidationSuite({ client, suite, attempt, save, directory, resourceManifest });
      attempt.status = 'PASS'; attempt.completed_at_utc = new Date().toISOString(); attempt.result = result; await save();
      const evidence = { ...plan, ...result, mode: 'execute', cloud_execution: 'Pass', attempt_id: attempt.id,
        jobs: attempt.jobs, gate5_decision_ref: readiness.gate5_decision_ref };
      await writeJson(join(directory, `${attempt.id}-result.json`), evidence);
      return evidence;
    } catch (error) {
      attempt.status = 'FAIL'; attempt.completed_at_utc = new Date().toISOString(); attempt.failure = safeFailure(error); await save();
      throw new PipelineError(attempt.failure.code, 'Suite stopped; inspect sanitized attempt/job evidence before any new reserved attempt');
    }
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).then(result => process.stdout.write(JSON.stringify(result, null, 2) + '\n')).catch(error => {
    process.stderr.write(`${safeFailure(error).code}\n`); process.exitCode = 1;
  });
}
