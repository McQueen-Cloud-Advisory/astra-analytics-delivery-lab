import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildProvisionPlan, assertProvisionReadiness, provisionLab } from '../../scripts/provision-lab.mjs';

const config = JSON.parse(await readFile(new URL('../../infra/lab-config.json', import.meta.url), 'utf8'));
const now = Date.parse('2026-09-21T15:00:00Z');
const DAY = 86_400_000;
const ready = () => ({ approval: 'DEC-G5-001', projectId: 'astra-po-lab-20260921', location: 'us-east4',
  serviceAccountEmail: 'po-pipeline@astra-po-lab-20260921.iam.gserviceaccount.com', observedAt: new Date(now).toISOString(),
  billingEnabled: true, regionalPricingVerified: true, budgetVerified: true, queryQuotaVerified: true,
  runtimeIdentityVerified: true, headroomUsd: 30, monthlyAttributedUsd: 0, totalAttributedUsd: 0, estimatedUnreportedUsd: 0 });

// Metadata API fake deliberately offers no SQL, load, delete or IAM mutation methods.
function fakeCloud() {
  const datasets = new Map();
  const tables = new Map();
  const mutations = [];
  const missing = () => { throw Object.assign(new Error('not found'), { code: 404 }); };
  const client = { projectId: config.projectId,
    dataset(datasetId) {
      return {
        async getMetadata() { return [structuredClone(datasets.get(datasetId) || missing())]; },
        async getTables() { return [[...tables.keys()].filter(id => id.startsWith(datasetId + '.')).map(id => ({ id: id.split('.')[1] })), null]; },
        table(tableId) { return { async getMetadata() { return [structuredClone(tables.get(`${datasetId}.${tableId}`) || missing())]; } }; },
        async createTable(tableId, options) {
          mutations.push(`table:${datasetId}.${tableId}`);
          tables.set(`${datasetId}.${tableId}`, { ...structuredClone(options), location: 'us-east4', type: 'TABLE', creationTime: String(now) });
          return [];
        },
      };
    },
    async createDataset(datasetId, options) {
      mutations.push(`dataset:${datasetId}`);
      datasets.set(datasetId, { ...structuredClone(options), creationTime: String(now) });
      return [];
    },
  };
  return { client, datasets, tables, mutations };
}

async function apply(cloud, previous = null, extra = {}) {
  const saved = [];
  const result = await provisionLab({ config, readiness: ready(), client: cloud.client, previous, now,
    persist: async value => saved.push(structuredClone(value)), ...extra });
  return { result, saved };
}

test('plan has only two datasets/five tables, exact scoped data editor and fixed seven/fourteen-day expiry', () => {
  const plan = buildProvisionPlan(config, null, now);
  assert.equal(plan.manifest.firstResourceAt, '2026-09-21T15:00:00.000Z');
  assert.equal(plan.manifest.absoluteExpiresAt, '2026-10-05T15:00:00.000Z');
  assert.equal(plan.datasets.length, 2);
  assert.equal(plan.tables.length, 5);
  for (const dataset of plan.datasets) {
    assert.deepEqual(dataset.metadata.access, [
      { role: 'OWNER', specialGroup: 'projectOwners' },
      { role: 'WRITER', userByEmail: 'po-pipeline@astra-po-lab-20260921.iam.gserviceaccount.com' },
    ]);
    assert.equal(dataset.metadata.storageBillingModel, 'LOGICAL');
  }
  assert.equal(plan.manifest.resources.find(r => r.tableId === 'raw_lines').expiresAt, '2026-09-28T15:00:00.000Z');
  assert.equal(plan.manifest.resources.find(r => r.tableId === 'po_line_snapshot').expiresAt, '2026-10-05T15:00:00.000Z');
  assert.throws(() => buildProvisionPlan({ ...config, projectId: 'financial-analytics-demo' }, null, now), /Unapproved/);
  assert.throws(() => buildProvisionPlan({ ...config, maxLifetimeDays: 60 }, null, now), /Unapproved/);
});

test('readiness is fail-closed on missing/old/future evidence, unresolved controls and cost/headroom bounds', () => {
  assert.doesNotThrow(() => assertProvisionReadiness(config, ready(), now));
  for (const patch of [{ billingEnabled: false }, { runtimeIdentityVerified: false }, { headroomUsd: 14.99 },
    { monthlyAttributedUsd: 7, estimatedUnreportedUsd: 1 }, { totalAttributedUsd: 16 },
    { headroomUsd: '30' }, { estimatedUnreportedUsd: undefined },
    { observedAt: new Date(now - 2 * DAY - 1).toISOString() }, { observedAt: new Date(now + 1).toISOString() }]) {
    assert.throws(() => assertProvisionReadiness(config, { ...ready(), ...patch }, now));
  }
});

