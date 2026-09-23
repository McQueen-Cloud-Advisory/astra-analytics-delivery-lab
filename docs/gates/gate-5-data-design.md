# Gate 5 — Analytics design review

Package: **v1.0**, 2026-09-21 America/Chicago. Run: HDG-20260920-01. Status: **Approved — no changes**, DEC-G5-001. Status record v1.3; approved business/data package v1.0 unchanged. Exact [submitted package](gate-5-package-v1.0-submitted.md) is preserved. [Gate 4](gate-4-architecture.md) accepts the architecture and short demonstration. Submission sections below retain their pre-approval context; the actual decision and subsequent evidence at the end supersede pending-billing/implementation statements. The minimal cloud-to-Desktop proof and bounded FIX-02 correction/recovery/no-op checks now pass; broader evidence remains due at [Gate 6](gate-6-data-platform-validation.md).

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
| Outcome / approver / source | **Approved unchanged**, Human Manager, conversation instruction reproduced below |
| Requested baseline | D5-01..04 and linked versions above; see [design validation](../evidence/data-design-validation.md) for fingerprints and desk checks |
| Current operating boundary | Minimal Desktop proof, bounded FIX-02 correction/recovery/no-op, authorized dependency audit and exact-snapshot CI pass. All three Pacific September 22 cloud attempts are consumed; remaining work is local until a new quota day and fresh readiness checks. Broader platform cases and later working-tree CI coverage remain due at Gate 6. No new billing account permitted |
| Authorized work | Phase 6 implementation inside the accepted architecture/envelope, subject to cloud readiness; first real cloud-to-Desktop proof before backend expansion |

## DEC-G5-001 — Actual approval and subsequent evidence

Approval date: **2026-09-21 America/Chicago**; instrumented logging began **2026-09-22T02:10:30Z**. Exact user-message time is unavailable.

> Approve with no changes. In the future, when a decision is required, provide at most 3 options, along with the recommended option among the choices. Also, I set up and linked a billing account to the GCP project you created.

This approves D5-01..04 and all linked contract/fixture/acceptance versions unchanged, including the seven-active-day aim, day-14 stop/review and seven-day raw retention. C3-04 closes. Material analytics definitions are no longer pending; earlier proposal wording above is submission history. Future decisions must offer **at most three options with the recommendation identified**; the already-approved four decision areas are not retroactively rewritten.

Billing was initially unreadable because CLI reauthentication was required. The manager replied “Just logged in.” A subsequent metadata read verified **billing enabled**, open **USD** account reference **ending BA6E** on **astra-po-lab-20260921**. The earlier quota blocker is resolved for linkage; actual cost/headroom, configured controls and scoped runtime verification remain distinct. No billing account was created by the agent.

The manager supplied login, not a technical repair. Gate 5 does not approve Gate 6, final report completion, release or acceptance. Read the [current state](../project-state.md) and Phase 6 evidence for executed results.

Subsequent observations: the manager confirmed at least **$15** available headroom; [cost/runtime controls](../evidence/cloud-controls.json) were verified and two datasets/five tables provisioned. [FIX-01 ingestion, processing and publication passed](../evidence/phase-6-cloud-proof.md), with the failed first process attempt preserved. A later diagnostic token exposure was contained through explicit manager-authorized revocation and renewed sign-in; [SEC-001](../evidence/security-evidence.md) retains the incident. The [minimal Desktop proof passed](../evidence/desktop-proof-validation.md): both refreshes showed **48 remaining units / $144 overdue value / 10 lines**, including save/reopen. The report remains pinned to FIX-01.

[FIX-02 correction, bounded prepublication recovery and verified no-op](../evidence/phase-6-correction-validation.md) subsequently passed, preserving the separate FIX-01 result and the actual local persistence failure/repair. All three permitted cloud attempts for Pacific September 22 are consumed. After the earlier automatic-review rejections, the manager authorized the audit/findings review and conditional publication in [DEC-SEC-002](../decisions/decision-log.md#dec-sec-002--authorize-npm-audit-and-conditional-public-ci-push). The audit returned zero known vulnerabilities; exact snapshot `8e9649e` was published and [actual CI passed all 98 tests](../evidence/ci-validation.md). Later local composition changes pass 110 tests but remain uncommitted/unpushed and outside that CI result. Runtime retained-history delta ingestion, other remaining cases and current-revision CI coverage still prevent a Gate 6 recommendation. None of these observations self-approves Gate 6.

**September 23 stopping-point update:** the manager asked to pause for the day and update the README. [Runtime retained-history checks](../evidence/phase-6-incremental-cloud-validation.md), [17 boundary cases](../evidence/phase-6-boundary-validation.md) and metadata-only cost-control reconciliation now supply further evidence; the failed suite attempt remains recorded. All three Pacific September 23 attempts are consumed. Current local tests pass 177/177; matching CI, Gate 6 and the proposed report-test sequencing amendment remain pending. This supersedes earlier current-work statements above without changing DEC-G5-001. See [project state](../project-state.md) for the next authorized resume.
