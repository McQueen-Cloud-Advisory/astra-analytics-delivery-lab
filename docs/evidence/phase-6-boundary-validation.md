# Phase 6 boundary and rejection validation

Record **EV-P6-BOUND-001**, v1.2. Run HDG-20260920-01 / OPP-02. Observed through **2026-09-23T23:08:51.128Z**. **All 17 case outcomes, duplicate-case replay and retained-batch checks Pass; the overall cloud attempt remains FAIL at the final cost-probe verifier. Metadata reconciliation is pending. Gate 6 remains In Progress.** Authority remains [Gate 5 / DEC-G5-001](../gates/gate-5-data-design.md), with unchanged [FIX v1.0](../data/expected-fixtures.md) and [SRC v1.0](../data/source-contracts.md) semantics. The original sixteen-case freeze at 22:52:31.096Z is retained below; a seventeenth earlier-knowledge replay was added before cloud execution.

## Frozen cases and independent expectations

The initial sixteen small literal packages are checked into [validation-cases](../../fixtures/po/validation-cases/); the pre-execution extension below adds the seventeenth. Each initial case starts independently from FIX-01, with only its approved source/cutoff changes. All manifests retain source profile `FIX-01`, contract `SRC-v1.0` and synthetic provenance; case IDs are separate catalog metadata. The seven initial positive cases and missing-event case H have static `expected.json` files, copied from the independently specified baseline with hand-entered changes before cloud execution. No SQL/transformation generated these answers. Existing FIX-01/FIX-02 source and oracle bytes remain unchanged.

| Positive case | Remaining | Overdue lines / units | Overdue cents | Maximum overdue days / postponed open lines |
|---|---:|---|---:|---|
| FIX-03-D: repeat E01/1 exactly | 48 | 4 / 18 | 14,400 | 2 / 2 |
| FIX-04-MIDNIGHT-BEFORE: 03:59:59Z, September 20 locally | 48 | 1 / 4 | 2,800 | 1 / 2 |
| FIX-04-MIDNIGHT-AT: 04:00:00Z, September 21 locally | 48 | 4 / 18 | 14,400 | 2 / 2 |
| FIX-04-RECEIPT-VOID: E01 revision 2 | 52 | 4 / 22 | 18,400 | 2 / 2 |
| FIX-04-PROMISE-VOID: E07 revision 2 | 48 | 5 / 33 | 17,400 | 3 / 1 |
| FIX-04-FUTURE-BEFORE: E12 known at 13Z, business as-of 12Z | 48 | 4 / 18 | 14,400 | 2 / 2 |
| FIX-04-FUTURE-AFTER: same E12, business as-of 13Z | 47 | 4 / 17 | 13,400 | 2 / 2 |

Every positive case retains ten line identities and seven open lines. D retains eleven physical event records but ten canonical versions. A void's original revision remains superseded; its replacement is winning but noncontributing. Before E12's business time, it is a known winning revision marked future-effective and noncontributing; it contributes only after the cutoff advances. Midnight knowledge cutoff equals each business-as-of. Line-level answers, supplier scopes and all event flags are explicit in each oracle, beyond the summary above.

| Rejection case | Expected boundary / reason |
|---|---|
| FIX-03-C | Admission / `CONFLICTING_REVISION` |
| FIX-03-Q | Admission / `QUANTITY_EXCEEDS_ORDER` |
| FIX-03-U | Admission / `MISSING_LINE` |
| FIX-03-M | Admission / `INVALID_TYPE` |
| FIX-03-H | Admission passes with nine events; independent reconciliation must reject with `GOLDEN_MISMATCH` against the original ten-event FIX-01 oracle |
| FIX-03-V | Admission / `REVISION_GAP` |
| FIX-03-P | Admission / `CONFLICTING_PROMISE_TIME` |
| FIX-03-N-PRICE and FIX-03-N-QTY | Separate admission cases / `ARITHMETIC_LIMIT` |

Manifests hash the actual changed bytes, so intended rejections do not arise from a stale checksum. H deliberately retains the original independent oracle, including ten physical events and $144, instead of adapting the expectation to the omitted E01. The seven positive packages plus H contain **80 line / 84 physical event records** in total. That is an input bound, not evidence of cloud upload.

## Observed local checks and pinned identities

`node --test test/data/validation-cases.test.mjs` passed **21/21 tests**, zero failures/skips, exit 0; reported duration **104.9363 ms**, in the September 23 America/Chicago session. Exact start/end times were not instrumented. Tests verify manifest/package/oracle identities, each intended admission boundary, baseline preservation, duplicate physical evidence, manual line/supplier arithmetic, and void/future flags. These are local checks, not GoogleSQL execution or report behavior.