test('original manifest precedes mutations; repeat apply preserves deadlines and creates nothing', async () => {
  const cloud = fakeCloud();
  let original;
  const { result } = await apply(cloud, null, { persist: async manifest => {
    if (!original) { assert.equal(cloud.mutations.length, 0); original = structuredClone(manifest); }
  } });
  assert.equal(cloud.mutations.length, 7);
  assert(result.resources.every(r => r.status === 'verified'));
  cloud.mutations.length = 0;
  const { result: repeated } = await apply(cloud, result, { now: now + DAY,
    readiness: { ...ready(), observedAt: new Date(now + DAY).toISOString() } });
  assert.equal(cloud.mutations.length, 0);
  assert.equal(repeated.firstResourceAt, original.firstResourceAt);
  assert.equal(repeated.absoluteExpiresAt, original.absoluteExpiresAt);
  assert.equal(repeated.resources.find(r => r.tableId === 'raw_lines').expiresAt, '2026-09-28T15:00:00.000Z');
});

test('preflight detects region, IAM, schema or expiry drift before creating a missing resource', async () => {
  for (const change of [
    cloud => { cloud.datasets.get('po_work').location = 'US'; },
    cloud => { cloud.datasets.get('po_work').access.push({ role: 'READER', specialGroup: 'allAuthenticatedUsers' }); },
    cloud => { cloud.tables.get('po_serving.po_line_snapshot').schema.fields[0].mode = 'NULLABLE'; },
    cloud => { cloud.tables.get('po_serving.po_line_snapshot').expirationTime = String(now + 60 * DAY); },
  ]) {
    const cloud = fakeCloud();
    const { result } = await apply(cloud);
    cloud.tables.delete('po_serving.batch_manifest');
    result.resources.find(r => r.tableId === 'batch_manifest').status = 'planned';
    cloud.mutations.length = 0;
    change(cloud);
    await assert.rejects(() => apply(cloud, result), /drift/);
    assert.equal(cloud.mutations.length, 0);
  }
});

test('uncertain create is reconciled by metadata on resume without resetting or duplicate create', async () => {
  const cloud = fakeCloud();
  const create = cloud.client.createDataset;
  cloud.client.createDataset = async (...args) => { await create(...args); throw Object.assign(new Error('sensitive API detail'), { code: 503 }); };
  let retained;
  await assert.rejects(() => apply(cloud, null, { persist: async manifest => { retained = manifest; } }), error =>
    /requires metadata reconciliation/.test(error.message) && !error.message.includes('sensitive API detail'));
  assert.equal(cloud.mutations.length, 1);
  assert.equal(retained.resources[0].status, 'planned');
  cloud.client.createDataset = create;
  const { result } = await apply(cloud, retained);
  assert.equal(cloud.mutations.filter(m => m === 'dataset:po_work').length, 1);
  assert.equal(result.firstResourceAt, retained.firstResourceAt);
  assert(result.resources.every(r => r.status === 'verified'));
});

test('lost manifest, removed verified resource, unexpected table and altered deadlines require reconciliation', async () => {
  const cloud = fakeCloud();
  const { result } = await apply(cloud);
  cloud.mutations.length = 0;
  await assert.rejects(() => apply(cloud), /without an original lifetime manifest/);
  cloud.tables.set('po_work.unapproved', {});
  await assert.rejects(() => apply(cloud, result), /Unexpected tables/);
  cloud.tables.delete('po_work.unapproved');
  cloud.tables.delete('po_work.raw_lines');
  await assert.rejects(() => apply(cloud, result), /disappeared/);
  assert.throws(() => buildProvisionPlan(config, { ...result, absoluteExpiresAt: '2026-12-01T00:00:00Z' }, now), /manifest drift/);
  assert.equal(cloud.mutations.length, 0);
});

test('expired raw tables stop at seven days; repeat runs cannot reset resource or experiment lifetime', () => {
  const { manifest } = buildProvisionPlan(config, null, now);
  assert.throws(() => buildProvisionPlan(config, manifest, now + 7 * DAY), /table lifetime has expired/);
  assert.throws(() => buildProvisionPlan(config, manifest, now + 14 * DAY), /lifetime is invalid or expired/);
  const duplicate = structuredClone(manifest);
  duplicate.resources[1] = duplicate.resources[0];
  assert.throws(() => buildProvisionPlan(config, duplicate, now), /unexpected resource set/);
});

test('permission failures do not become missing resources or trigger create', async () => {
  const cloud = fakeCloud();
  cloud.client.dataset = () => ({ getMetadata: async () => { throw Object.assign(new Error('secret'), { code: 403 }); } });
  await assert.rejects(() => apply(cloud), error => /Metadata inspection failed.*403/.test(error.message) && !error.message.includes('secret'));
  assert.equal(cloud.mutations.length, 0);
});

test('replaced resource cannot be silently adopted under a verified manifest', async () => {
  const cloud = fakeCloud();
  const { result } = await apply(cloud);
  cloud.tables.get('po_serving.po_line_snapshot').creationTime = String(now + 1000);
  cloud.mutations.length = 0;
  await assert.rejects(() => apply(cloud, result), /resource was replaced/);
  assert.equal(cloud.mutations.length, 0);
});
