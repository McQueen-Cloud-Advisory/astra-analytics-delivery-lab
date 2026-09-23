import { mkdir, open, readFile, rename, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { LIMITS, PipelineError, quotaDate, requireThat, validateReadiness } from './core.mjs';

const renameRetryDelays = Object.freeze([50, 100, 200, 400]);
const transientRenameErrors = new Set(['EPERM', 'EBUSY', 'EACCES']);
const waitForRename = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

export async function writeJson(path, value, { renameFile = rename, wait = waitForRename } = {}) {
  const temp = `${path}.${randomUUID()}.tmp`;
  await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' });
  for (let attempt = 0; ; attempt++) {
    try { await renameFile(temp, path); return; }
    catch (error) {
      // Retry only the same atomic replacement, for at most 750 ms of total delay.
      // Never remove/overwrite the destination as a fallback. A persistent failure
      // keeps both the prior journal and the complete temporary candidate for review.
      if (!transientRenameErrors.has(error.code) || attempt >= renameRetryDelays.length) throw error;
      await wait(renameRetryDelays[attempt]);
    }
  }
}
export function reserveAttempt(ledger, readiness, mode, batchId, now = new Date()) {
  validateReadiness(readiness, now);
  requireThat(ledger?.schema_version === 1 && Array.isArray(ledger.attempts), 'INVALID_LEDGER');
  const day = quotaDate(now), today = ledger.attempts.filter(a => a.quota_date === day);
  requireThat(today.length < LIMITS.attempts, 'DAILY_ATTEMPT_LIMIT');
  // Keep full reservations for failed/unknown work and conservative double-counting of refreshed usage.
  const reserved = today.reduce((n, a) => {
    requireThat(Number.isSafeInteger(a.reserved_bytes) && a.reserved_bytes === LIMITS.attemptBytes, 'INVALID_LEDGER');
    return n + a.reserved_bytes;
  }, 0);
  requireThat(readiness.known_project_billed_bytes_today + reserved + LIMITS.attemptBytes <= LIMITS.dailyBytes, 'DAILY_BYTE_LIMIT');
  const attempt = { id: randomUUID().replaceAll('-', ''), quota_date: day, started_at_utc: now.toISOString(), batch_id: batchId, mode,
    reserved_bytes: LIMITS.attemptBytes, status: 'IN_PROGRESS', jobs: [] };
  ledger.attempts.push(attempt);
  return attempt;
}
export async function withLedger(directory, callback) {
  await mkdir(directory, { recursive: true });
  const lockPath = join(directory, 'run.lock');
  let lock;
  try { lock = await open(lockPath, 'wx'); }
  catch (error) { if (error.code === 'EEXIST') throw new PipelineError('RUN_LOCKED', 'Inspect retained jobs before manually resolving a stale lock'); throw error; }
  try {
    await lock.writeFile(JSON.stringify({ pid: process.pid, created_at_utc: new Date().toISOString() }));
    const path = join(directory, 'attempt-ledger.json');
    let ledger;
    try { ledger = JSON.parse(await readFile(path, 'utf8')); }
    catch (error) { if (error.code !== 'ENOENT') throw error; ledger = { schema_version: 1, attempts: [] }; }
    return await callback(ledger, () => writeJson(path, ledger));
  } finally { await lock.close(); await unlink(lockPath); }
}
