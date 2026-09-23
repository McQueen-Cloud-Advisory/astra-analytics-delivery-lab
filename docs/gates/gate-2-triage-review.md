# Gate 2 — Triage review

Package version: **v1.0 — approved without changes**. Decision-record revision: **1.1** (approval and execution clarification appended). Prepared/approved date: **2026-09-20 America/Chicago**. Run: HDG-20260920-01. Gate status: **Approved**. Decision owner: **Human Manager**. Decision ID: **DEC-G2-001**.

The [original submitted package](gate-2-package-v1.0-submitted.md) is preserved byte-for-byte, SHA-256 `C9FB7CA53C53BB54551F826E87EC646DA03BF93D084BF801E8BCFE135871E52A`. Proposal wording below is retained as submission history. The actual decision at the end adopts all proposed dispositions and SCN-01/02/04; it also records the manager's single-person/public-or-synthetic-data execution clarification. Gate 1 weights and anchors are unchanged.

## Decision requested

Approve **OPP-01 (receivables exceptions), OPP-02 (overdue PO follow-up), and OPP-04 (ship-by exceptions)** as the survivor set for Phase 3, **including the explicit adoption of SCN-01, SCN-02 and SCN-04 below as fictional comparison premises**. Also approve the remaining proposed dispositions in the triage record, or specify changes. No premise has already been approved through Gate 1.

This decision permits detailed prioritization using approved framework v1.0. It does not select a project, approve KPI definitions or architecture, authorize spending/access changes, or waive later feasibility checks. A candidate whose premise is not adopted remains Needs Discovery and is excluded from scoring. If no premises are adopted, there is no approved survivor set and no Phase 3 scoring begins.

## Evidence and proposed outcome

The [triage v1.0](../portfolio/triage.md) evaluates all twelve candidates, alternatives, risks, re-entry conditions and judgment calls. The original [portfolio v1.0](../portfolio/opportunity-portfolio.md) remains the dated discovery submission; the triage is the current assessment. [Gate 1 / DEC-G1-001](gate-1-portfolio-review.md) records the actual approval and the manager's rationale for accepting lower implementation-cost concessions in this experiment while recognizing the value-maximizing model's greater real-world value.

| Proposed disposition | Candidates | Main rationale |
|---|---|---|
| Advance, upon adoption of stated premises | OPP-01, OPP-02, OPP-04 | Identifiable recurring decisions, bounded analytical product, and explicit hypothetical incremental-value case beyond simpler alternatives |
| Needs Discovery | OPP-05 inventory aging; OPP-06 returns/refunds; OPP-07 freight variances | Data/semantic/actionability gaps could materially change scope or the benefit case |
| Reject as currently framed | OPP-03 weekly sales scorecard | No distinct unserved decision; low implementation cost does not establish incremental value |
| Defer for this experiment | OPP-08 cost-to-serve; OPP-09 replenishment; OPP-10 control tower; OPP-11 service assistant; OPP-12 supplier portals | High potential value remains visible, but operating burden, evidence needs or delivery route do not fit this first run |

### Explicit premises requiring adoption

All are **proposed scenario assumptions, not observed results or cash savings**. The simpler alternative is assumed to have been considered in the fictional situation; no actual ERP/workbook evaluation occurred.

| Premise | Fictional residual gap after simpler alternatives | Gross addressable benefit mechanism |
|---|---|---|
| SCN-01 / OPP-01 | After native ERP/workbook improvement, five residual AR reconciliation hours/week are assumed removable, net of added business review effort | 5 × 48 weeks × $50/hour = $12,000/year |
| SCN-02 / OPP-02 | After native alerts/process improvement, eight residual PO/receipt/cancellation reconciliation hours/week are assumed removable, net of added business review effort | 8 × 48 × $50/hour = $19,200/year |
| SCN-04 / OPP-04 | A commitment-to-shipment gap remains after native queue/export improvement; morning data arrives before meaningful action and 3,000 preventable fulfillment rework events/year remain addressable | 3,000 × $10/event = $30,000/year |

