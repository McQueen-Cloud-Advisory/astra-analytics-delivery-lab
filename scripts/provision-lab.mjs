// Metadata-only provisioning. No query, load, deletion, key or project IAM path.
// API fields: https://docs.cloud.google.com/bigquery/docs/reference/rest/v2/datasets
// and https://docs.cloud.google.com/bigquery/docs/reference/rest/v2/tables
import { readFile, writeFile, mkdir, rename, open, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { REQUIRED_TABLES, TARGET } from '../src/pipeline/schemas.mjs';

const DAY = 86_400_000;
const APPROVAL = 'DEC-G5-001';
const root = fileURLToPath(new URL('../', import.meta.url));
const fail = message => { throw new Error(message); };
const iso = millis => new Date(millis).toISOString();
const millis = value => {
  const result = Date.parse(value);
  if (!Number.isFinite(result)) fail('Invalid lifetime/evidence timestamp.');
  return result;
};
const identity = r => `${r.kind}:${r.datasetId}${r.tableId ? '.' + r.tableId : ''}`;

export function assertProvisionConfig(config) {
  const exact = { approval: APPROVAL, projectId: TARGET.projectId, projectNumber: '329955978985',
    location: TARGET.location, workDataset: TARGET.workDataset, servingDataset: TARGET.servingDataset,
    serviceAccountEmail: TARGET.serviceAccount, maxLifetimeDays: 14, rawRetentionDays: 7,
    monthlyCeilingUsd: 10, experimentCeilingUsd: 20, monthlyStopUsd: 8, experimentStopUsd: 16 };
  for (const [key, value] of Object.entries(exact)) {
    if (config[key] !== value) fail(`Unapproved provisioning configuration: ${key}.`);
  }
  const expected = ['po_work.raw_lines', 'po_work.raw_event_versions', 'po_serving.po_line_snapshot',
    'po_serving.event_evidence', 'po_serving.batch_manifest'];
  assert.deepEqual(REQUIRED_TABLES.map(t => `${t.datasetId}.${t.tableId}`), expected, 'Unapproved table set.');
}

export function assertProvisionReadiness(config, evidence, now = Date.now()) {
  assertProvisionConfig(config);
  if (!evidence || evidence.approval !== APPROVAL || evidence.projectId !== config.projectId ||
      evidence.location !== config.location || evidence.serviceAccountEmail !== config.serviceAccountEmail) {
    fail('Missing or mismatched provision-readiness evidence.');
  }
  const age = now - millis(evidence.observedAt);
  if (age < 0 || age > 2 * DAY) fail('Provision readiness/cost evidence must be current and no older than 48 hours.');
  for (const flag of ['billingEnabled', 'regionalPricingVerified', 'budgetVerified',
    'queryQuotaVerified', 'runtimeIdentityVerified']) {
    if (evidence[flag] !== true) fail(`Provision readiness remains open: ${flag}.`);
  }
  for (const field of ['headroomUsd', 'monthlyAttributedUsd', 'totalAttributedUsd', 'estimatedUnreportedUsd']) {
    if (!Number.isFinite(evidence[field]) || evidence[field] < 0) fail(`Missing numeric cost evidence: ${field}.`);
  }
  if (evidence.headroomUsd < 15 || evidence.monthlyAttributedUsd + evidence.estimatedUnreportedUsd >= 8 ||
      evidence.totalAttributedUsd + evidence.estimatedUnreportedUsd >= 16) fail('Cost/headroom stop threshold reached.');
}

export function buildProvisionPlan(config, previous = null, now = Date.now()) {
  assertProvisionConfig(config);
  const first = previous ? millis(previous.firstResourceAt) : now;
  const expiry = first + config.maxLifetimeDays * DAY;
  if (first > now || now >= expiry) fail('Resource lifetime is invalid or expired; no reset is permitted.');
  const resources = [config.workDataset, config.servingDataset].map(datasetId => ({
    kind: 'dataset', datasetId, cleanupDueAt: iso(expiry), status: 'planned',
  })).concat(REQUIRED_TABLES.map(t => ({ kind: 'table', datasetId: t.datasetId, tableId: t.tableId,
    expiresAt: iso(t.datasetId === config.workDataset ? Math.min(first + config.rawRetentionDays * DAY, expiry) : expiry),
    status: 'planned',
  })));
  const manifest = { version: '1.0', approval: APPROVAL, projectId: config.projectId,
    projectNumber: config.projectNumber, location: config.location, serviceAccountEmail: config.serviceAccountEmail,
    owner: 'Human Manager', purpose: 'OPP-02 bounded synthetic first-slice proof',
    firstResourceAt: iso(first), absoluteExpiresAt: iso(expiry), resources };
  if (previous) {
    for (const key of ['version', 'approval', 'projectId', 'projectNumber', 'location', 'serviceAccountEmail',
      'firstResourceAt', 'absoluteExpiresAt']) {
      if (previous[key] !== manifest[key]) fail(`Resource manifest drift: ${key}.`);
    }
    if (!Array.isArray(previous.resources) || previous.resources.length !== resources.length ||
        new Set(previous.resources.map(identity)).size !== resources.length) fail('Resource manifest has an unexpected resource set.');
    for (const r of resources) {
      const old = previous.resources.find(candidate => identity(candidate) === identity(r));
      if (!old || old.expiresAt !== r.expiresAt || old.cleanupDueAt !== r.cleanupDueAt ||
          !['planned', 'verified'].includes(old.status)) fail('Resource manifest identity/expiry drift.');
      Object.assign(r, old);
    }
  }
  // A raw-table expiry is intentionally stricter than the experiment backstop.
  if (resources.some(r => r.expiresAt && millis(r.expiresAt) <= now)) fail('A table lifetime has expired; no automatic recreation.');
  const datasets = [config.workDataset, config.servingDataset].map(datasetId => ({ datasetId,
    metadata: { datasetReference: { projectId: config.projectId, datasetId }, location: config.location,
      storageBillingModel: 'LOGICAL',
      defaultTableExpirationMs: String((datasetId === config.workDataset ? config.rawRetentionDays : config.maxLifetimeDays) * DAY),
      access: [{ role: 'OWNER', specialGroup: 'projectOwners' },
        { role: 'WRITER', userByEmail: config.serviceAccountEmail }],
      labels: { initiative: 'opp02', environment: 'lab' },
      description: 'OPP-02 synthetic lab; original absolute cleanup deadline is recorded in the resource manifest.' },
  }));
  const tables = REQUIRED_TABLES.map(t => ({ datasetId: t.datasetId, tableId: t.tableId,
    metadata: { tableReference: { projectId: config.projectId, datasetId: t.datasetId, tableId: t.tableId },
      schema: structuredClone(t.schema),
      expirationTime: String(millis(resources.find(r => r.kind === 'table' && r.datasetId === t.datasetId && r.tableId === t.tableId).expiresAt)),
      labels: { initiative: 'opp02', environment: 'lab' } },
  }));
  return { manifest, datasets, tables };
}

const canonicalAccess = entries => entries.map(entry => {
  const role = { 'roles/bigquery.dataOwner': 'OWNER', 'roles/bigquery.dataEditor': 'WRITER' }[entry.role] || entry.role;
  return JSON.stringify(Object.fromEntries(Object.entries({ ...entry, role }).sort(([a], [b]) => a.localeCompare(b))));
}).sort();
const schemaFields = fields => fields.map(field => ({ name: field.name,
  type: ({ INT64: 'INTEGER', BOOL: 'BOOLEAN' }[field.type] || field.type), mode: field.mode || 'NULLABLE',
  ...(field.fields ? { fields: schemaFields(field.fields) } : {}) }));

export function assertDatasetMatches(actual, planned) {
  const desired = planned.metadata;
  if (actual.datasetReference?.projectId !== desired.datasetReference.projectId ||
      actual.datasetReference?.datasetId !== planned.datasetId || actual.location !== desired.location ||
      actual.storageBillingModel !== 'LOGICAL' || String(actual.defaultTableExpirationMs) !== desired.defaultTableExpirationMs ||
      actual.defaultPartitionExpirationMs || actual.externalDatasetReference || actual.linkedDatasetSource) {
    fail(`Dataset region/billing/retention/reference drift: ${planned.datasetId}.`);
  }
  assert.deepEqual(canonicalAccess(actual.access || []), canonicalAccess(desired.access), `Dataset access drift: ${planned.datasetId}.`);
}

export function assertTableMatches(actual, planned, location) {
  const desired = planned.metadata;
  if (actual.tableReference?.projectId !== desired.tableReference.projectId ||
      actual.tableReference?.datasetId !== planned.datasetId || actual.tableReference?.tableId !== planned.tableId ||
      actual.location !== location || actual.type !== 'TABLE' || String(actual.expirationTime) !== desired.expirationTime ||
      actual.timePartitioning || actual.rangePartitioning || actual.externalDataConfiguration || actual.view || actual.materializedView) {
    fail(`Table type/location/expiry/reference drift: ${planned.datasetId}.${planned.tableId}.`);
  }
  assert.deepEqual(schemaFields(actual.schema?.fields || []), schemaFields(desired.schema.fields),
    `Table schema drift: ${planned.datasetId}.${planned.tableId}.`);
}

async function metadataOrMissing(resource) {
  try { return (await resource.getMetadata())[0]; }
  catch (error) {
    if (Number(error.code) === 404) return null;
    // Do not expose raw API errors/headers to logs or evidence.
    fail(`Metadata inspection failed (code ${Number(error.code) || 'unknown'}); no automatic retry.`);
  }
}

export async function provisionLab({ config, readiness, previous = null, client, now = Date.now(), persist }) {
  assertProvisionReadiness(config, readiness, now);
  if (client.projectId !== config.projectId) fail('Setup client project mismatch.');
  const plan = buildProvisionPlan(config, previous, now);
  const observed = new Map();
  // Inspect every existing object before the first mutation. Never repair drift by overwriting.
  for (const dataset of plan.datasets) {
    const handle = client.dataset(dataset.datasetId, { projectId: config.projectId, location: config.location });
    const actual = await metadataOrMissing(handle);
    observed.set(`dataset:${dataset.datasetId}`, actual);
    if (!actual) continue;
    if (!previous) fail('Existing lab resource without an original lifetime manifest; manual reconciliation required.');
    assertDatasetMatches(actual, dataset);
    const [tables, next] = await handle.getTables({ autoPaginate: false, maxResults: 100 });
    if (next || tables.some(t => !plan.tables.some(p => p.datasetId === dataset.datasetId && p.tableId === t.id))) {
      fail(`Unexpected tables or incomplete inventory in ${dataset.datasetId}.`);
    }
  }
  for (const table of plan.tables) {
    const actual = observed.get(`dataset:${table.datasetId}`) ? await metadataOrMissing(client.dataset(table.datasetId).table(table.tableId)) : null;
    observed.set(`table:${table.datasetId}.${table.tableId}`, actual);
    if (actual) assertTableMatches(actual, table, config.location);
  }
  for (const resource of plan.manifest.resources) {
    const actual = observed.get(identity(resource));
    if (!actual && resource.status === 'verified') fail('A previously verified resource disappeared; no automatic recreation.');
    if (actual && resource.status === 'verified' && String(actual.creationTime) !== String(resource.creationTime)) {
      fail('A previously verified resource was replaced; manual reconciliation required.');
    }
  }
  // Record intent before a remote create, including uncertain/partial failures.
  await persist(structuredClone(plan.manifest));
  for (const resource of plan.manifest.resources) {
    let actual = observed.get(identity(resource));
    const planned = resource.kind === 'dataset' ? plan.datasets.find(d => d.datasetId === resource.datasetId) :
      plan.tables.find(t => t.datasetId === resource.datasetId && t.tableId === resource.tableId);
    if (!actual) {
      try {
        if (resource.kind === 'dataset') await client.createDataset(resource.datasetId, planned.metadata);
        else await client.dataset(resource.datasetId).createTable(resource.tableId, planned.metadata);
      } catch (error) {
        fail(`Create outcome requires metadata reconciliation: ${identity(resource)} (code ${Number(error.code) || 'unknown'}). No retry or replacement attempted.`);
      }
      actual = await metadataOrMissing(resource.kind === 'dataset' ? client.dataset(resource.datasetId) : client.dataset(resource.datasetId).table(resource.tableId));
      if (!actual) fail('Create read-back missing; preserve manifest and inspect before retry.');
    }
    if (resource.kind === 'dataset') assertDatasetMatches(actual, planned);
    else assertTableMatches(actual, planned, config.location);
    resource.status = 'verified';
    resource.observedAt = iso(now);
    resource.creationTime = actual.creationTime;
    await persist(structuredClone(plan.manifest));
  }
  return plan.manifest;
}

async function readOptional(file) {
  try { return JSON.parse(await readFile(file, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

async function main(args) {
  if (args.length > 1 || (args.length && args[0] !== '--apply')) fail('Usage: node scripts/provision-lab.mjs [--apply]');
  const config = JSON.parse(await readFile(path.join(root, 'infra/lab-config.json'), 'utf8'));
  const local = path.join(root, '.lab');
  const manifestFile = path.join(local, 'resource-manifest.json');
  const previous = await readOptional(manifestFile);
  if (!args.length) {
    const plan = buildProvisionPlan(config, previous);
    console.log(JSON.stringify({ mode: 'PLAN_ONLY', authentication: 'not requested', approval: APPROVAL,
      projectId: config.projectId, location: config.location, runtimeDatasetRole: 'roles/bigquery.dataEditor',
      firstResourceAt: plan.manifest.firstResourceAt, absoluteExpiresAt: plan.manifest.absoluteExpiresAt,
      lifetimeNote: previous ? 'Original deadlines retained.' : 'Illustrative plan time; apply records the original intent before creation.',
      resources: plan.manifest.resources }, null, 2));
    return;
  }
  const readiness = await readOptional(path.join(local, 'provision-readiness.json'));
  assertProvisionReadiness(config, readiness);
  await mkdir(local, { recursive: true });
  const lockFile = path.join(local, 'provision.lock');
  const lock = await open(lockFile, 'wx');
  try {
    // Setup uses explicit user authority; runtime client is never a fallback.
    const { createSetupBigQueryClient } = await import('../src/cloud/auth.mjs');
    const client = await createSetupBigQueryClient();
    const current = await readOptional(manifestFile);
    const result = await provisionLab({ config, readiness, previous: current, client,
      persist: async manifest => {
        const temp = `${manifestFile}.${process.pid}.tmp`;
        await writeFile(temp, JSON.stringify(manifest, null, 2) + '\n', { flag: 'w' });
        await rename(temp, manifestFile);
      } });
    console.log(JSON.stringify({ status: 'METADATA_VERIFIED', manifest: '.lab/resource-manifest.json',
      resources: result.resources.length, absoluteExpiresAt: result.absoluteExpiresAt,
      queriesOrLoadsExecuted: false }));
  } finally { await lock.close(); await unlink(lockFile); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(error => {
    console.error(error.name === 'AssertionError' ? String(error.message).split('\n')[0] : error.message);
    process.exitCode = 1;
  });
}