The initial test invocation failed sixteen manifest assertions because the strict parser returns null-prototype objects while the manifest builder returns ordinary objects. Comparing their canonical JSON corrected the test's representation mismatch. **No source bytes, expected answers or production parser behavior changed in response.** The rerun above then passed.

| Frozen item | SHA-256 |
|---|---|
| Canonical exported `VALIDATION_CASES` descriptors | `cff8066c104400cb8a257f33a72d6a68743c12a17be48b5324185baa2df50dde` |
| [Catalog and reader](../../src/data/validation-cases.mjs) | `0a3dcd04435641e3a65f1ace308d53997a5a6b1ef5a26ca8faefbab0f84753ca` |
| [Local case tests](../../test/data/validation-cases.test.mjs) | `6516b8e7142c74dfdab34d402323cb01075ab84087a2a0e0af3892becc8ebd65` |

The catalog pins every case's source-package hash and each literal oracle's byte hash. `readValidationCase(caseId)` checks these identities and returns `{package, expected, outcome, rejectionStage, rejectionCode}` plus catalog metadata/raw manifest text. It does not claim semantic admission; the caller must run that check so negative cases retain their intended rejection reason. The hashes above identify the original sixteen-case version, preserved as history.

## Pre-execution extension: earlier knowledge replay

Review identified that earlier-knowledge replay had only local event-selection evidence, distinct from the future-effective-event cases. Before any cloud suite execution, the coordinating agent authorized adding **FIX-02-EARLY-KNOWLEDGE**. The original sixteen package/oracle byte pins are unchanged. This is an additional approved FIX-02 scenario, not an adjustment after an observed SQL failure.

The new case copies the complete FIX-02 source files, with business-as-of and knowledge cutoff both **2026-09-21T12:00:00Z**, retaining `FIX-01` as the source/oracle profile. All **twelve physical/canonical source revisions** remain available to admission, but only **ten known event revisions** belong in the candidate evidence: E10/1 contributes, while E10/2 and E11/1 are not yet known. The static oracle preserves every original FIX-01 business/line/supplier/event answer, changing only its physical and canonical source event counts to twelve. Expected totals remain **48 units / four overdue lines / 18 overdue units / $144**. Canonical source count twelve and returned known-event key count ten intentionally describe different scopes.

The complete catalog now has **17 cases: eight positive, eight admission rejections and one reconciliation rejection**. Nine packages are upload-eligible, totaling **90 line / 96 physical event records**. Rerunning `node --test test/data/validation-cases.test.mjs` passed **23/23 tests**, zero failures/skips, exit 0, reported duration **116.634 ms**. This includes unchanged-baseline checks and an explicit assertion that the new source files equal the existing complete FIX-02 bytes while the independent answers remain the earlier FIX-01 state.

| Extended frozen item, observed 23:04:40.525Z | SHA-256 |
|---|---|
| FIX-02-EARLY-KNOWLEDGE source package | `fb2f0df84de772f33512107168b2decab4ae9152145a5dee06ab221a8ac360a2` |
| FIX-02-EARLY-KNOWLEDGE oracle bytes | `fa3ace48a2b0f3b97f5af8a0353be0b0df56442d9b1953ba9d000c60c5236866` |
| Canonical exported seventeen-case descriptors | `e9b323f70282857ac053870ed64db4477dd37a3a626083949c16d4950fa0d1e6` |
| Updated catalog/reader module | `230210638f02b680eb81591ca16af7359d622ea5047279efc8f52f288315118e` |
| Updated local case tests | `bf7d5a7c563776c4d41b1169493bbfa18b9ea109d71cba0fd1ca958421219c9a` |

## Executed cloud outcomes and retained failure

The coordinating agent observed **175/175 local tests passing**, zero failures/skips, reported duration **1064.2248 ms**, before cloud execution. This broader local run did not replace the literal oracle checks above. The [failed-attempt record](phase-6-boundary-failed-attempt.json) preserves the actual command interval **23:07:33.751Z–23:08:00.921Z** and attempt **`450844cd619c42deacdaaddf7e4f46d3`**, quota date **2026-09-23 Pacific**. Suite version was `FIX02-FIX04-v1.1`, identity `validation_suite_3e3d91567ed3395f84d7afc73668f3edb4910f05c71cf74979f79b0f4de7cfdb`. Its executed module SHA-256 is `602f915aa0c45e214cf18317f491645b64f7316142d8063670f7b0ee835d9587`; the record pins all executed code and original oracle/source identities.

