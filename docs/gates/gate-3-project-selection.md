# Gate 3 — Project selection

Package version: **v1.1 — approved unchanged**. Decision-record revision: **1.2**. Approved: **2026-09-20 America/Chicago**. Run: HDG-20260920-01. Gate status: **Approved with Conditions**. Decision owner: **Human Manager**. Selected project: **OPP-02**. Decision ID: **DEC-G3-001**.

The [submitted v1.1 package](gate-3-package-v1.1-submitted.md), SHA-256 `F30CD7292E864C801996B6205AC57D91B146872BDEE08B5E805CD0BD5187448D`, is preserved byte-for-byte, as is the [earlier v1.0 submission](gate-3-package-v1.0-submitted.md). Proposal wording below is retained as review history. The actual decision at the end approves OPP-02 and charter v1.1 without changes and adopts C3-01 through C3-04; those conditions remain open.

**Recommendation: Proceed with Conditions on OPP-02 — overdue purchase-order follow-up**, approving [draft charter v1.1](../project-charter.md) as the business baseline and authorizing architecture preparation through Gate 4. This remains a judgment between close alternatives, not a decisive numerical winner. Read the [opportunity-cost addendum](../portfolio/opportunity-cost-addendum.md) and [selection scorecard](../portfolio/selection-scorecard.md) before re-review. Selection does not authorize implementation, provisioning, spending, permission changes or release.

## Why this project, and why now

[Gate 2 / DEC-G2-001](gate-2-triage-review.md) approved OPP-01, OPP-02 and OPP-04 and all fictional comparison premises without changes. The [reproducible prioritization](../portfolio/prioritization.md) applies the unchanged Gate 1 framework. Base scores are **OPP-01 4.0, OPP-02 3.9, OPP-04 3.3**. Receivables and PO follow-up form a practical tie; uncertainty and sensitivity do not establish a unique winner.

OPP-02 has more hypothetical benefit headroom than OPP-01 ($19,200 versus $12,000/year under the accepted premises), with a similar small-lab footprint and data-synthesis burden. It offers useful event reconciliation, exception reporting and recovery work without OPP-04's two-source fulfillment chronology. The [public-data review](../portfolio/data-feasibility.md) found useful references but incomplete required histories; it supports synthesizing the missing company events for any survivor. Synthetic-data convenience does not increase company data-readiness scores.

The recommendation reflects the manager's approved concession toward lower implementation cost for this experiment. The original tie-break is fictional business-value headroom; it does not establish better learning or financial return for the experimenter. OPP-01 and OPP-02 share the same GCP component range and full-delivery-cycle coverage. OPP-01 has a somewhat smaller human allowance and is equally defensible when minimal review burden is the priority. Retaining OPP-02 expresses a preference for a bounded procurement lifecycle case; the new GCP clarification does not prove that preference superior.

## What we give up; alternatives

OPP-01 offers a slightly smaller human planning allowance and a marginally higher base score; choose it if minimum review burden dominates benefit headroom. OPP-04 has a higher accepted gross-value premise ($30,000/year) but greater lifecycle, data-generation and verification complexity. OPP-08 cost-to-serve, OPP-09 replenishment and other deferred opportunities retain greater possible business upside and would need a different first-run scope and evidence base.

Compared with OPP-01, choosing OPP-02 gives up a smaller review allowance and financial-allocation/aging coverage for changing-commitment/receipt/cancellation coverage; there is no modeled GCP saving. Compared with OPP-04, it gives up cross-system and cutoff/timezone coverage for lower burden. In the fictional base company case it forgoes $10,800/year of ship-by gross opportunity while avoiding about $15,333 of partial first-year ownership cost. These amounts are not the experimenter's cash opportunity cost. The addendum shows both alternatives separately rather than adding their benefits together.

**No-build/native-process improvement** remains the lower lab burden alternative. Gate 2 already stipulated a residual fictional gap after simpler improvements; no real ERP evaluation occurred. No-build produces no end-to-end delivery experiment evidence and incurs no new project implementation burden, but existing-system costs and residual business losses are unknown. If access costs, required human work or endpoint feasibility are unacceptable, prefer Additional Discovery, a revised endpoint or Do Not Proceed over forcing a build. Neither a small positive modeled company balance nor a weighted score establishes ROI.

## Effort, costs and MVP

The [single-person estimate](../portfolio/experiment-delivery-estimate.md) allows **5–12 human hours** for OPP-02 from selection through handoff, with agent runtime and external waits unknown. At an illustrative 2–4 hours/week of human availability, this suggests roughly 2–6 weeks of availability, subject to additional execution/waits; capacity has not been confirmed. The company's **10–18 engineering days / $8,000–14,400 labor benchmark** is not the user's expected bill or agent schedule.

The manager reports existing GCP with approximately **$30/month allowance**. The inherited OPP-02 component forecast is **$2–12/month**, or **$4–24 across two months**; if the allowance is wholly available, the monthly high endpoint leaves $18 before other consumption/charges/reserve. GCP is the main incremental operating cost and optimization focus. **Exclude standing ChatGPT Pro expense; the report will not be published, so no Power BI Service publication/capacity purchase is planned.** No optional paid tool/API is included. Actual all-services cloud cost and available allowance must be reconciled at Gate 4; account existence does not prove the execution path works. Future light lab ownership remains 0.5–1 human hour/month plus incidents/changes. No deployment or spending action is authorized by this clarification.

The MVP is a daily overdue-PO queue with remaining-quantity and commitment evidence, summary-to-line drilldown, explicit data freshness/provenance, deterministic source generation where needed, independent expected cases, rerun/correction/recovery checks and an operating/cleanup runbook. The proposed endpoint is a **deployed GCP/BigQuery lab backend connected to a locally verified Power BI Desktop report**. Hosted sharing, actual ERP/supplier integration, supplier outreach/writeback, predictive recommendations and enterprise availability are excluded.

