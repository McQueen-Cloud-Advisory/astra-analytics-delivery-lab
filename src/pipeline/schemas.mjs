// Fixed-fixture slices. Dataset/table creation is a separate authorized setup step.
export const TARGET = Object.freeze({
  projectId: 'astra-po-lab-20260921',
  location: 'us-east4',
  workDataset: 'po_work',
  servingDataset: 'po_serving',
  serviceAccount: 'po-pipeline@astra-po-lab-20260921.iam.gserviceaccount.com',
});

const field = (name, type, nullable = false) => ({ name, type, mode: nullable ? 'NULLABLE' : 'REQUIRED' });
export const LINE_FIELDS = [
  ...['line_id', 'po_id'].map(n => field(n, 'STRING')), field('line_number', 'INTEGER'),
  ...['supplier_id', 'buyer_id', 'sku_id'].map(n => field(n, 'STRING')),
  field('ordered_at', 'TIMESTAMP'), field('source_recorded_at', 'TIMESTAMP'),
  field('initial_promised_date', 'DATE'), field('ordered_qty', 'INTEGER'),
  field('unit_price_cents', 'INTEGER'), field('currency', 'STRING'), field('uom', 'STRING'),
];
export const EVENT_FIELDS = [
  field('event_id', 'STRING'), field('revision', 'INTEGER'), field('line_id', 'STRING'),
  field('event_type', 'STRING'), field('event_at', 'TIMESTAMP'), field('source_recorded_at', 'TIMESTAMP'),
  field('is_void', 'BOOLEAN'), field('quantity', 'INTEGER', true),
  field('promised_date', 'DATE', true), field('reason_code', 'STRING', true),
];
const rawMetadata = [
  field('batch_id', 'STRING'), field('source_package_hash', 'STRING'), field('record_locator', 'STRING'),
  field('payload_hash', 'STRING'), field('ingested_at', 'TIMESTAMP'),
];
const context = [
  field('batch_id', 'STRING'), field('business_as_of', 'TIMESTAMP'), field('knowledge_cutoff', 'TIMESTAMP'),
  field('source_package_hash', 'STRING'), field('contract_version', 'STRING'),
  field('provenance_class', 'STRING'), field('published_at', 'TIMESTAMP'),
];
export const SNAPSHOT_FIELDS = [
  ...LINE_FIELDS, field('current_promised_date', 'DATE'),
  ...['received_qty', 'cancelled_qty', 'remaining_qty', 'remaining_value_cents', 'overdue_value_cents', 'promise_slip_days'].map(n => field(n, 'INTEGER')),
  field('is_open', 'BOOLEAN'), field('is_overdue', 'BOOLEAN'), field('days_overdue', 'INTEGER', true),
  field('closure_status', 'STRING'), field('source_business_date', 'DATE'), ...context,
];
export const EVIDENCE_FIELDS = [
  ...EVENT_FIELDS, field('is_winning_revision', 'BOOLEAN'), field('contributes_to_state', 'BOOLEAN'),
  field('is_superseded', 'BOOLEAN'), field('is_future_effective', 'BOOLEAN'), ...context,
];
export const MANIFEST_FIELDS = [
  ...context, field('status', 'STRING'), field('validation_result', 'STRING'), field('fixture_id', 'STRING'),
  ...['source_line_count', 'source_event_count', 'canonical_event_count', 'published_line_count'].map(n => field(n, 'INTEGER')),
  field('transform_sha256', 'STRING'),
];
export const REQUIRED_TABLES = Object.freeze([
  { datasetId: TARGET.workDataset, tableId: 'raw_lines', schema: { fields: [...LINE_FIELDS, ...rawMetadata] } },
  { datasetId: TARGET.workDataset, tableId: 'raw_event_versions', schema: { fields: [...EVENT_FIELDS, ...rawMetadata] } },
  { datasetId: TARGET.servingDataset, tableId: 'po_line_snapshot', schema: { fields: SNAPSHOT_FIELDS } },
  { datasetId: TARGET.servingDataset, tableId: 'event_evidence', schema: { fields: EVIDENCE_FIELDS } },
  { datasetId: TARGET.servingDataset, tableId: 'batch_manifest', schema: { fields: MANIFEST_FIELDS } },
]);
