# Gate 3 — Project selection

Package version: **v1.0**. Prepared: **2026-09-20 America/Chicago**. Run: HDG-20260920-01. Gate status: **Awaiting Decision**. Decision owner: **Human Manager**. No project has been selected.

**Recommendation: Proceed with Conditions on OPP-02 — overdue purchase-order follow-up**, approving [draft charter v1.0](../project-charter.md) as the business baseline and authorizing architecture preparation through Gate 4. This is a judgment between close alternatives, not a decisive numerical winner. Selection does not authorize implementation, provisioning, spending, permission changes or release.

## Why this project, and why now

[Gate 2 / DEC-G2-001](gate-2-triage-review.md) approved OPP-01, OPP-02 and OPP-04 and all fictional comparison premises without changes. The [reproducible prioritization](../portfolio/prioritization.md) applies the unchanged Gate 1 framework. Base scores are **OPP-01 4.0, OPP-02 3.9, OPP-04 3.3**. Receivables and PO follow-up form a practical tie; uncertainty and sensitivity do not establish a unique winner.

OPP-02 has more hypothetical benefit headroom than OPP-01 ($19,200 versus $12,000/year under the accepted premises), with a similar small-lab footprint and data-synthesis burden. It offers useful event reconciliation, exception reporting and recovery work without OPP-04's two-source fulfillment chronology. The [public-data review](../portfolio/data-feasibility.md) found useful references but incomplete required histories; it supports synthesizing the missing company events for any survivor. Synthetic-data convenience does not increase company data-readiness scores.

The recommendation reflects the manager's approved concession toward lower implementation cost for this experiment. It is not a claim that this is the best real-world investment. The scored costs are hypothetical professional benchmarks; actual single-person feasibility and cash remain separate decision constraints.

## What we give up; alternatives

OPP-01 offers a slightly smaller human planning allowance and a marginally higher base score; choose it if minimum review burden dominates benefit headroom. OPP-04 has a higher accepted gross-value premise ($30,000/year) but greater lifecycle, data-generation and verification complexity. OPP-08 cost-to-serve, OPP-09 replenishment and other deferred opportunities retain greater possible business upside and would need a different first-run scope and evidence base.

**No-build/native-process improvement** remains the lower lab burden alternative. Gate 2 already stipulated a residual fictional gap after simpler improvements; no real ERP evaluation occurred. No-build produces no end-to-end delivery experiment evidence and incurs no new project implementation burden, but existing-system costs and residual business losses are unknown. If access costs, required human work or endpoint feasibility are unacceptable, prefer Additional Discovery, a revised endpoint or Do Not Proceed over forcing a build. Neither a small positive modeled company balance nor a weighted score establishes ROI.

## Effort, costs and MVP

The [single-person estimate](../portfolio/experiment-delivery-estimate.md) allows **5–12 human hours** for OPP-02 from selection through handoff, with agent runtime and external waits unknown. At an illustrative 2–4 hours/week of human availability, this suggests roughly 2–6 weeks of availability, subject to additional execution/waits; capacity has not been confirmed. The company's **10–18 engineering days / $8,000–14,400 labor benchmark** is not the user's expected bill or agent schedule.

The proposed lab cloud component is **$2–12/month**, or **$4–24 for the common two-month development costing window**, using the existing B1 assumptions. **Total actual incremental cash is Unknown** until required tool/agent entitlements, host/access remediation and deployment services are checked. Future light lab ownership is initially estimated at 0.5–1 human hour/month plus incidents/changes. Gate 4 must price and bound the actual route before paid work; these estimates authorize no spending.

The MVP is a daily overdue-PO queue with remaining-quantity and commitment evidence, summary-to-line drilldown, explicit data freshness/provenance, deterministic source generation where needed, independent expected cases, rerun/correction/recovery checks and an operating/cleanup runbook. The proposed endpoint is a **deployed GCP/BigQuery lab backend connected to a locally verified Power BI Desktop report**. Hosted sharing, actual ERP/supplier integration, supplier outreach/writeback, predictive recommendations and enterprise availability are excluded.

The charter defines six measurable outcomes, three scripted buyer tasks, real owners, evidence limits and the delivery sequence. Synthetic records can demonstrate specified logic and observed platform behavior; they cannot demonstrate real extraction feasibility, supplier behavior, savings, adoption or untested scale. Generator/fixture work is part of implementation, and one human remains responsible for the required reviews and host checks.

## Proposed conditions

These conditions are proposed for this selection decision, not already imposed or closed. **No further prerequisite clarification is needed to decide Gate 3.** If accepted, architecture/documentation and read-only feasibility checks may proceed while the conditions remain open. Implementation and paid actions remain subject to their later explicit authorizations.

| ID | Requirement / owner | Due / affected work | Closure evidence and authority | Status |
|---|---|---|---|---|
| C3-01 | Establish supported GCP/BigQuery identity, project/billing and delivery-tool route; agent investigates, manager handles required authentication/account decisions | Before Gate 4 approval; blocks commitment to an unusable cloud design | Observed supported access path and remaining action list, reviewed by manager at Gate 4; no credential disclosure or self-granted permission | Open, proposed |
| C3-02 | Establish Power BI authoring, connection and host-verification path; manager is the proposed sole human verifier | Before Gate 4 approval; blocks commitment to an unverifiable report endpoint | Supported host/access and required human procedure confirmed; design must permit first full-path test after Gate 5 before broad build-out. A changed endpoint requires explicit Gate 3 amendment | Open, proposed |
| C3-03 | Reforecast actual human capacity, incremental purchases/cloud/tool costs and resource/troubleshooting/cleanup limits; agent prepares, manager approves | Before Gate 4 approval; any paid or permission-changing action still needs its explicit authority | Concrete operating envelope distinguishing forecasts, controls and authorized limits, with known exclusions; manager accepts at Gate 4 | Open, proposed |
| C3-04 | Bind public/synthetic provenance, material PO definitions and independent expected outcomes before implementation; agent prepares, manager reviews material choices | Before Gate 5 approval; blocks dependent implementation | Approved contracts and test expectations, with generator/transform not the sole oracle; source terms checked before any reuse | Open, proposed |

Current [capability evidence](../environment-readiness.md) verifies Git/Node and starting files, not working cloud/report access. These are unresolved conditions, not evidence of impossibility or reasons to reopen the already accepted fictional benefit premises. See the [risk register](../risk-register.md) for access, spend, synthetic-test bias and one-person availability risks.

## Baselines and decision requested

Approve **OPP-02 and charter v1.0**, including its problem/users, MVP/exclusions, owners, measurable outcomes, route/endpoint and C3-01 through C3-04. This permits architecture preparation and a Gate 4 decision package only. Alternatively select OPP-01 with a revised charter, request Additional Discovery, or stop.

The [Phase 3 evidence record](../evidence/prioritization-validation.md) binds the exact submitted recommendation, charter, inputs and calculations with content hashes. Prerequisites are [Gate 1 framework v1.0](gate-1-portfolio-review.md) and [Gate 2 package v1.0](gate-2-triage-review.md). Recommendations are not approvals.

| Actual decision field | Record |
|---|---|
| Outcome / selected project | **No decision recorded / None** |
| Approved charter / conditions | None |
| Approver, date and source | Awaiting explicit Human Manager response |
| Authorized next phase | None beyond preparing this Gate 3 package |
| Next boundary if approved as proposed | Gate 4 architecture review; no implementation or provisioning from selection alone |
