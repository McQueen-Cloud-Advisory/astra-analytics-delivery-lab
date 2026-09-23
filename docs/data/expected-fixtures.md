# Independent expected PO results

Fixture baseline: **FIX v1.0 — proposed for Gate 5**, 2026-09-21. All execution statuses: **Not Run**. Inputs and answers below were hand-specified before generator, SQL or DAX implementation. A second agent checked the FIX-01/02 arithmetic separately; this is agent-assisted desk review, not platform testing or independent human validation. Source/KPI definitions: [SRC v1.0](source-contracts.md), [KPI v1.0](kpi-contracts.md).

## FIX-01 — primary hand-auditable source

Business as-of and knowledge cutoff are **2026-09-21T12:00:00Z**, local business date **2026-09-21** in `America/New_York`. All lines have order timestamp `2026-09-07T13:00:00Z`, source-recorded time `2026-09-07T13:05:00Z`, currency USD, UOM EA, line number 1, PO ID `PO-` plus line ID, and SKU ID `SKU-` plus line ID. Thus every line has a distinct PO/SKU. Supplier names may display their fictional IDs; no real entity is represented. Event amounts are positive units, revision 1 and nonvoid unless noted.

| Line / supplier / buyer | Ordered | Unit USD | Original promise | Current promise after events | Received | Cancelled | Expected remaining | Closure / overdue / days |
|---|---:|---:|---|---|---:|---:|---:|---|
| L01 / S1 / B1 | 10 | 10.00 | 2026-09-20 | 2026-09-20 | 4 | 0 | **6** | Open / Yes / 1 |
| L02 / S1 / B1 | 8 | 5.00 | 2026-09-21 | 2026-09-21 | 0 | 0 | **8** | Open / No / 0 |
| L03 / S2 / B2 | 12 | 2.00 | 2026-09-18 | 2026-09-18 | 12 | 0 | **0** | Received / No / blank |
| L04 / S2 / B2 | 10 | 4.00 | 2026-09-19 | 2026-09-19 | 3 | 7 | **0** | Closed mixed / No / blank |
| L05 / S1 / B1 | 5 | 3.00 | 2026-09-19 | 2026-09-19 | 0 | 5 | **0** | Cancelled / No / blank |
| L06 / S2 / B2 | 20 | 2.00 | 2026-09-18 | 2026-09-23 | 5 | 0 | **15** | Open / No / 0 |
| L07 / S3 / B1 | 6 | 7.00 | 2026-09-17 | 2026-09-19 | 2 | 0 | **4** | Open / Yes / 2 |
| L08 / S3 / B1 | 9 | 6.00 | 2026-09-20 | 2026-09-20 | 5 | 0 | **4** | Open / Yes / 1 |
| L09 / S3 / B1 | 4 | 8.00 | 2026-09-20 | 2026-09-20 | 0 | 0 | **4** | Open / Yes / 1 |
| L10 / S2 / B2 | 7 | 9.00 | 2026-09-22 | 2026-09-22 | 0 | 0 | **7** | Open / No / 0 |

`Received`, `Cancelled`, current promise and expected columns above are independent answers, **not extra source fields**. Store source price as the displayed USD × 100 integer cents. The ten source event revisions are:

| Event | Line / type / payload | `event_at` UTC | `source_recorded_at` UTC |
|---|---|---|---|
| E01 | L01 / RECEIPT / 4 | 2026-09-19T14:00:00Z | 2026-09-19T14:05:00Z |
| E02 | L03 / RECEIPT / 12 | 2026-09-18T15:00:00Z | 2026-09-18T15:05:00Z |
| E03 | L04 / RECEIPT / 3 | 2026-09-18T16:00:00Z | 2026-09-18T16:05:00Z |
| E04 | L04 / CANCEL / 7, CLOSE_SHORT | 2026-09-19T14:00:00Z | 2026-09-19T14:05:00Z |
| E05 | L05 / CANCEL / 5, BUYER_CANCEL | 2026-09-18T17:00:00Z | 2026-09-18T17:05:00Z |
| E06 | L06 / RECEIPT / 5 | 2026-09-18T18:00:00Z | 2026-09-18T18:05:00Z |
| E07 | L06 / PROMISE / 2026-09-23 | 2026-09-19T09:00:00Z | 2026-09-19T09:05:00Z |
| E08 | L07 / RECEIPT / 2 | 2026-09-18T12:00:00Z | 2026-09-18T12:05:00Z |
| E09 | L07 / PROMISE / 2026-09-19 | 2026-09-18T10:00:00Z | 2026-09-18T10:05:00Z |
| E10 | L08 / RECEIPT / 5 | 2026-09-19T11:00:00Z | 2026-09-19T11:05:00Z |

