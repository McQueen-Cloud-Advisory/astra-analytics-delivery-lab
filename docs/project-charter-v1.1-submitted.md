# Project charter — overdue purchase-order follow-up

Version: **v1.1 — proposed for Gate 3 re-review**. Updated: **2026-09-20 America/Chicago**. Run: HDG-20260920-01. Status: **Draft; no project selected or charter approved**. Proposed initiative: **OPP-02**. Governing decision package: [Gate 3](gates/gate-3-project-selection.md). [Prior submission v1.0](project-charter-v1.0-submitted.md) is preserved.

Review the [opportunity-cost addendum](portfolio/opportunity-cost-addendum.md) and [selection scorecard](portfolio/selection-scorecard.md) first. This revision incorporates the manager's cost/publication clarification; it does not change the business success criteria or imply approval. GCP cost does not distinguish OPP-01 from OPP-02, and neither has demonstrated superior experimental learning value.

## Problem, users and decisions

In the accepted fictional scenario, buyers reconcile open PO lines, receipts, cancellations and commitments to decide which suppliers to follow up with. **SCN-02** assumes eight residual avoidable reconciliation hours/week after simpler native alerts/process improvements, worth $19,200/year of gross capacity at 48 weeks and $50/hour. [Gate 2](gates/gate-2-triage-review.md) adopted this premise; neither the hours nor their financial realization have been observed.

The MVP will expose an explainable daily overdue-PO queue with line-level evidence so a buyer persona can identify an actionable exception, understand the remaining quantity and commitment, and reconcile it to the source events. The actual user is the single human manager role-playing the buyer. No real supplier contact or operational change follows from generated exceptions.

## Proposed route and endpoint

**Deployed lab demonstration using GCP, BigQuery and Power BI.** The target combines a deployed cloud analytical backend with a locally opened and verified Power BI Desktop report connected to the lab data. The manager explicitly confirmed **the report will not be published**; Power BI Service publication, hosted sharing and capacity purchase are excluded. Packaging, ingestion, scheduling, identity and connectivity choices remain Gate 4 architecture decisions; no architecture is approved here.

The named proposed report/acceptance verifier is the **Human Manager (the sole participant)**, assisted by agent-prepared procedures. The current tools cannot operate native desktop apps, and Power BI host execution has not been verified. [Environment readiness](environment-readiness.md) records usable Git/Node, unverified GCP billing/IAM and missing or inaccessible delivery tooling. Existing PBIP/PBIR/TMDL files are starting artifacts, not host-validated behavior. Gate 4 must establish a supported path and the required human actions before committing to implementation. An inability to verify the endpoint requires an explicit changed decision; generated files alone do not satisfy it.

## MVP and exclusions

The MVP includes a reproducible public-or-synthetic source package, provenance manifest, approved PO-line/receipt/cancellation/promise semantics, a bounded daily analytical update, visible as-of/freshness context, an exception summary and line/event drilldown, reconciliation and recovery evidence, and a runbook with cost/cleanup ownership. The source review currently supports **synthetic canonical company events**, with public reference material only where useful and permitted. Data generation and independent expected cases are delivery work, not assumed inputs already available.

Exclude real ERP or supplier integration, outreach/email automation, writeback, predictive replenishment, historic supplier-performance scoring, enterprise rollout, multiuser sharing, high availability/on-call service and real operational data. Do not add a SQL Server installation solely to consume a sample dataset without demonstrating that it reduces total lab burden. Large-scale performance claims require a specific authorized scale test; fictional company size is not a minimum lab workload.

## Measurable success criteria

These are proposed outcome requirements for selection. Exact schemas, material formulas (including which promise date applies), expected case values, workload and timing thresholds must be approved before implementation at Gates 4–5. None has been tested or passed.

| ID | Proposed criterion and pass measure | Evidence class and required verifier | Validation limit |
|---|---|---|---|
| SC-01 | All approved hand-calculated cases reconcile ordered, received, cancelled and remaining quantities, including partial receipts, promise changes and closure; **zero unexplained quantity differences or classification mismatches** | Executed lab logic tests against expected results independent of generator/transformation code; agent evidence, manager reviews material semantics | Correctness applies to approved cases; does not establish real ERP semantics or completeness |
| SC-02 | Same-input rerun creates **zero duplicate business results**; a late correction changes only the expected cases; malformed inputs are rejected/quarantined with a visible reason and recovery is demonstrated | Recorded rerun, correction, failure and recovery checks at the agreed batch boundary | Tested failures and workload only; not enterprise resilience certification |
| SC-03 | Summary and filtered line drilldown reconcile exactly to the verified analytical result; report visibly identifies synthetic/mixed provenance and as-of state, including the agreed stale-data behavior | Power BI host rendering, interaction, connection and refresh evidence from the named human verifier | File generation or static metadata checks alone cannot pass; no hosted sharing claim |
| SC-04 | The sole human completes **three scripted buyer tasks**: find an overdue line, explain its remaining quantity/commitment from evidence, and identify a stale/invalid-data case; record completion and assistance for each | Observed scripted lab usability, using independently expected answers | Does not establish representative-user adoption, faster work or supplier outcomes |
| SC-05 | Release checks demonstrate the approved GCP/BigQuery-to-report path, a repeatable update, rollback/recovery and the documented operating/cleanup procedure within the agreed resource envelope | Deployed-lab evidence and actual available usage records; agent plus human-only host checks | No production security, service-level or company-scale claim beyond tested controls |
| SC-06 | Handoff accounts for approval outcomes, technical interventions, unknown measurements, human effort when reported, and attributable charges when available; unknowns remain explicitly unknown | Experiment record completeness and manager acceptance at Gate 9 | Cannot infer human time, agent speedup or ROI from conversation timestamps |

