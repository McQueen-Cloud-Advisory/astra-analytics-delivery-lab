# Gate 6 — Data platform validation

Run **HDG-20260920-01 / OPP-02**. Package **v1.1 draft**, prepared **2026-09-23 UTC** by Astra. Decision owner: **Human Manager**. Gate status: **In Progress; not ready for a decision**. No Gate 6 approval or acceptance-plan amendment is recorded. [Gate 5 / DEC-G5-001](gate-5-data-design.md) remains the authority for Phase 6 and approved the contracts, fixtures and acceptance plan unchanged.

**Paused for the day at the manager's request.** The subsequent publication-only instruction produced implementation commit `acdb6d3` and matching CI with 177 passing tests; final gate-package review remains deferred until an authorized experiment resume. This draft makes a prospective sequencing choice reviewable. Complete the remaining backend evidence and matching CI before presenting it for decision. Final report design remains blocked by Gate 6; report completion remains blocked by Gate 7.

## Platform implemented and observed evidence

The bounded implementation uses a local Node runner with keyless service-account impersonation, explicit **astra-po-lab-20260921 / us-east4**, two datasets and five existing tables. Physical raw occurrences retain source identity, locator and payload hash. The unchanged GoogleSQL transform produces line/event candidates; independent-oracle reconciliation precedes one atomic transaction publishing three serving tables. The runner retains attempts and job IDs, reconciles uncertain jobs before retry, and verifies a complete immutable batch before declaring a no-op. Execution remains operator-run; no new scheduler, always-on service, published Power BI service or broader permissions are proposed.

| Requirement / evidence | Observed result and limit |
|---|---|
| Initial load and independent FIX-01 reconciliation | [Cloud proof](../evidence/phase-6-cloud-proof.md): ten lines/ten events, zero oracle differences; unsuccessful first attempt retained |
| Minimal actual cloud-to-Desktop proof / QA-07 | [Desktop verification](../evidence/desktop-proof-validation.md): manager confirmed both refreshes showed 48 remaining units, $144 overdue value and ten lines, including save/reopen; scoped connector jobs verified. This closes the minimal proof, not final report behavior |
| Correction, repeat and recovery / QA-03/04/06 subchecks | [FIX-02 evidence](../evidence/phase-6-correction-validation.md): pre-publication stop, bounded journal repair, successful recovery reusing loads and subsequent verified no-op; FIX-01 retained unchanged. The correction gives 48 units/$140 and the expected individual L08/L09 changes |
| Accepted retained-history delta / QA-03/04 subchecks | [Actual delta evidence](../evidence/phase-6-incremental-cloud-validation.md): accepted FIX-01 READY/PASS and all 20 raw occurrences verified, original load metadata checked, two-record delta composed and provenance persisted before target reconciliation. Existing FIX-02 returned **VERIFIED_NO_OP**, four DONE reads, **110 MiB billed**. New delta-origin publication was **Not Run**; the absent-target publication path is mock-tested only |
| Additional FIX-03/04, duplicate and byte-cap cases | [All 17 data cases and duplicate replay passed](../evidence/phase-6-boundary-validation.md); original serving batch unchanged. The attempt remains Fail due to the original cap-checker error. [Separate metadata reconciliation](../evidence/phase-6-limit-probe-reconciliation.json) verifies actual byte-cap rejection with the repaired checker; no full cloud rerun |
| Local automated checks | End-of-day current suite: **177/177 Pass**, zero failures/skips. Bounded source scan: 242 files, zero findings/errors. Power BI static check: 14 sources/three visuals. These are not matching CI or new Desktop observations |
| CI / QA-12 | [Actual CI evidence](../evidence/ci-run-2026-09-23-platform.json): exact implementation commit `acdb6d3`, run 35933272761, **177/177 tests and every configured check passed**. The later documentation-only follow-up records the outcome; runtime source is unchanged |
| Security | [Security evidence](../evidence/security-evidence.md) retains the temporary-token incident, manager-authorized revocation/relogin and safe access restoration, historical automatic-review rejections, later authorized audit with zero known vulnerabilities, and bounded source scans. Final candidate scan/review remains required; no exhaustive clean-security claim |
| Resources, costs and limits / QA-13 | [Post-run metadata](../evidence/phase-6-validation-post-run.json): two datasets/five tables, 86,024 logical bytes, 740 MiB explicitly reported cumulative query usage, approximately $0.004411 gross. Three Pacific September 23 attempts consumed; all reservations retained. Probe billing statistics absent; no-charge treatment is policy inference, invoice unknown. Original September 29 raw/October 6 serving expiry unchanged |

The [acceptance matrix](../evidence/acceptance-matrix.md) must be reconciled to the final evidence before this package becomes Awaiting Decision. Partial criteria stay explicit. The sequencing proposal below does not waive a missing platform case, change the delta no-op into a new publication, or convert mocked failures into observed platform behavior.

## Proposed due-point amendment — not accepted

**Problem:** [QA-02 in the approved acceptance plan](../qa/acceptance-plan.md) requires FIX-01..05 and material KPI-01..08 complete by Gate 6; [IMP-02](../plans/implementation-plan.md) likewise lists FIX-01..05. QA-08/09 place final filter, empty/invalid and freshness behavior before Gate 8, while the master prompt withholds final report design until Gate 6 and completion until Gate 7. Production FIX-05 report behavior and KPI-08/DAX/host checks have not been executed. Treating their later due point as already approved would silently amend the Gate 5 baseline.

