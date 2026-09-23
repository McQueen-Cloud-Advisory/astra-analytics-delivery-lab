import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertLabTarget, createRuntimeAuthClient, LAB_PROJECT, LAB_LOCATION,
  RUNTIME_IDENTITY, tokenArguments } from '../../src/cloud/auth.mjs';

test('rejects unrelated or deprecated targets and broad runtime identity', () => {
  const valid = { projectId: LAB_PROJECT, location: LAB_LOCATION, serviceAccountEmail: RUNTIME_IDENTITY };
  assert.doesNotThrow(() => assertLabTarget(valid));
  for (const projectId of ['financial-analytics-demo', 'unrelated-project', '', undefined]) {
    assert.throws(() => assertLabTarget({ ...valid, projectId }), /Unapproved/);
  }
  assert.throws(() => assertLabTarget({ ...valid, location: 'US' }), /Unapproved/);
  assert.throws(() => assertLabTarget({ ...valid, serviceAccountEmail: 'owner@example.invalid' }), /Unapproved/);
});

test('runtime requests carry explicit quota project and use only impersonated tokens', async () => {
  let calls = 0;
  const client = createRuntimeAuthClient({ tokenProvider: async () => { calls++; return 'fake-test-token'; } });
  const headers = await client.getRequestHeaders('https://bigquery.googleapis.com/');
  assert.equal(headers.get('x-goog-user-project'), LAB_PROJECT);
  assert.equal(headers.get('authorization'), 'Bearer fake-test-token');
  assert.equal(calls, 1);
  assert.ok(tokenArguments.includes(`--impersonate-service-account=${RUNTIME_IDENTITY}`));
  assert.ok(tokenArguments.includes(`--billing-project=${LAB_PROJECT}`));
});

test('authentication failures are sanitized and do not try alternate credentials', async () => {
  let calls = 0;
  const client = createRuntimeAuthClient({ tokenProvider: async () => { calls++; throw new Error('sensitive-token-test-marker'); } });
  await assert.rejects(() => client.getAccessToken(), error =>
    /no user-credential fallback/.test(error.message) && !error.message.includes('sensitive-token-test-marker'));
  assert.equal(calls, 1);
});