**Business-benefit hypothesis BH-02:** the worklist could remove the SCN-02 residual reconciliation burden. The lab can test whether the proposed workflow is understandable on controlled cases. It cannot pass a criterion asserting eight real hours saved or $19,200 realized, since there is no actual company baseline or adoption study. A real-world pilot would require separately authorized operational data, users and measurement.

## Owners, dependencies and risks

| Responsibility | Actual proposed owner |
|---|---|
| Business scope, rule decisions, budgets, gates and acceptance | Human Manager, also serving as buyer persona |
| Technical implementation, automated checks, documentation and proposed recovery | Astra agent within each approved boundary |
| Authentication, human-only Power BI checks and ongoing account/resource ownership | Human Manager; capability must be confirmed at Gate 4 |
| Continuing runbook execution | Human Manager, assisted by agent when available; no independent operations team or unattended agent service assumed |

The manager reports existing GCP with approximately $30/month allowance. Remaining dependencies are the actual project/identity and billing visibility, usable tooling, a viable Power BI Desktop host/connector/authentication route, the manager's availability, approved data contracts and a cloud cost plan within available headroom. Service publication licensing is not a dependency. Permissions and runtime functionality still require verification.

Primary risks are RISK-01/03/09/10/11 in the [risk register](risk-register.md): unverified host/cloud path, uncapped expense, mistaken benchmark economics, synthetic source/tests sharing errors and dependence on one human. PO-specific risks include confusing finalization with full receipt, hiding lateness by overwriting promises, and treating simulated vendor patterns as observed behavior. Resolve definitions and expected cases before implementation; retain event evidence and make unsupported claims explicit.

## Effort, costs and delivery sequence

Use the [single-person estimate](portfolio/experiment-delivery-estimate.md): **5–12 prospective human hours**, plus unknown agent runtime and waits. A 2–6-week availability illustration assumes 2–4 human hours/week and is not a promised schedule. Ongoing light lab review is tentatively 0.5–1 human hour/month plus incident/change effort. Confirm capacity and re-estimate at Gate 4.

The B1 cloud component is provisionally **$2–12/month**, with a **$4–24 two-month costing allowance**. GCP is the primary incremental operating cost and optimization focus, against the manager's approximately **$30/month allowance**. If all $30 is available, the high estimate leaves $18 before other charges/reserve; verify existing usage and all required services before assigning headroom. Exclude the standing ChatGPT Pro subscription because it is incurred irrespective of this project. No Power BI publication/capacity purchase or optional paid tool/API is planned. Actual GCP charges and any necessary access remediation remain unmeasured. The allowance is a planning boundary, not a claim of free credits, an enforced cap or authorization to provision now.

At Gate 4, prioritize bounded query/refresh workload, small but meaningful test data, retention/cleanup, retry limits and attributable cloud usage; preserve required correctness and host checks. The fictional company benchmark of 10–18 engineering days/$8,000–14,400 labor remains separate in [prioritization](portfolio/prioritization.md). It is not charged against the GCP allowance.

After explicit Gate 3 approval: prepare architecture, feasible host/access route and operating envelope for Gate 4; then prepare detailed contracts, independent expected cases and implementation plan for Gate 5. A separately authorized, tightly bounded Gate 4 feasibility spike is possible under the governing prompt, but is not requested or authorized by this charter. After Gate 5, implement and verify the first end-to-end path before broad build-out; proceed through Gate 6 platform review, Gate 7 report-design approval, Gate 8 release approval, executed release validation and Gate 9 acceptance/handoff. Stop at each required decision.

The [Gate 3 conditions](gates/gate-3-project-selection.md#proposed-conditions) identify work permitted while access/cost questions remain open. Selection authorizes architecture preparation only. Material changes to users, scope, endpoint, success criteria or ownership reopen the affected decision.

## Later expansion

Only after an accepted MVP and a new decision, consider real source integration, agreed historical commitment analysis, multiuser delivery or supplier-performance evaluation. The higher-value cost-to-serve and replenishment ideas remain separate portfolio options; this charter does not authorize them.
