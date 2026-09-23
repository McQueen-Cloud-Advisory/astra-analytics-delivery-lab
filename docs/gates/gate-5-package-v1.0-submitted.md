# Gate 5 — Analytics design review

Package: **v1.0**, 2026-09-21 America/Chicago. Run: HDG-20260920-01. Status: **Awaiting Decision**. Recommendation: approve the proposed data/analytics and acceptance baseline. No Gate 5 approval or product implementation is recorded. [Gate 4](gate-4-architecture.md) accepts the architecture and short demonstration; unresolved billing/runtime/cost conditions still block dependent cloud work.

## Four decisions for review

| Decision | Recommendation | Business or operating consequence |
|---|---|---|
| **D5-01 — Which commitment defines overdue?** | Use the latest effective, known promised date for today's follow-up; show original promise and postponement separately | An extension can remove a line from today's overdue queue, while the changed commitment remains visible. This is follow-up prioritization, not historical supplier performance |
| **D5-02 — Date, quantity and value meaning** | Promises remain on time through local end of day in **America/New_York**, using calendar days. Integer EA quantities; fixed USD line prices. Remaining = ordered − received − explicitly cancelled | Due today is not late. Partial receipt remains open until its residual is received or cancelled with a reason. No holiday/UOM/currency conversions. Remaining purchase value is exposure, not debt or savings |
| **D5-03 — Invalid input and corrections** | Any malformed/conflicting/invalid record blocks the entire candidate; exact duplicates are no-ops. Corrected/late events create a new immutable batch; retain the previous good batch | Avoid a misleading partially clean report. Preserve corrections and rejection reasons; do not overwrite a report's referenced batch or claim refresh success after a failed attempt |
| **D5-04 — Acceptance and short execution bounds** | Approve the independent fixtures and QA thresholds; default to the 10-line golden case. Aim for at most seven active cloud-working days, with a **14-calendar-day stop/review and expiry baseline from first billable workload/storage**, seven-day raw retention, and prompt cleanup once required evidence is preserved | These duration/retention numbers are agent proposals implementing the requested short experiment, not a minimum run or user-supplied deadline. No extension or fresh batch silently resets the clock. Retain $10/calendar-month and $20 whole-experiment ceilings. Larger data profiles are optional, not required evidence |

BR-01..04 in the source contract make these choices explicit. They are fictional recommendations submitted for decision, not invented facts about a real company. There are no additional buried business questions. Approval does not establish that billing, runtime credentials, cost controls or Desktop refresh already work.

## Model and contracts

Immutable **PO lines** plus versioned **receipt, cancellation and promise events** enter the work dataset. Deduplicate by business/event-revision identity, enforce chronology/quantity rules, select revisions by business-as-of and knowledge cutoff, and reconcile against independent expectations. Publish three consistent serving objects atomically: one row per **batch + PO line**, event evidence for that batch, and its ready manifest. Every report import pins the same batch.

| Baseline v1.0 | Review content |
|---|---|
| [Source/target contracts](../data/source-contracts.md) | SRC-01..03 and BR-01..04: types, keys, chronology, corrections, raw/canonical/serving grains, quality, schema evolution and replay |
| [KPI contracts](../data/kpi-contracts.md) | Eight measures/status definitions, filter and aggregation rules, exact cents, zero/blank semantics and source freshness |
| [Generator specification](../data/generator-spec.md) | Seeded synthetic-only provenance; literal golden fixture, optional 100-line coverage and unscheduled 1,000-line stress profile; fixed reproduction rules |
| [Independent expected fixtures](../data/expected-fixtures.md) | Five fixture groups covering normal state, offsetting corrections, duplicate/invalid/recovery cases, time/void boundaries and empty/freshness/host tasks |
| [Acceptance plan](../qa/acceptance-plan.md) | QA-01..15 mapped to charter SC-01..06, explicit thresholds and evidence owners; **all Not Run** |
| [Implementation plan](../plans/implementation-plan.md) | Minimal real cloud-to-Desktop proof before expansion, then platform/report/release/acceptance gates and cleanup |
| [Execution envelope v1.1](../operations/execution-envelope.md) | Existing approved limits plus the newly proposed short-duration/retention details in D5-04 |

The primary hand fixture has **91 ordered, 31 received, 12 cancelled and 48 remaining units**. **Four overdue lines contain 18 units and $144 of remaining purchase value**. A later correction and late receipt offset in aggregate quantity, but must change the correct two lines and reduce overdue value to **$140**. This deliberately tests failures that row-count or grand-total-only checks miss. These are expected answers, not observed pipeline results.

Acceptance requires zero unexplained event-key, quantity, cent-value or classification differences; ratio tolerance is `1e-9`. Prove initial/subsequent loads, same-input replay, late/corrected input, rejection and interrupted-publication recovery. The manager verifies real Desktop connection, refresh/reopen, calculations, filters, stale-state visibility and three scripted buyer tasks. Credential-free CI and actual cloud evidence remain required.

All transactions are synthetic because the inspected public samples do not supply the required lifecycle. Seeded cases test specified logic; they cannot establish real extraction quality, company readiness, supplier behavior, adoption or the hypothetical eight-hour weekly benefit. No real transaction source, publication or outreach is introduced.

## Readiness and next boundary

The dedicated project **`astra-po-lab-20260921`** exists, but existing-account linkage failed with **Cloud billing quota exceeded**. [Bootstrap evidence](../evidence/cloud-bootstrap.md) records billing disabled/no account link. The manager must resolve the quota or manually link usable billing; the agent must not create a billing account. **Deprecated `financial-analytics-demo` is prohibited**, including as a quota/billing context.

After Gate 5 approval, local implementation can proceed within this baseline. Cloud-dependent work remains blocked until billing linkage, account/headroom/regional rates, scoped runtime and required cost controls are verified. No further approval is needed merely to complete the already-authorized existing-billing setup. No product code, generator, SQL, deployment or report build has started during this design phase.

Gate 5 approval authorizes Phase 6 implementation within the accepted architecture/envelope; it does not approve final report design, release or acceptance. Gates 6–9 remain. Simulated business dates allow aging and stale-state checks without waiting weeks; actual execution and refresh evidence retain real timestamps.

## Actual decision

| Field | Record |
|---|---|
| Outcome / approver / source | **Pending Human Manager decision** |
| Requested baseline | D5-01..04 and linked versions above; see [design validation](../evidence/data-design-validation.md) for fingerprints and desk checks |
| Material open operating blocker | Billing quota/linkage plus remaining cloud readiness; no new billing account permitted |
| Work authorized by this file alone | None; this is a review package |
