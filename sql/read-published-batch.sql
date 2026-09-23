SELECT 'LINE' AS row_kind, TO_JSON_STRING(s) AS row_json
FROM `astra-po-lab-20260921.po_serving.po_line_snapshot` s WHERE batch_id = @batch_id
UNION ALL
SELECT 'EVENT' AS row_kind, TO_JSON_STRING(e) AS row_json
FROM `astra-po-lab-20260921.po_serving.event_evidence` e WHERE batch_id = @batch_id
UNION ALL
SELECT 'MANIFEST' AS row_kind, TO_JSON_STRING(m) AS row_json
FROM `astra-po-lab-20260921.po_serving.batch_manifest` m WHERE batch_id = @batch_id