The charter defines six measurable outcomes, three scripted buyer tasks, real owners, evidence limits and the delivery sequence. Synthetic records can demonstrate specified logic and observed platform behavior; they cannot demonstrate real extraction feasibility, supplier behavior, savings, adoption or untested scale. Generator/fixture work is part of implementation, and one human remains responsible for the required reviews and host checks.

## Proposed conditions

These conditions are proposed for this selection decision, not already imposed or closed. **No further prerequisite clarification is needed to decide Gate 3.** If accepted, architecture/documentation and read-only feasibility checks may proceed while the conditions remain open. Implementation and paid actions remain subject to their later explicit authorizations.

| ID | Requirement / owner | Due / affected work | Closure evidence and authority | Status |
|---|---|---|---|---|
| C3-01 | Verify the supported GCP/BigQuery identity, target project, billing visibility and delivery-tool route within the manager's existing GCP setup; agent investigates, manager handles required authentication | Before Gate 4 approval; blocks commitment to an unusable cloud design | Observed supported access path and remaining action list, reviewed by manager at Gate 4; no account-creation assumption, credential disclosure or self-granted permission | Open, proposed |
| C3-02 | Establish unpublished Power BI Desktop authoring, connection and host-verification path; manager is the proposed sole human verifier | Before Gate 4 approval; blocks commitment to an unverifiable report endpoint | Supported host/access and required human procedure confirmed; first full-path test after Gate 5 before broad build-out. No publication/license-capacity requirement; changed endpoint requires explicit amendment | Open, proposed |
| C3-03 | Reconcile GCP services/workload and other usage with approximately $30/month allowance; exclude standing Pro and publication costs, forecast human capacity and define resource/retry/retention/cleanup limits; agent prepares, manager approves | Before Gate 4 approval; blocks dependent paid/permission-changing actions | Concrete GCP-focused operating envelope, available headroom and control coverage; no assumed free credits or enforced cap. Identify any newly necessary purchase before adding it | Open, proposed |
| C3-04 | Bind public/synthetic provenance, material PO definitions and independent expected outcomes before implementation; agent prepares, manager reviews material choices | Before Gate 5 approval; blocks dependent implementation | Approved contracts and test expectations, with generator/transform not the sole oracle; source terms checked before any reuse | Open, proposed |

Current [capability evidence](../environment-readiness.md) verifies Git/Node and starting files, not working cloud/report access. These are unresolved conditions, not evidence of impossibility or reasons to reopen the already accepted fictional benefit premises. See the [risk register](../risk-register.md) for access, spend, synthetic-test bias and one-person availability risks.

## Baselines and decision requested

For re-review: **OPP-02 and charter v1.1**, including its problem/users, MVP/exclusions, owners, measurable outcomes, route/endpoint and C3-01 through C3-04. Approval would permit architecture preparation and a Gate 4 package only. OPP-01 remains an equally defensible alternative; the scorecard also explains what would justify OPP-04. The manager has deferred selection until reviewing the addendum and scorecard.

The [original Phase 3 evidence](../evidence/prioritization-validation.md) binds the preserved v1.0 submission; [follow-up validation](../evidence/selection-follow-up-validation.md) binds this revision and addenda. Prerequisites remain [Gate 1 framework v1.0](gate-1-portfolio-review.md) and [Gate 2 package v1.0](gate-2-triage-review.md). [DEC-SCOPE-001](../decisions/decision-log.md#dec-scope-001--clarify-lab-costs-and-request-selection-comparison) records the cost clarification, not a Gate 3 approval.

## Actual management decision — approved with conditions

| Actual decision field | Record |
|---|---|
| Outcome / selected project | **Proceed with Conditions — OPP-02 selected without changes to the recommended plan** |
| Approved charter / conditions | [Submitted charter v1.1](../project-charter-v1.1-submitted.md), SHA-256 `933247735BCB4DE9AC2DD3353BCA3F8F066101DE68B61247F6F151964B0FF957`; C3-01/02/03 due before Gate 4 approval and C3-04 before Gate 5 approval, all Open |
| Approver, date and source | Human Manager; 2026-09-20 America/Chicago. First instrumented record 2026-09-21T03:36:30Z; exact message timestamp and identifier unavailable. Faithful source below |
| Rationale | Work through non-trivial business/design decisions while avoiding cost without commensurate benefit; OPP-02 is more valuable than OPP-01 in the hypothetical scenario, despite their comparable experiment advantages/disadvantages |
| Authorized next phase | Phase 4 architecture, alternatives, integration/verification plan, execution envelope and Gate 4 package; read-only feasibility work within existing access |
| Next boundary | Gate 4 architecture review; selection does not authorize implementation, provisioning, spending or permission changes. No feasibility spike authorized |
| Reopening history | None; v1.0 to v1.1 was pre-decision revision, not a reopened approval |

Faithful decision excerpt:

> Move forward with OPP-02 with no changes to recommended plan. My decision came down to the fact that I wanted to work through non-trivial design and business choices, while protecting against costs without significant benefits (as was suggested may occur with OPP-04). While OPP-01 is noted to have no significant advantage or disadvantage to OPP-02, in this hypotehtical scenario, it is less valuable than OPP-02.

The decision accepts a useful level of domain complexity without requiring extra infrastructure complexity. It does not assert that OPP-04 necessarily lacks value, that OPP-02 has empirically superior learning outcomes, or that any fictional benefit has been realized. Preserve the unchanged framework and alternative analyses. C3 conditions are adopted, not closed by approval; the sole manager is now the approved business owner, host verifier and continuing resource owner under the charter.
