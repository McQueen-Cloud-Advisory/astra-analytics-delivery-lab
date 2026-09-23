-- Bounded first proof; admission separately enforces SRC-v1.0 and literal FIX-01.
-- Every table target and location is explicit. This statement changes no tables.
WITH lines AS (
  SELECT DISTINCT line_id, po_id, line_number, supplier_id, buyer_id, sku_id,
    ordered_at, source_recorded_at, initial_promised_date, ordered_qty,
    unit_price_cents, currency, uom
  FROM `astra-po-lab-20260921.po_work.raw_lines`
  WHERE batch_id = @batch_id
    AND ordered_at <= TIMESTAMP(@business_as_of)
    AND source_recorded_at <= TIMESTAMP(@knowledge_cutoff)
), versions AS (
  SELECT DISTINCT event_id, revision, line_id, event_type, event_at,
    source_recorded_at, is_void, quantity, promised_date, reason_code
  FROM `astra-po-lab-20260921.po_work.raw_event_versions`
  WHERE batch_id = @batch_id AND source_recorded_at <= TIMESTAMP(@knowledge_cutoff)
), ranked AS (
  SELECT *, MAX(revision) OVER (PARTITION BY event_id) AS winning_revision
  FROM versions
), effective AS (
  SELECT * FROM ranked
  WHERE revision = winning_revision AND NOT is_void
    AND event_at <= TIMESTAMP(@business_as_of)
), amounts AS (
  SELECT line_id,
    SUM(IF(event_type = 'RECEIPT', quantity, 0)) AS received_qty,
    SUM(IF(event_type = 'CANCEL', quantity, 0)) AS cancelled_qty
  FROM effective GROUP BY line_id
), promises AS (
  SELECT line_id, promised_date
  FROM effective WHERE event_type = 'PROMISE'
  QUALIFY ROW_NUMBER() OVER (PARTITION BY line_id ORDER BY event_at DESC, event_id DESC) = 1
), base AS (
  SELECT l.*, COALESCE(p.promised_date, l.initial_promised_date) AS current_promised_date,
    COALESCE(a.received_qty, 0) AS received_qty, COALESCE(a.cancelled_qty, 0) AS cancelled_qty,
    DATE(TIMESTAMP(@business_as_of), 'America/New_York') AS source_business_date
  FROM lines l LEFT JOIN amounts a USING (line_id) LEFT JOIN promises p USING (line_id)
), state AS (
  SELECT *, ordered_qty - received_qty - cancelled_qty AS remaining_qty
  FROM base
), snapshot AS (
  SELECT *,
    remaining_qty * unit_price_cents AS remaining_value_cents,
    IF(remaining_qty > 0 AND current_promised_date < source_business_date,
       remaining_qty * unit_price_cents, 0) AS overdue_value_cents,
    remaining_qty > 0 AS is_open,
    remaining_qty > 0 AND current_promised_date < source_business_date AS is_overdue,
    IF(remaining_qty > 0, GREATEST(0, DATE_DIFF(source_business_date, current_promised_date, DAY)), NULL) AS days_overdue,
    GREATEST(0, DATE_DIFF(current_promised_date, initial_promised_date, DAY)) AS promise_slip_days,
    CASE WHEN remaining_qty > 0 THEN 'Open'
         WHEN received_qty = ordered_qty THEN 'Received'
         WHEN cancelled_qty = ordered_qty THEN 'Cancelled' ELSE 'Closed mixed' END AS closure_status
  FROM state
)
SELECT 'LINE' AS row_kind, TO_JSON_STRING(s) AS row_json FROM snapshot s
UNION ALL
SELECT 'EVENT' AS row_kind, TO_JSON_STRING(STRUCT(
  event_id, revision, line_id, event_type, event_at, source_recorded_at,
  is_void, quantity, promised_date, reason_code,
  revision = winning_revision AS is_winning_revision,
  revision = winning_revision AND NOT is_void AND event_at <= TIMESTAMP(@business_as_of) AS contributes_to_state,
  revision < winning_revision AS is_superseded,
  event_at > TIMESTAMP(@business_as_of) AS is_future_effective
)) AS row_json FROM ranked
