// Bounded working-tree source check. No network, history scan, entropy claim,
// credential validation, recursive traversal, or reading private file contents.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAX_SOURCE_BYTES = 2 * 1024 * 1024;
const textExtensions = new Set(['.mjs', '.cjs', '.js', '.ts', '.tsx', '.jsx', '.json', '.jsonl',
  '.ndjson', '.md', '.txt', '.csv', '.tsv', '.sql', '.yaml', '.yml', '.toml', '.xml', '.html',
  '.css', '.sh', '.ps1', '.py', '.tmdl', '.pbip', '.pbir', '.pbism']);
const textNames = new Set(['LICENSE', '.gitignore', '.gitattributes', '.platform']);
const privateFolders = /^(?:\.pbi|\.lab|node_modules|\.git|\.ssh|\.aws|\.azure|\.config|\.gcloud|\.vscode|\.idea|credentials?|secrets|caches?|\.cache|settings|autorecovery)$/i;
const privateNames = /^(?:\.env(?:[._-].*)?|\.envrc|credentials?(?:[._-].*)?|application_default_credentials\.json|adc\.json|localsettings\.json|unappliedchanges\.json|settings\.json|tokens?\.json|service[-_]account[-_]key\.json|id_(?:rsa|dsa|ecdsa|ed25519)(?:\..*)?)$/i;
const privateExtensions = /\.(?:pem|key|p12|pfx|jks|keystore|abf|pbix|pbit)$/i;

const rules = [
  ['oauth_access_token', /\bya29\.[A-Za-z0-9._~-]{20,}/],
  ['oauth_access_token', /["']?(?:access_token|accessToken)["']?\s*[:=]\s*["'][A-Za-z0-9._~+/=-]{20,}["']/],
  ['oauth_refresh_token', /\b1\/\/[A-Za-z0-9_-]{20,}/],
  ['oauth_refresh_token', /["']?(?:refresh_token|refreshToken)["']?\s*[:=]\s*["'][A-Za-z0-9._~+/=-]{20,}["']/],
  ['private_key', /-{5}BEGIN (?:RSA |EC |DSA |OPENSSH |ENCRYPTED )?PRIVATE KEY-{5}/],
  ['github_token', /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})\b/],
  ['google_api_key', /\bAIza[A-Za-z0-9_-]{35}\b/],
];

/** Pure inspection; returns kinds only, never matching values or excerpts. */
export function inspectText(text) {
  if (typeof text !== 'string') throw new TypeError('Text input required.');
  return [...new Set(rules.filter(([, pattern]) => pattern.test(text)).map(([kind]) => kind))].sort();
}

function privatePath(file) {
  const segments = file.split(/[\\/]/);
  return segments.some(part => privateFolders.test(part) || privateNames.test(part)) || privateExtensions.test(file);
}

function git(root, args) {
  // Disable a repository fsmonitor hook; suppress raw Git diagnostics on failure.
  return execFileSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false', '-C', root, ...args],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024 });
}

const samePath = (a, b) => process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;

/** Reads only Git-listed, allowlisted working-tree source; injectable read for privacy tests. */
export function scanRepository(root = defaultRoot, { readFile = fs.readFileSync } = {}) {
  const summary = {
    scope: 'Git-tracked and untracked nonignored working-tree source text; no Git history or index-content scan',
    listedFiles: 0, scannedFiles: 0, skippedPrivateFiles: 0, skippedNonSourceFiles: 0,
    findings: [], errors: [],
    limitations: 'Bounded known patterns only; a clean result is not proof that credentials are absent. Private contents and unsupported file types are not scanned.',
  };
  const issue = (collection, file, kind) => summary[collection].push({ file, kind });
  let canonicalRoot, tracked, listed;
  try {
    const suppliedRoot = path.resolve(root);
    canonicalRoot = fs.realpathSync(suppliedRoot);
    if (privatePath(suppliedRoot) || privatePath(canonicalRoot) || !samePath(suppliedRoot, canonicalRoot)) {
      issue('errors', '.', 'private_or_redirected_root');
      return summary;
    }
    const gitRoot = fs.realpathSync(git(canonicalRoot, ['rev-parse', '--show-toplevel']).trim());
    if (!samePath(gitRoot, canonicalRoot)) {
      issue('errors', '.', 'root_must_be_repository_root');
      return summary;
    }
    const names = args => git(canonicalRoot, ['ls-files', '-z', ...args]).split('\0').filter(Boolean);
    tracked = new Set(names(['--cached']));
    listed = [...new Set([...tracked, ...names(['--others', '--exclude-standard'])])].sort();
  } catch {
    issue('errors', '.', 'repository_inventory_failed');
    return summary;
  }
  summary.listedFiles = listed.length;
  for (const file of listed) {
    // Git -z preserves unusual paths. Reject unsafe names before filesystem access.
    if (path.isAbsolute(file) || file.includes('\\') || file.split('/').some(part => !part || part === '.' || part === '..')) {
      issue('errors', file, 'invalid_source_path');
      continue;
    }
    if (privatePath(file)) {
      summary.skippedPrivateFiles++;
      if (tracked.has(file)) issue('findings', file, 'tracked_private_path');
      continue;
    }
    if (!textNames.has(path.posix.basename(file)) && !textExtensions.has(path.posix.extname(file).toLowerCase())) {
      summary.skippedNonSourceFiles++;
      continue;
    }
    try {
      const segments = file.split('/');
      let target = canonicalRoot;
      let stat;
      let redirected = false;
      for (const segment of segments) {
        target = path.join(target, segment);
        stat = fs.lstatSync(target);
        if (stat.isSymbolicLink()) { redirected = true; break; }
      }
      if (redirected || !samePath(fs.realpathSync(target), target)) {
        issue('errors', file, 'redirected_source_path');
        continue;
      }
      if (!stat.isFile()) { issue('errors', file, 'non_regular_source'); continue; }
      if (stat.size > MAX_SOURCE_BYTES) { issue('errors', file, 'source_size_limit'); continue; }
      const bytes = readFile(target);
      const body = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      if (body.includes('\0')) { issue('errors', file, 'non_text_source'); continue; }
      summary.scannedFiles++;
      for (const kind of inspectText(body)) issue('findings', file, kind);
    } catch {
      // Never print read/decode errors, which may include sensitive context.
      issue('errors', file, 'source_read_or_encoding_failed');
    }
  }
  return summary;
}

export function scanExitCode(summary) {
  return summary.errors.length ? 2 : summary.findings.length ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const summary = scanRepository();
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
  process.exitCode = scanExitCode(summary);
}
