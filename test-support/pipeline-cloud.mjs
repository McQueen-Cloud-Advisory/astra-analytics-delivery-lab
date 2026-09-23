import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { readSourcePackage } from '../src/data/source-package.mjs';
import { TARGET, REQUIRED_TABLES } from '../src/pipeline/schemas.mjs';
import { batchIdentity, hash, publicationParams, publicationSql } from '../src/pipeline/core.mjs';
import { originalLoadIds, retainedRawSql } from '../src/pipeline/retained-cloud-history.mjs';

export const fixture = new URL('../fixtures/po/FIX-01/', import.meta.url);
export const fixture2 = new URL('../fixtures/po/FIX-02/', import.meta.url);
export const source = await readSourcePackage(fileURLToPath(fixture));
export const source2 = await readSourcePackage(fileURLToPath(fixture2));
export const oracle = JSON.parse(await readFile(new URL('expected.json', fixture), 'utf8'));
export const oracle2 = JSON.parse(await readFile(new URL('expected.json', fixture2), 'utf8'));
export const transformSql = await readFile(new URL('../sql/fix01-transform.sql', import.meta.url), 'utf8');
export const readSql = await readFile(new URL('../sql/read-published-batch.sql', import.meta.url), 'utf8');
export const batchId = batchIdentity(source), transformHash = hash(transformSql);
export const candidate = (input = source, expected = oracle) => ({
  lines: input.lines.map(line => ({ ...line, ...expected.line_states.find(e => e.line_id === line.line_id), source_business_date: expected.business_date })),
  events: input.events.map(e => ({ ...e, ...expected.event_states.find(s => s.event_id === e.event_id && s.revision === e.revision) })), manifests: [],
});
export const published = (input = source, expected = oracle, at = '2026-09-22T03:00:00Z') => {
  const p = publicationParams(candidate(input, expected), input, batchIdentity(input), transformHash);
  return Object.fromEntries([['lines', p.lines_json], ['events', p.events_json], ['manifests', p.manifest_json]]
    .map(([key, json]) => [key, JSON.parse(json).map(row => ({ ...row, published_at: at }))]));
};

// Test-only SDK seam. This never imports credentials or contacts a platform.
export function mockCloud({ invalidCandidate = false, alreadyPublished = false, wrongRegion = false, missingScriptBytes = false, correction = false } = {}) {
  const input = correction ? source2 : source, expected = correction ? oracle2 : oracle, inputBatch = batchIdentity(input);
  const first = Date.now() - 10000, at = offset => new Date(first + offset).toISOString();
  const manifest = { version: '1.0', approval: 'DEC-G5-001', projectId: TARGET.projectId, location: TARGET.location, serviceAccountEmail: TARGET.serviceAccount,
    firstResourceAt: at(0), absoluteExpiresAt: at(14 * 86400000), resources: REQUIRED_TABLES.map(t => ({ kind: 'table', ...t, status: 'verified', expiresAt: at((t.datasetId === TARGET.workDataset ? 7 : 14) * 86400000) })) };
  const jobs = new Map(), calls = [], batches = new Map(), queryConfigs = [], metadataReads = [], rawRows = [];
  if (correction) batches.set(batchId, published(source, oracle, at(3000)));
  if (alreadyPublished) batches.set(inputBatch, published(input, expected, at(4000)));
  const rows = result => Object.entries(result).flatMap(([key, values]) => values.map(row => ({ row_kind: { lines: 'LINE', events: 'EVENT', manifests: 'MANIFEST' }[key], row_json: JSON.stringify(row) })));
  const makeJob = (id, configuration, data = [], loadRows) => {
    const metadata = { jobReference: { projectId: TARGET.projectId, location: TARGET.location, jobId: id }, configuration, status: { state: 'DONE' },
      statistics: loadRows !== undefined ? { load: { outputRows: String(loadRows) }, creationTime: String(first + 1500), startTime: String(first + 2000), endTime: String(first + 2500) } : { query: { totalBytesBilled: '10485760' } } };
    const job = { metadata, getMetadata: async () => { metadataReads.push(id); return [metadata]; }, getQueryResults: async () => [data] }; jobs.set(id, job); return job;
  };
  if (correction) for (const [tableId, physical, kind] of [['raw_lines', source.physicalLines, 'RAW_LINE'], ['raw_event_versions', source.physicalEvents, 'RAW_EVENT']]) {
    makeJob(originalLoadIds(batchId)[tableId], { load: { destinationTable: { projectId: TARGET.projectId, datasetId: TARGET.workDataset, tableId },
      createDisposition: 'CREATE_NEVER', writeDisposition: 'WRITE_APPEND', sourceFormat: 'NEWLINE_DELIMITED_JSON' } }, [], physical.length);
    rawRows.push(...physical.map(row => ({ row_kind: kind, row_json: JSON.stringify({ ...row.record, batch_id: batchId, source_package_hash: source.sourcePackageHash,
      record_locator: row.recordLocator, payload_hash: row.payloadHash, ingested_at: at(1000) }) })));
  }
  const client = { projectId: TARGET.projectId,
    job: id => jobs.get(id) ?? { getMetadata: async () => { throw Object.assign(new Error('absent'), { code: 404 }); } },
    dataset: datasetId => ({ getMetadata: async () => [{ datasetReference: { projectId: TARGET.projectId, datasetId }, location: wrongRegion ? 'US' : TARGET.location }],
      table: tableId => ({ getMetadata: async () => [{ type: 'TABLE', tableReference: { projectId: TARGET.projectId, datasetId, tableId },
        schema: REQUIRED_TABLES.find(t => t.tableId === tableId).schema, numBytes: '1000', expirationTime: String(Date.parse(manifest.resources.find(t => t.tableId === tableId).expiresAt)) }],
      createLoadJob: async (path, config) => { calls.push(`load:${tableId}`); const count = (await readFile(path, 'utf8')).trimEnd().split('\n').length;
        return [makeJob(config.jobId, { load: { ...config, destinationTable: { projectId: TARGET.projectId, datasetId, tableId } } }, [], count)]; } }) }),
    createQueryJob: async config => {
      queryConfigs.push(config);
      if (config.dryRun) { calls.push('dry'); return [{ metadata: { configuration: { dryRun: true }, statistics: { totalBytesProcessed: '1000' } } }]; }
      calls.push(config.labels.stage);
      let data;
      if (config.query === readSql) data = rows(batches.get(config.params.batch_id) ?? { lines: [], events: [], manifests: [] });
      else if (config.query === retainedRawSql) data = structuredClone(rawRows);
      else if (config.query === transformSql) { const c = candidate(input, expected); if (invalidCandidate) c.lines[0].remaining_qty++; data = rows(c); }
      else if (config.query === publicationSql) { batches.set(inputBatch, published(input, expected, at(4000))); data = []; }
      else assert.fail('unexpected SQL');
      const job = makeJob(config.jobId, { query: config }, data);
      if (missingScriptBytes && config.query === publicationSql) delete job.metadata.statistics.query.totalBytesBilled;
      return [job];
    },
  };
  return { client, manifest, calls, batches, input, expected, rawRows, jobs, queryConfigs, metadataReads };
}
