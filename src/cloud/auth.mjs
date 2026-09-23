import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { OAuth2Client } from 'google-auth-library';
import { BigQuery } from '@google-cloud/bigquery';

const execute = promisify(execFile);
export const LAB_PROJECT = 'astra-po-lab-20260921';
export const LAB_LOCATION = 'us-east4';
export const RUNTIME_IDENTITY = `po-pipeline@${LAB_PROJECT}.iam.gserviceaccount.com`;

export function assertLabTarget(config) {
  if (config.projectId !== LAB_PROJECT || config.location !== LAB_LOCATION ||
      config.serviceAccountEmail !== RUNTIME_IDENTITY) {
    throw new Error('Unapproved cloud target or runtime identity; no fallback is permitted.');
  }
}

export const tokenArguments = Object.freeze([
  'auth', 'print-access-token', `--project=${LAB_PROJECT}`,
  `--billing-project=${LAB_PROJECT}`, `--impersonate-service-account=${RUNTIME_IDENTITY}`,
  '--lifetime=600s', '--quiet',
]);

function psLiteral(value) { return `'${value.replaceAll("'", "''")}'`; }

async function obtainRuntimeToken(setup = false) {
  const env = { ...process.env, CLOUDSDK_CORE_PROJECT: LAB_PROJECT,
    CLOUDSDK_BILLING_QUOTA_PROJECT: LAB_PROJECT, GOOGLE_CLOUD_PROJECT: LAB_PROJECT,
    GOOGLE_CLOUD_QUOTA_PROJECT: LAB_PROJECT };
  // Explicit CLI impersonation avoids reading or changing shared ADC files.
  // Capture both streams: never forward raw authentication errors or tokens.
  const options = { encoding: 'utf8', windowsHide: true, timeout: 60000, maxBuffer: 65536, env };
  const args = setup ? ['auth', 'print-access-token', `--project=${LAB_PROJECT}`,
    `--billing-project=${LAB_PROJECT}`, '--quiet'] : [...tokenArguments];
  if (process.platform === 'win32') {
    if (!process.env.LOCALAPPDATA) throw new Error('Local Google Cloud SDK path is unavailable.');
    const command = join(process.env.LOCALAPPDATA, 'Google', 'Cloud SDK', 'google-cloud-sdk', 'bin', 'gcloud.cmd');
    const script = `& ${[command, ...args].map(psLiteral).join(' ')}; exit $LASTEXITCODE`;
    return (await execute('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], options)).stdout;
  }
  return (await execute('gcloud', args, options)).stdout;
}

export function createRuntimeAuthClient({ tokenProvider = obtainRuntimeToken, now = Date.now } = {}) {
  const authClient = new OAuth2Client({ projectId: LAB_PROJECT, quotaProjectId: LAB_PROJECT,
    eagerRefreshThresholdMillis: 60000 });
  authClient.refreshHandler = async () => {
    try {
      const token = (await tokenProvider()).trim();
      if (!token || /\s/.test(token)) throw new Error('Invalid token response.');
      return { access_token: token, expiry_date: now() + 9 * 60 * 1000 };
    } catch {
      throw new Error('Lab service-account authentication failed. Check gcloud login and scoped impersonation; no user-credential fallback was used.');
    }
  };
  return authClient;
}

export async function createBigQueryClient() {
  const config = JSON.parse(await readFile(new URL('../../infra/lab-config.json', import.meta.url), 'utf8'));
  assertLabTarget(config);
  return new BigQuery({ projectId: LAB_PROJECT, location: LAB_LOCATION,
    authClient: createRuntimeAuthClient(), autoRetry: false, maxRetries: 0 });
}

// Separate entry point for the explicitly authorized resource provisioner only.
// Pipeline execution imports createBigQueryClient and cannot fall back to this identity.
export async function createSetupBigQueryClient() {
  const config = JSON.parse(await readFile(new URL('../../infra/lab-config.json', import.meta.url), 'utf8'));
  assertLabTarget(config);
  const authClient = createRuntimeAuthClient({ tokenProvider: () => obtainRuntimeToken(true) });
  return new BigQuery({ projectId: LAB_PROJECT, location: LAB_LOCATION,
    authClient, autoRetry: false, maxRetries: 0 });
}
