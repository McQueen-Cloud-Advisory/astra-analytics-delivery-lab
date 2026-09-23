# PO decision and KPI contracts

Contract: **KPI v1.0 — proposed for Gate 5**, 2026-09-21. Owner: Human Manager for business meaning; Astra for implementation. No KPI has been approved at Gate 5, implemented or tested. Inputs and rule IDs: [source contracts](source-contracts.md). Independent answers: [expected fixtures](expected-fixtures.md).

## Shared semantics

Use exactly one ready, immutable batch and the common `America/New_York` business date derived from `business_as_of`. Include valid canonical lines effective at that cutoff. Ordered lines, accepted receipts, explicit cancellations and the latest effective known promise determine state. Original promises remain visible; delayed promises do not silently overwrite source evidence. This follows proposed BR-01 through BR-04; approval of these material business choices is required.

All quantity totals use integer `EA` units. Lines can describe different SKUs; summed units measure follow-up workload/exposure, not comparable physical volume. Money is fixed USD: multiply remaining integer units by integer cents and divide by 100 only for display. Apply SRC's safe-integer input and aggregate bounds before arithmetic; over-limit candidates fail rather than lose precision. No currency conversion, tax/freight, realized saving, supplier liability or discounted-value calculation. Exact expected money tolerance is **$0.00**; calculations must avoid floating-point accumulation.

| KPI / supported decision | Definition at line grain and aggregation | Blank/zero/filter rules |
|---|---|---|
| **KPI-01 Remaining quantity** — what still needs receipt or cancellation | `ordered_qty − sum(winning nonvoid RECEIPT quantity) − sum(winning nonvoid CANCEL quantity)`; sum once per line | Never clamp negatives: invalid candidate blocks publication. Valid closed line returns 0; no selected lines returns 0 |
| **KPI-02 Overdue open lines** — which lines need follow-up | `remaining_qty > 0 AND current_promised_date < business_date`; count distinct `line_id` | Due-today is not overdue; fully received/cancelled lines excluded. Empty valid selection returns 0 |
| **KPI-03 Overdue remaining quantity** — how much is late | Sum KPI-01 over overdue lines only | Returns 0 if none; cannot add across batch snapshots or duplicate through event joins |
| **KPI-04 Overdue remaining purchase value** — prioritize exposed commitments | Sum `remaining_qty × unit_price_cents` over overdue lines, represented as exact cents; display USD | Returns $0.00 if none; not debt, loss, savings or total PO value |
| **KPI-05 Share of open lines overdue** — how widespread is lateness | Numerator KPI-02; denominator distinct lines where remaining > 0, under the same supplier/buyer/line filters | Zero denominator returns blank and label `No open lines`, not 0%. Recompute ratio at totals; never average percentages. Display 1 decimal %, expected raw ratio tolerance `1e-9` |
| **KPI-06 Days overdue** — oldest commitments first | For an open line, `max(0, business_date − current_promised_date)` in calendar days; summary = maximum over overdue lines | Closed lines return blank. Open on-time lines return 0. Summary is blank when no overdue line exists; never sum ages |
| **KPI-07 Open lines with postponed promise** — expose extensions | Count open lines with `current_promised_date > initial_promised_date`; per-line slip = positive calendar-day difference, else 0 | A subsequently restored earlier promise reduces current slip; event history remains. Closed lines excluded from count. This is not historical on-time-delivery performance |
| **KPI-08 Freshness and validity state** — can this batch support today's review | Show source business-as-of, knowledge cutoff, batch ID and observed import time. `stale = evaluation_now_utc − business_as_of > 24 hours`. `evaluation_now < business_as_of` is invalid clock context. A missing/non-ready/multi-batch selection is invalid, not fresh | At exactly 24 hours, not stale; above it, explicit `Stale synthetic snapshot` banner. Invalid context hides business totals as blank; do not show misleading zero. Source dates remain fixed even after a new import |

`Open lines` is KPI-05's explicit denominator, not a separate headline metric. Display derived closure labels: **Open** if remaining > 0; **Received** if received = ordered; **Cancelled** if cancelled = ordered; otherwise **Closed mixed** when remaining = 0. Closure classification is unaffected by elapsed time.

## Filter and date behavior

Supplier, buyer, PO, SKU and line filters apply to the snapshot at line grain. Detail shows the selected line's events for the same batch. An event-type or event-date drilldown selection must not redefine line-level totals by counting only displayed receipt rows. Summary quantities/value reconcile to the filtered unique lines. Single-direction line-to-event filtering is sufficient; exact model implementation is subject to host verification, not inferred from a relationship file.

The source business date controls overdue classification. Report import time and current wall clock do not reclassify a pinned historical batch; they expose freshness only. No misleading current-date slicer silently changes the calculation. A date comparison, if later requested, must select another validated batch explicitly; combining snapshots is prohibited. DST uses the named timezone; promises are local dates, with no separate 17:00 cutoff or business-day calendar. The fixture includes the UTC/local-date boundary and a Sunday promise.

For reproducible tests, supply a documented fixed `evaluation_now_utc`. For normal host use, use current UTC time or a clearly labeled fixed **test clock**; never portray a historical fixture as fresh by hiding a test-clock override. A late correction can preserve `business_as_of` while advancing `knowledge_cutoff`, producing a new batch and revised answers. The old batch remains reproducible.

## Approval and validation boundary

Gate 5 is asked to approve **current-promise follow-up with visible original slips; calendar-day/end-of-day semantics; fixed EA/USD arithmetic and explicit quantity closure; and whole-batch rejection with visible stale/invalid context**. These are the recommended fictional definitions, not buried requests for business discovery.

Every KPI uses independently calculated FIX-01/FIX-02 results; FIX-03 covers invalid/recovery behavior, FIX-04 date/void/as-of cases and FIX-05 empty/filter behavior. Exact quantities/counts/dates/classifications require zero mismatch; cents require exact equality; ratios use the tolerance above. Pipeline tests, BigQuery queries, DAX and human Desktop checks must be recorded separately. A generated fixture or matching agent-generated calculation is not independent human validation or evidence of eight hours saved per week.
