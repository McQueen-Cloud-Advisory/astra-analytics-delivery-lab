# Gate 2 — Triage review

Artifact version: **v1.0**. Prepared: **2026-09-20 America/Chicago**. Run: HDG-20260920-01. Gate status: **Awaiting Decision**. Decision owner: **Human Manager**. Decision ID: **DEC-G2-001 (proposed)**.

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

## Actual management decision — pending

| Field | Record |
|---|---|
| Final dispositions / survivor set | Pending — none approved |
| Approver / decision timestamp | Not yet recorded |
| Decision source and faithful excerpt | Not yet recorded |
| Approved artifact revisions | None; proposed package is Gate 2 v1.0 and triage v1.0 under unchanged framework v1.0 |
| Adopted scenario premises | None; explicitly record SCN-01, SCN-02 and/or SCN-04, or the manager's modifications |
| Conditions / owner / due point / closure evidence | Not established; do not infer closure or approval |
| Authorized next work | Pending; proposed authority is Phase 3 comparison of approved survivors only, then Gate 3 selection memo and draft charter |
| Reopening history | None |

Record the actual source, adopted premises, survivor IDs, approved revisions and any conditions before proceeding. The [master prompt's Gate 2](../../prompts/astra-analytics-delivery-master-prompt.md#gate-2--triage-review) requires approval of the surviving set before detailed prioritization.