Expected source counts: **10 lines; 10 physical event records; 10 canonical event revisions; 10 winning events**. Empty event lists for L02/L09/L10 mean no receipts/cancellations, not missing line records. Exact key sets are L01–L10 and `(E01,1)`–`(E10,1)`; reconciliation must compare these, not only counts. Ordered total = **91**, received = **31**, cancelled = **12**, remaining = `91 − 31 − 12 = 48`.

| Scope | KPI-01 remaining | Open-line denominator | KPI-02 overdue lines | KPI-03 overdue units | KPI-04 overdue USD | KPI-05 share | KPI-06 max overdue days | KPI-07 postponed open lines |
|---|---:|---:|---:|---:|---:|---|---|---:|
| All ten lines | **48** | **7** | **4** | **18** | **144.00** | **4/7 = 57.142857…%**; display 57.1% | **2** | **2** |
| S1 / B1: L01,L02,L05 | 14 | 2 | 1 | 6 | 60.00 | 1/2 = 50.0% | 1 | 0 |
| S2 / B2: L03,L04,L06,L10 | 22 | 2 | 0 | 0 | 0.00 | 0/2 = 0.0% | blank | 1 |
| S3 / B1: L07,L08,L09 | 12 | 3 | 3 | 12 | 84.00 | 3/3 = 100.0% | 2 | 1 |

The overdue identity set is **{L01,L07,L08,L09}**. Quantity = `6 + 4 + 4 + 4 = 18`; value = `6×10 + 4×7 + 4×6 + 4×8 = $144`. L06's positive promise slip is 5 days; L07's is 2. L06 would be late against its original date but is not late against its current date, directly testing BR-01. L01's Sunday promise tests calendar-day treatment. B1's aggregate ratio is `4/5 = 80%`, not the average of S1's 50% and S3's 100%.

## FIX-02 — late correction plus late arrival

Keep business as-of at **12:00Z** and advance knowledge cutoff to **2026-09-21T13:00:00Z**. Append `(E10,2)` correcting L08's receipt to **3**, retaining original event time/type/line, recorded at **12:15Z**. Append `(E11,1)` for L09 RECEIPT **2**, effective **2026-09-19T12:00:00Z**, recorded at **2026-09-21T12:30:00Z**. This is a new batch, not an overwrite of FIX-01.

- L08 received decreases `5→3`, remaining increases `4→6`, overdue value `24→36`.
- L09 received increases `0→2`, remaining decreases `4→2`, overdue value `32→16`.
- Other lines and classifications do not change. All-source physical/canonical version rows = **12**; distinct events/winners = **11**. E10 revision 1 remains evidence marked superseded; revision 2 contributes once.
- Total received stays **31**, remaining **48**, overdue lines **4**, overdue quantity **18**, share **4/7**, maximum overdue days **2**, postponed lines **2**. Overdue value becomes `60 + 28 + 36 + 16 = $140`. S3 overdue value is **$80**.

These offsetting quantity changes deliberately defeat grand-total-only reconciliation. Require both event/version identities and per-line deltas. At the earlier knowledge cutoff neither appended revision may contribute, even if physically present in a replay package. Replaying both batches preserves their separate exact answers.

## FIX-03 — isolated invalid and recovery variants

Each variant starts independently from FIX-01. Failure means no new ready batch; the selected prior batch retains **48/4/18/$144** for remaining/overdue-lines/overdue-units/overdue-value. A failure record is not a published analytical batch.

Unless a row overrides them, added fault events use ID E99, revision1, `is_void=false`, effective **2026-09-19T15:00:00Z**, recorded **15:05:00Z**, and null unused payloads. For C/M, retain all E01 fields except the stated quantity change. For V, use E10 revision3 with quantity3, its original effective time and recorded time **2026-09-20T12:00:00Z**. For P, use E99/L06/PROMISE date **2026-09-24**, E07's effective time and recorded time **2026-09-19T09:06:00Z**. This fixes each fault inside the cutoff so it fails for the stated reason.