Two successful work-only load jobs inserted exactly **90 lines / 96 physical event records**. A separate actual query reconciled every physical occurrence, source hash, payload and locator. Twenty-seven dry runs bracketed the empty/populated work-table estimates. The unchanged production transform SQL then exercised nine admitted candidate packages; eight invalid packages were rejected locally without upload.

**All seventeen expected case outcomes passed.** Each positive candidate matched its literal line states, event identities/flags, all totals and supplier scopes. Observed overdue values were **$144** for D, **$28/$144** across midnight, **$184** for receipt void, **$174** for promise void, **$144/$134** before/after E12's effective time, and **$144** for earlier-knowledge replay. The latter retained twelve source versions while returning only the original ten known event rows. The eight admission rejections returned their specified codes and source locators. H's actual candidate contained nine events and yielded **52 remaining / $184**; independent reconciliation rejected it for missing event/version identity rather than accepting its internally consistent totals.

D was evaluated again under a distinct query job ID using the same retained work rows. The repeated candidate matched its independent oracle and full first-result fingerprint, `0f2b802b501ecb75e78909646884a96dfd02ac292bb8f8003330479f1862d179`. This is repeated candidate evaluation, with no second upload or serving publication. Before/after reads of the original READY/PASS FIX-01 batch both reconciled to **48 remaining / $144** and the identical complete result hash `710a853f4f2117408891cee5b6cc698d1c4b704401b6aeece98daadcb0a6589c`. These checks completed and were saved before the final cost probe. **The suite performed no serving writes or Desktop refresh.**

The final deliberately tiny-table SELECT used **`maximumBytesBilled = 1`**. The suite verifier expected a different service error representation and stopped with **`UNEXPECTED_LIMIT_CONTROL_RESULT`**; the original attempt remains **FAIL**. A later [read-only metadata observation](phase-6-limit-probe-metadata.json), **23:08:51.128Z**, found the exact known job **DONE**, in the approved project/region, with configured cap **1**, error reason **`bytesBilledLimitExceeded`** and the expected bytes-limit message. Both billed and processed byte statistics were **absent/null**. This demonstrates an actual service rejection, with subsequent verifier reconciliation recorded below. Null is not zero, and the failure is not relabeled a clean suite run. No fixture or business expectation was changed to accommodate this outcome.

## Costs, limits and acceptance scope

The successful suite queries reported **293,601,280 billed bytes (280 MiB)**; the failed probe's usage fields were absent. At the previously verified **$6.25/TiB** rate, those reported bytes imply approximately **$0.001669 gross query cost**, excluding any unreported probe charge, storage and other services. This is a calculation, not an invoice or exact all-service cost. The recorded conservative projection was **304,087,040 bytes (290 MiB)**, and the full **2 GiB** reservation remains retained for the failed attempt. All three permitted Pacific September 23 workload attempts are consumed; no fourth query attempt or reset is authorized. Subsequent probe inspection/reconciliation must reuse existing metadata without submitting a new workload.

These results add bounded evidence to **QA-03/04** for exact physical duplicate preservation/canonicalization, corrected-history replay at the earlier knowledge cutoff, repeated candidate equality and unchanged prior results. They do not demonstrate another D serving publication or a new delta-origin publication; [runtime delta evidence](phase-6-incremental-cloud-validation.md) has its own scope. **QA-05** gains observed rejection reasons and whole-candidate reconciliation failure, bracketed by actual last-good reads; the suite is a work-only validation harness, not an injected failure inside a serving transaction. **QA-02 remains incomplete** for the FIX-05 empty/closed filters, invalid/mixed-batch and freshness/report cases. No final report or buyer-task behavior is established here. The [acceptance matrix](acceptance-matrix.md) owns complete criterion statuses; no gate approval follows from these subchecks.

## End-of-day metadata reconciliation

At **2026-09-23T23:14:17.636Z**, the repaired classifier verified the original known job through [read-only metadata reconciliation](phase-6-limit-probe-reconciliation.json). Exact job/project/region, SQL, parameter, cap and completed error status matched. **Control verification: Pass**; absent billed/processed statistics remain **null**. Google documents that a query rejected at its maximum-bytes limit incurs no query charge; this is a [provider-policy inference](https://docs.cloud.google.com/bigquery/docs/best-practices-costs#restrict_the_number_of_bytes_billed_per_query), not an observed zero or invoice. The original attempt stays **Fail**, its reservation is retained, and the repaired full suite was not rerun. No fourth workload occurred.

The final local suite passed **177/177 tests**, including regression tests for this actual service response. Work stopped at the manager's request; current-revision CI and Gate 6 remain pending.