The values are proposed comparison baselines inside the original portfolio bands, not revised lower bounds. Their credibility here depends on manager acceptance as experiment premises. They preserve the approved $10k/year credible gross-value floor; actual realization can be below it or zero. Freed capacity is not necessarily cash savings. Real-world benefit, source readiness and net ownership economics remain unvalidated. Scoring must use confidence/ranges and the original no-build and value-first sensitivity rules; these premises do not make any candidate the winner.

## Recommendation, alternatives, and judgment calls

**Recommendation:** approve the proposed set and all three premises for a bounded scenario comparison. This makes the experiment executable without pretending that the fictional company supplied empirical evidence. Preserve the remaining concepts and their explicit re-entry conditions.

**Alternative A:** modify or decline one or more premises/candidates. Only explicitly approved survivors enter Phase 3. A materially changed opportunity returns through the affected triage decision.

**Alternative B:** keep all six viable analytical concepts OPP-01/02/04/05/06/07 in Needs Discovery and request the bounded scenario clarification described in triage. No scoring follows until a revised Gate 2 survivor decision. Do not require unavailable real-company interviews to make a fictional demonstration possible.

The principal judgment calls are whether native alternatives erase the small projects' incremental value; whether OPP-04's action window works at daily freshness; Reject versus redefine for OPP-03; and whether the larger business opportunity of OPP-08 warrants a different experimental mandate. The latter remains attractive for a value-led portfolio without overriding the current approved framework.

Capability gaps in [environment readiness](../environment-readiness.md) remain due before commitment/dependent execution at Gates 3–4. No cloud or Power BI feasibility result has been invented. Discovery notes for excluded candidates are proposed future work only; approving this survivor set does not automatically authorize that separate work.

## Actual management decision — approved

| Field | Record |
|---|---|
| Final dispositions / survivor set | Approved unchanged: OPP-01, OPP-02 and OPP-04 Advance; OPP-05/06/07 Needs Discovery; OPP-03 Reject as framed; OPP-08/09/10/11/12 Defer |
| Approver / decision date | Human Manager; 2026-09-20 America/Chicago. First instrumented recording 2026-09-21T01:18:53Z; exact message timestamp is not exposed |
| Decision source | User's explicit response approving this package without changes; faithful excerpt below. No message identifier is exposed |
| Approved artifact revisions | Submitted Gate 2 package v1.0 (hash above) and triage v1.0, SHA-256 `F69FFE4BB6819B44C92F458D54DD2ED8206E0F9FFB8B1E17E6FF3533D9E80F30`, under approved framework v1.0 |
| Adopted scenario premises | SCN-01, SCN-02 and SCN-04 adopted for fictional comparison. This is not empirical benefit or data-readiness validation |
| Execution clarification / owner / due | Agent must reflect one-human execution feasibility, separate actual experiment costs from fictional benchmarks, and source publicly usable data or synthesize missing data with implications. Carry into prioritization/charter at Gate 3; finalize resource/spend/verification limits at Gates 4–5 |
| Authorized next work | Phase 3 comparison of OPP-01/02/04, Gate 3 selection recommendation and draft charter. No architecture, implementation, spending, permission change or release authorized |
| Reopening history | None |

Faithful decision excerpt:

> Approve Gate 2 recommendation package with no changes. Note that while we can project costs for the fictional company, true development costs, feasibility, and cost of implementation are bounded by the reality that this is an experiment conducted by a single person. Data which cannot be publicly sourced will need to be synthesized and the implications of that on the project must be noted.

The experiment has one human manager/operator/verifier assisted by the agent; fictional department roles are scenario personas, not available staff. Do not turn professional person-day benchmarks into this person's cash bill, infer a human hourly rate, assume free agent usage, or claim multiple independent human reviewers. Estimate their actual review/setup/verification workload separately; retain unobserved effort/cost as unknown. Public availability must also satisfy fitness and permitted-use checks; a publicly downloadable synthetic sample remains synthetic. Document missing source coverage, generator/fixture work, and the limits on realism, integration, performance, adoption and business-value claims.

This is an execution clarification accompanying an unchanged package approval, not rejection or a technical intervention. The approved framework still governs comparative analysis; the actual one-person feasibility constraints can override a numerical benchmark. See [decision log](../decisions/decision-log.md) and [project state](../project-state.md).