| Variant | Input change | Expected outcome / independent check |
|---|---|---|
| D — exact duplicate | Append an identical `(E01,1)` record | 11 physical records, 10 canonical revisions; all FIX-01 answers unchanged. Same-package rerun creates no extra business results |
| C — conflicting duplicate | Append `(E01,1)` with quantity 5 instead of 4 | Block with `CONFLICTING_REVISION`; do not pick last file row |
| Q — over-receipt | Append E99 RECEIPT 7 for L01 after E01 | `4+7=11 > ordered10`; block with `QUANTITY_EXCEEDS_ORDER`; never clamp remaining −1 to zero |
| U — unknown master | Append E99 RECEIPT 1 for L99 | Block `MISSING_LINE`; no silent exclusion |
| M — malformed type | E01 quantity is string `four` | Block `INVALID_TYPE`, retaining file/record location even if parsing cannot produce a business key |
| H — missing expected event | Omit E01 from the primary fixture | Expected event key set differs; raw fixture total would be received27/rem52, overdueqty22/value184. Independent reconciliation must fail even if a newly generated manifest agrees with the incomplete file |
| V — revision gap | Supply E10 revision 3 without revision 2 | Block `REVISION_GAP`; no neutral missing-history assumption |
| P — conflicting promises | Add another L06 promise with E07's exact effective time but different date | Block `CONFLICTING_PROMISE_TIME`; do not use ID order to invent business priority |
| N — numeric admission limit | Replace L02 unit_price_cents with 100,000,001, or ordered_qty with 1,000,001, in independent cases | Block `ARITHMETIC_LIMIT` before multiplication; do not rely on INT64 acceptance as proof Node arithmetic is safe |
| R — recovery/publication fault | Given FIX-01 ready, attempt FIX-02 and interrupt after candidate checks but before serving publication; resume that same FIX-02 source/cutoff pair | Prior ready batch keeps FIX-01 answers; successful recovery publishes exactly one complete FIX-02 batch with $140 overdue value, never partial line/event/manifest sets. Poll retained job IDs before resubmission |

For recovery, correct the rejected input or supply missing history, retain the failed attempt/reason, then rerun within the envelope. Deliberately changed input has a new package hash; a repeated identical accepted package is a no-op. Each invalid variant must fail for its stated reason, not an accidental stale checksum. Manifest corruption is a separate `HASH_OR_COUNT_MISMATCH` admission failure.

The accumulation guard also has an independent local boundary case: accumulated cents **9,007,199,254,740,000** plus **991** reaches the permitted maximum exactly; adding **992** must fail before addition. These are guard inputs, not invented PO rows or a large cloud workload. Negative, fractional, non-finite or unsafe JSON integers fail admission independently.

## FIX-04 — independent time and void variants

Each row independently modifies FIX-01, not FIX-02 or another row. Payload-null requirements apply to voids.

| Variant | Change | Expected result |
|---|---|---|
| Local midnight | Evaluate base source at **2026-09-21T03:59:59Z** (Sep20 locally), then **04:00:00Z** (Sep21 locally); source history unchanged | Before: only L07 overdue, 4 units/$28, 1/7 share, max1 day. At midnight: FIX-01 overdue set, 18 units/$144, 4/7, max2 days. Due-today stays on time |
| Receipt void | Append `(E01,2)` void at knowledge cutoff13:00Z | L01 received0/rem10; received total27/rem52; overdue4lines/22units/$184; other KPI values unchanged |
| Promise void | Append `(E07,2)` void at knowledge cutoff13:00Z | L06 reverts to original Sep18, now 3 days overdue. Overdue5lines/33units/$174; ratio5/7; max3days; postponed-open count1 |
| Event after business cutoff | Append E12 L01 RECEIPT1 effective12:30Z, recorded12:35Z, knowledge13:00Z | At business-asof12:00Z, FIX-01 answers unchanged and E12 marked future-effective. At business-asof13:00Z, L01rem5; totalrem47, overdueqty17/value134, still4/7 lines andmax2days |

All void revisions retain their original event timestamps/type/line and use recorded time **2026-09-21T12:15:00Z**. No promise/receipt reversal is inferred from deleting a row. A negative receipt, a correction changing event identity/time/type, or a timestamp before its order is an independent invalid-input rejection.

## FIX-05 — empty, freshness and host tasks

For a valid ready batch filtered to no lines: quantity/count/value metrics return **0/0/$0.00**, overdue share and maximum age return blank, with `No open lines`. Filtering to closed L05 produces the same headline values and its visible Cancelled detail. A missing/non-ready batch or mixed-batch input instead hides business measures and shows **Invalid batch selection**; it must not impersonate a valid empty result.

For FIX-01 KPI-08: evaluation clock **2026-09-21T12:05Z** gives age5minutes/not stale; **2026-09-22T12:00Z** gives exactly24hours/not stale; **12:00:01Z** is stale. A clock before business-asof is invalid. Fixed test clocks must be labeled; an actual later-day Desktop check uses its real clock and can correctly show a stale historical synthetic snapshot.

After the approved build, the manager's three scripted tasks are: find overdue L07 (2 days, 4 units); explain L04's zero remaining from received3 + cancelled7 against ordered10; identify the deliberately stale FIX-01 view and its source timestamp. Record completion, help and incorrect answers separately. These test controlled comprehensibility, not representative-user adoption, actual time saved or supplier outcomes. The minimal integration proof precedes final report completion and does not waive Gates 6–7.
