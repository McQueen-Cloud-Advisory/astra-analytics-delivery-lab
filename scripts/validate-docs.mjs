import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, extname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// Structural safeguards only. This cannot establish human authorization,
// business validity, cloud access, platform correctness, or successful CI.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const checks = [];
const text = (p) => readFileSync(resolve(root, p), 'utf8').replace(/\r\n/g, '\n');
const assert = (condition, message) => {
  if (!condition) errors.push(message);
};
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const path = resolve(dir, entry.name);
  return entry.isDirectory() ? walk(path) : extname(path) === '.md' ? [path] : [];
});
const docs = [resolve(root, 'README.md'), resolve(root, 'AGENTS.md'),
  ...walk(resolve(root, 'docs')), ...walk(resolve(root, 'prompts'))];

for (const path of docs) {
  const body = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  const name = relative(root, path);
  assert(!body.includes('\uFFFD'), `${name}: replacement character in text`);
  const lines = body.split('\n');
  let inFence = false;
  let tableColumns = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*```/.test(line)) { inFence = !inFence; tableColumns = null; continue; }
    if (inFence) continue;
    if (/^\|/.test(line)) {
      const count = (line.replace(/\\\|/g, '').match(/\|/g) || []).length;
      if (tableColumns === null) tableColumns = count;
      assert(count === tableColumns, `${name}:${i + 1}: inconsistent table columns`);
    } else tableColumns = null;
  }
  assert(!inFence, `${name}: unclosed code fence`);
  const prose = body.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]+`/g, '');
  for (const match of prose.matchAll(/\]\(([^)]+)\)/g)) {
    const destination = match[1].replace(/^<|>$/g, '');
    if (/^(https?:|mailto:|#)/.test(destination)) continue;
    const target = decodeURIComponent(destination.split('#')[0]);
    if (!target) continue;
    const full = resolve(dirname(path), target);
    assert(existsSync(full), `${name}: missing local link ${target}`);
  }
}
checks.push(`${docs.length} Markdown files: local links, table structure, encoding, code fences`);

const master = text('prompts/astra-analytics-delivery-master-prompt.md');
const gates = [...master.matchAll(/^# GATE (\d+)\b/gm)].map((m) => Number(m[1]));
assert(gates.join(',') === '1,2,3,4,5,6,7,8,9', 'Master must contain exactly Gates 1–9 in order');
const release = master.indexOf('# RELEASE EXECUTION');
assert(release > master.indexOf('# GATE 8') && release < master.indexOf('# GATE 9'),
  'Release execution must remain between Gates 8 and 9');
checks.push('Nine ordered gates and release step placement');

const portfolio = text('docs/portfolio/opportunity-portfolio.md');
const ids = [...portfolio.matchAll(/^#{2,3}\s+(OPP-\d{2})\b/gm)].map((m) => m[1]);
const expectedIds = Array.from({ length: 12 }, (_, i) => `OPP-${String(i + 1).padStart(2, '0')}`);
assert(ids.length === 12 && new Set(ids).size === 12 && expectedIds.every((id) => ids.includes(id)),
  'Portfolio must contain one detail heading for each OPP-01 through OPP-12');
checks.push('Twelve distinct portfolio detail records');
const comparisonTables = portfolio.split(/\n\s*\n/).filter((block) =>
  /^\| ID \/ initiative \| Bucket \|/m.test(block));
assert(comparisonTables.length === 1, 'Portfolio must have one ID/initiative and Bucket comparison table');
const candidateRows = (comparisonTables[0] || '').split('\n')
  .filter((line) => /^\| OPP-\d{2}\b/.test(line));
const bucketCounts = { Small: 0, Medium: 0, Large: 0, Debatable: 0 };
const rowIds = [];
for (const row of candidateRows) {
  const cells = row.split('|').map((cell) => cell.trim());
  rowIds.push(cells[1].match(/^OPP-\d{2}/)?.[0]);
  if (Object.hasOwn(bucketCounts, cells[2])) bucketCounts[cells[2]]++;
  else errors.push(`Unknown candidate bucket: ${cells[2]}`);
}
assert(rowIds.length === 12 && new Set(rowIds).size === 12 && ids.every((id) => rowIds.includes(id)),
  'Comparison table and detail records must identify the same twelve candidates');
assert(bucketCounts.Small === 3 && bucketCounts.Medium === 4 &&
  bucketCounts.Large === 3 && bucketCounts.Debatable === 2,
  'Candidate buckets must be disjoint with counts 3/4/3/2');
checks.push('Comparison/detail consistency and disjoint 3/4/3/2 portfolio buckets');

const gateOne = text('docs/gates/gate-1-portfolio-review.md');
const weightTables = gateOne.split(/\n\s*\n/).filter((block) =>
  /^\|.*Criterion.*\|.*Weight/im.test(block));
assert(weightTables.length === 1, 'Gate 1 must have one Criterion/Weight table');
if (weightTables.length === 1) {
  const weights = weightTables[0].split('\n').slice(2)
    .filter((line) => /^\|/.test(line) && !/\|\s*\*?\*?Total/i.test(line))
    .map((line) => Number(line.split('|')[2].replace(/[^0-9.]/g, '')));
  assert(weights.length === 8 && weights.every((v) => v > 0) &&
    Math.abs(weights.reduce((a, b) => a + b, 0) - 100) < 0.000001,
  'Eight positive framework weights must sum to 100%');
}
checks.push('Framework weight completeness and normalization');

// Confirm the current-state link points to an existing gate, without treating
// a status field as proof of the human decision or fixing the run at Gate 1.
const state = text('docs/project-state.md');
const currentGate = state.match(/^Current gate:\s*Gate (\d+)/m)?.[1];
assert(Boolean(currentGate), 'Project state must name its current gate');
if (currentGate) {
  const files = readdirSync(resolve(root, 'docs/gates'));
  assert(files.some((p) => p.startsWith(`gate-${currentGate}-`) &&
    statSync(resolve(root, 'docs/gates', p)).isFile()), 'Current gate record must exist');
}
checks.push('Current state has an existing gate record');

if (errors.length) {
  for (const error of errors) console.error(`FAIL: ${error}`);
  process.exitCode = 1;
} else {
  for (const check of checks) console.log(`PASS: ${check}`);
  console.log('Local structural validation passed. Human approvals and platform behavior require separate evidence.');
}
