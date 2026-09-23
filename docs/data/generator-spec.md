# Synthetic PO generator specification

Specification: **GEN-01 v1.0 — proposed for Gate 5**, 2026-09-21. Owner: Astra; approval: Human Manager. Source and KPI versions: [SRC v1.0](source-contracts.md), [KPI v1.0](kpi-contracts.md). **No generator, data file, SQL or report has been implemented or executed.** The shortened experiment should default to the hand-auditable fixture and stop increasing volume once required evidence is demonstrated.

## Provenance and reproducibility

All company transactions, identifiers, relationships, prices and labels will be **synthetic**, not copied from a real supplier. The [public-source review](../portfolio/data-feasibility.md) found useful schema references but no complete suitable lifecycle in the two inspected samples. Public dataset ingestion is **N/A for this baseline**: no external transactional records or licensed sample code are required. Microsoft/UCI links remain research references, not imported data. If public data is later introduced, record publisher, terms review, version/retrieval date, checksum and transformations before use and reopen material source changes.

Golden inputs are the manually specified [FIX v1.0 tables](expected-fixtures.md); their independent expected answers must be stored and reviewed separately from generated records and transformation functions. A fixture materializer may emit those specified inputs, but it must not calculate the expected answers. Do not claim a second agent makes this independent human validation.

| Generator property | Proposed contract |
|---|---|
| Version / runtime | `GEN-01-v1.0`; Node.js 24, standard library sufficient; record exact actual runtime at execution |
| Seed | Integer **20260921** for generated coverage profiles; golden inputs are literal, so seed does not change them |
| Randomness | Xorshift32 with unsigned 32-bit state initialized to seed: XOR successive left13, unsigned-right17, left5 shifts; unsigned output divided by `2^32` gives a draw in [0,1). Zero seed prohibited. No wall-clock/random-device input |
| Dates and clocks | Golden order date Sep7; event history Sep18–21; business-asof Sep21 12:00Z; primary knowledge cutoff equal to asof, correction cutoff13:00Z. Coverage dates specified below. UTC event timestamps; America/New_York promise calendar |
| Ordering / output | UTF-8 without BOM, LF newline, one canonical JSON object per line with fixed field order; sort lines by line_id and event versions by event_id/revision. Duplicate/fault variants explicitly preserve their extra physical rows |
| Source files / manifests | `po_lines.jsonl`, `line_events.jsonl`, `manifest.json`; hashes/counts computed from actual bytes. Include source contract, generator/profile, seed, cutoff pair and provenance |
| Run metadata | Actual attempt/ingestion/publication/import timestamps are measured separately; they must not contaminate deterministic source hashes or impersonate source business dates |
| Output / retention | Generated files under an ignored task output directory approved during implementation; only small reviewed fixtures/manifests/evidence may be committed. Retention/workload must fit the current execution envelope; no resource lifetime is authorized here |

## Profiles and proposed use

| Profile | Size and purpose | Status / limits |
|---|---|---|
| **Golden / default** | FIX-01: 10 lines +10 event versions; FIX-02 adds2 revisions; isolated duplicates/faults/time/void cases as specified | Required small correctness and first integration proof. No synthetic scale claim. **Not Run** |
| **Coverage / illustrative representative** | 100 lines: the 10 golden cases plus90 generated lines; at most400 event-version rows | Optional only if additional end-to-end evidence is useful within the shortened run. Representative of declared cases, not Harborline statistics. No need to run it to manufacture scale. **Not Run** |
| **Stress / limit probe** | 1,000 lines using the same mechanism, at most4,000 event-version rows; local size/count boundary rejection variants | Defined for reproducibility, **not scheduled for this short experiment**. Any cloud execution requires an approved question and remaining envelope. A larger profile is not silently authorized by this document. **Not Run** |

All profiles stay under the envelope's tighter applicable row/byte limits; actual serialized bytes must be checked before upload. No runtime or cost benchmark exists. Materializing a deterministic dataset or validating its JSON does not demonstrate ingestion, processing, reporting or performance.

## Generated coverage distribution — fictional design, not observation

For generated line index `j = 11..N`, IDs are `L` plus a four-digit zero-padded index, one PO/SKU per line; supplier cycles S1/S2/S3 using `1 + ((j−1) mod 3)`, with buyer B2 for S2 and B1 otherwise. Draw in fixed order: (1) ordered quantity `2 + floor(19u)`; (2) unit price cents `100 + floor(4901u)`; (3) order-day offset `floor(3u)` from Sep14 at13:00Z; (4) promise-day offset `1 + floor(5u)` after the local order date. Line source-recorded time is ordered-at+5minutes. Do not consume extra draws for branch selection.

Select state by `j mod 10`: residues0–2 open/unreceived; 3–4 receive `floor(ordered/2)`; 5–6 receive all; 7 cancel all with BUYER_CANCEL; 8 receive `floor(ordered/2)` and cancel the remainder with CLOSE_SHORT; 9 receive `floor(ordered/2)` then postpone the original promise by3 calendar days. Receipts occur at order-date+1day14:00Z; cancellations/promises at +1day15:00Z; source records arrive5minutes later. This gives a reproducible mix, not empirical percentages or a demand/lead-time model. The golden cases supply corrections and late arrivals independently of that distribution.

Events use deterministic IDs `G-<line_id>-<type>-<sequence>`, revision1; later fault variants identify exact additional revisions. Preserve order→event chronology, line references and nonnegative quantities. No real seasonality, supplier reliability or growth calibration is claimed. Growth profiles replicate the declared case mix by increasing N; they cannot justify production capacity or business forecasts.

## Faults, oracle and acceptance

Implement FIX-03/04 variants explicitly, one fault at a time, with their required reason/result. An exact duplicate must remain visible as an extra raw occurrence while counting once in business state. The FIX-02 offsetting correction/late arrival must reconcile individual event IDs and line deltas even though several totals stay unchanged. Expected values are frozen in the fixture document, never regenerated from the transformation code. Manifest/hash self-consistency alone cannot detect a generator that omitted the same event from both data and manifest; the independently expected golden key set does.

Proposed reproduction interface for later implementation, **not runnable today**:

```text
node scripts/generate-po-fixture.mjs --profile golden --case FIX-01 --spec GEN-01-v1.0 --output <allowed-output-directory>
node scripts/generate-po-fixture.mjs --profile golden --case FIX-02 --spec GEN-01-v1.0 --output <allowed-output-directory>
node scripts/generate-po-fixture.mjs --profile coverage --rows 100 --seed 20260921 --spec GEN-01-v1.0 --output <allowed-output-directory>
```

The final implemented command and actual hashes become execution evidence; a filename here is not code or a working command. Tests must cover same-seed byte reproducibility, different-seed coverage variation, exact golden key/value agreement, invalid-input rejection, replay and recovery. Every business KPI needs its independently expected answer and the appropriate actual BigQuery/Desktop evidence. Synthetic success demonstrates specified logic under controlled cases only; real extraction, adoption, supplier patterns and the SCN-02 benefit remain unvalidated.