**Proposed change AM-G6-01:** move **only the report-layer portion of FIX-05, KPI-08 and empty/filter-context behavior overlapping QA-02/IMP-02** from “complete by Gate 6” to **before the Gate 8 readiness/release decision**, verified under QA-08/09 after Gate 7 design approval. Keep the original Gate 5 baseline intact as history and record the exact amended scope in the actual manager decision and subsequent criterion records.

| Proposed later evidence — unchanged expected answers | Owner / due point |
|---|---|
| Actual report filter/empty/closed-line contexts: valid empty selection and closed L05 yield the specified zero quantities/count/value, blank share/maximum age and `No open lines`; L05 detail remains Cancelled. Applicable supplier/buyer/line contexts and non-additive totals remain correct | Astra implements after approved design; manager verifies Desktop under QA-08, **before Gate 8** |
| Actual report missing/non-ready/mixed-batch selection hides business measures and shows `Invalid batch selection`, distinguishable from a valid empty result | Astra + manager under QA-08/09, **before Gate 8** |
| KPI-08 display and production freshness/validity logic: visible synthetic provenance, source-as-of, knowledge cutoff, batch and observed import time; fixed clocks give five minutes/not stale, exactly 24 hours/not stale, above 24 hours/stale, and pre-as-of/invalid. Label test clocks; imports do not silently refresh historical source dates | Astra + manager under QA-09, **before Gate 8** |

**No numerical threshold, business rule, fixture answer or required case is removed.** Exact cents and zero unexplained quantity/classification differences remain required; ratio tolerance stays `1e-9`. All backend source admission, immutable-batch/READY protections, event reconciliation, KPI-01..07 calculations, date/void/correction/replay/recovery and applicable QA-12/13 requirements remain due at Gate 6. Backend rejection/preservation is not deferred merely because its report presentation is later. QA-10/11 buyer-task/accessibility requirements retain their existing Gate 8 due point. Gate 8 release cannot proceed with the proposed report evidence still missing unless a separate permitted scope decision explicitly addresses it.

This changes evidence sequencing, not the approved synthetic business meaning, service selection, resource lifetime, spend ceiling, host-verification ownership or release authority. While AM-G6-01 is unaccepted, the original QA-02 due point remains binding. Work already authorized in Phase 6 may continue within its envelope; the proposal grants no new authority.

## Three decision options — present only after prerequisites pass

1. **Accept the platform with the specific sequencing condition above (recommended).** Once the complete backend package and matching CI pass, record Gate 6 **Approved with Conditions** and explicitly accept AM-G6-01. This permits Phase 7 report design and keeps all deferred report evidence as a blocking prerequisite to Gate 8. Tradeoff: the platform decision precedes final host behavior; the remaining obligation is named and measurable.
2. **Retain the original Gate 6 deadline.** Require a bounded production-logic/host proof of the outstanding QA-02 report cases before deciding Gate 6, without completing the final report. Agree that proof's scope and any necessary design authority first. Tradeoff: additional pre-gate host work and possibly repeated work after Gate 7; no criterion is deferred.
3. **Stop or defer at Phase 6.** Preserve the implemented evidence and decide cleanup/retention within the existing expiry and spend limits. Tradeoff: no final report or complete experiment acceptance is claimed.

## Submission prerequisites and actual decision

| Submission item | Current status / required completion |
|---|---|
| Remaining bounded backend suite, duplicate repeat and byte-cap behavior | Data cases/replay/retained-batch checks Pass; original overall attempt Fail retained. Repaired classifier passes metadata-only reconciliation; full repaired cloud suite not rerun. Exact evidence limits are linked above |
| Exact candidate revision, final checks, security review and matching credential-free CI | Implementation `acdb6d3`: **Pass**, linked above. Exact source review found no blocker. Freeze the final gate package on the next authorized resume; no gate decision inferred |
| Final acceptance matrix, resource inventory, usage/cost and limitations | Updated with executed platform checks and matching CI; final gate package review remains deferred. No invoice or full report claim |
| Proposed amendment baseline | AM-G6-01 in this **v1.1 draft**; affected QA plan v1.0 QA-02/QA-08/QA-09 and implementation plan v1.0 IMP-02; exact submitted artifact fingerprints **pending** |
| Human decision / excerpt / source / timestamp | **No decision recorded**; none inferred from prior gate approvals, audit authorization, test success or silence |
| Gate outcome / expressly authorized next work | **In Progress**; existing Phase 6 authority only. No Phase 7 start, final report completion, release or new exception authorized |
| Conditional obligation if option 1 is later accepted | **Proposed C6-01**, owned by Astra and the Human Manager, due before Gate 8: complete the exact report-layer cases above with linked actual production-logic and Desktop evidence. Closure requires manager acceptance of those results; no closure recorded |

After evidence is complete, freeze the submitted artifact revision and present these options. Record the manager's actual choice, faithful source excerpt, timestamp, approved revisions and any conditions here before proceeding. Recommendation and an evidence pass do not approve a gate.
