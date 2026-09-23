# Gate 1 - Opportunity portfolio and framework

Framework version: **v1.0 — approved unchanged**. Decision-record revision: **1.1** (approval appended). Prepared/approved date: **2026-09-20 America/Chicago**. Governing baseline: [master prompt v2.0](../../prompts/astra-analytics-delivery-master-prompt.md). Gate status: **Approved**. Decision owner: **Human Manager**. Decision ID: **DEC-G1-001**.

The [original submitted package](gate-1-framework-v1.0-submitted.md) is preserved byte-for-byte, SHA-256 `EB7F4A1ACBABB11E32D96D9523FA53D353C7572016BB3A94902791916D6DFB5D`. The proposal text below is retained as submitted; its proposed rules are now approved for this experiment. The actual decision and rationale at the end control progression. No weights, anchors, eligibility rules, or sensitivity methods changed.

## Decision requested

Approve **this v1.0 prioritization framework** for Phase 2 triage, or specify modifications. Approval authorizes evaluating the twelve candidates and submitting Gate 2 dispositions. It does **not** select a project or authorize numerical ranking, architecture, provisioning, spending, development, or release. Detailed scoring begins only after Gate 2 approves the surviving candidate set.

Recommendation: **approve the framework**, with the stated value floor, no-build comparison, uncertainty handling, and sensitivity checks. Viable alternatives are (a) modify the weights/anchors before triage or (b) request bounded discovery about the framework before approving it. A value-maximizing model would give more weight to scale of benefit; the proposed model instead expresses this experiment's explicit preference for low implementation and ownership burden once value is credible.

## Package and prerequisites

| Item | Revision / evidence | State |
|---|---|---|
| Execution authority | User instruction to begin execution after accepting review recommendations, 2026-09-20 | Authorizes preparation and Phase 1; does not approve Gate 1 |
| Governing instructions | Master prompt v2.0 | Baseline used for this package |
| Opportunity portfolio | [Portfolio v1.0](../portfolio/opportunity-portfolio.md) | 12 unranked candidates; disjoint 3/4/3/2 buckets |
| Scenario assumptions | [Assumptions](../assumptions.md) and portfolio estimation basis | Explicit hypotheses and estimates; no actual company-data claims |
| Lab capability | [Environment readiness](../environment-readiness.md) | Capability constraints retained; inclusion is not proof of access |
| Numeric scoring / formal triage | Not performed | Await the applicable gate approvals |

The compact comparison table is at the start of the portfolio; its candidate order follows the presentation buckets and is not a ranking. Prices used in scenario calculations are sourced there. Workload and labor inputs are reproducible assumptions, not estimates approved for expenditure.

## Preliminary observations only

- **Obviously weak as currently defined:** OPP-03's separate weekly sales scorecard lacks a distinct intervention beyond reporting already likely available in the ERP or workbook. Cheap implementation alone does not establish value. A concrete unserved decision could change that assessment.
- **Potentially valuable with disproportionate first-run burden:** OPP-08 requires contested cost allocations across systems; OPP-09 needs real forecast evidence absent from synthetic data; OPP-10 couples external-event latency with time-sensitive operations. OPP-11 and OPP-12 add workflow/application ownership and external dependencies outside the default delivery route. Their larger hypothetical benefits do not establish acceptable investment.
- **Especially compatible with the low-cost/low-complexity objective:** OPP-01 and OPP-02 have understandable daily decisions and concentrated source footprints; both still need a credible gap beyond native ERP features. OPP-04 offers a clear cross-system decision but greater integration effort. These are observations, not a preference order, an Advance disposition, or a selected project.

## Eligibility before scoring

At Phase 2 triage, examine each candidate against the following rules and preserve the explanation, evidence class, and uncertainty. Failure or uncertainty leads to a proposed Reject, Defer, or Needs Discovery disposition as appropriate; only the manager approves those dispositions at Gate 2.

1. **Actionable value floor:** identify an intended user/owner role, a recurring decision, an attainable action, a measurable effect, and the simpler alternative. Propose a conservative addressable gross benefit of at least **$10k/year**, or a manager-accepted nonmonetary benefit with comparable importance and a measurable threshold. A candidate scoring below **3 for business value** cannot win through cheapness. Unknown benefit is a discovery question, not a passing score. Dollar amounts are scenario hypotheses; the experiment can demonstrate the analytical behavior but cannot validate real business return.
2. **Incremental value:** compare no-build, native-system configuration, and a small process/workbook change. If one meets the decision need adequately at lower total burden, recommend it even if that means stopping or changing the experiment. Report improvement relative to that alternative, not relative to an artificially bad process.
3. **Delivery-route fit:** for this run the primary product must reasonably fit GCP/BigQuery/Power BI. Keep non-fitting candidates visible as future work; only an explicit Gate 3 change can authorize another route.
4. **Minimum feasibility:** a coherent source/proxy plan, no known prohibitive permission or security issue, and a plausible operating owner. Unresolved lab access or licenses remain explicit blockers/conditions; they are not silently converted into company data-readiness scores.
5. **Ownership economics:** before selection compare development and twelve-month maintenance/platform/license costs with plausible benefit ranges. A low-confidence positive return is not a verified ROI. Do not reject a risk-reduction benefit solely because it resists dollar conversion; require the manager's explicit value rationale instead.

The $10k floor is a **proposed scenario decision rule**, not a measured materiality threshold for Harborline. It screens out convenience-only products; weights and total-cost checks then distinguish qualifying candidates. If the manager changes it, revise and bind the approved framework version before triage.

## Scoring model proposed for Phase 3

All criteria use integer scores **1-5, with 5 favorable**. The weighted result is `sum(weight_percent x score) / 100`, reported to at most one decimal place on a 1-5 scale. Weights total **100%**; there is no hidden confidence multiplier. Uncertain inputs produce score intervals and explanatory notes, not invented point precision. No candidate scores have been assigned in this gate package.

| Criterion | Weight | What it measures; boundary against double counting |
|---|---:|---|
| Business value | 20% | Gross incremental addressable benefit and actionable decision, before costs; apply eligibility floor first |
| Implementation complexity | 20% | Structural/semantic/integration difficulty and need for novel techniques; exclude hours, vendor wait, and dollar price |
| Development cost | 15% | One-time professional labor, required purchases and development environment spend; exclude ongoing support and source-owner wait |
| Maintenance cost | 20% | Recurring engineering/support plus cloud/license ownership cost; exclude one-time build and separately disclosed business review effort |
| Time to value | 5% | Calendar time to the first usable decision, especially access, owner and procurement waits; distinguish this from person-days |
| Data readiness | 10% | Assumed company-source availability, joinability, definitions and quality; never the ease of generating synthetic data |
| Operational risk | 5% | Severity/reversibility of incorrect or unavailable outputs in the approved use; exclude routine support hours and external dependency availability |
| Dependency risk | 5% | Control and reliability of external teams, vendors and permissions; exclude intrinsic transformation complexity and priced maintenance |
| **Total** | **100%** | Complexity, development and maintenance jointly carry 55%; time is intentionally only 5% |

Score against the following anchors. Use the lower adjacent score where evidence sits between anchors; record a plausible range when evidence spans anchors. Unknown required information stays `Unknown` until bounded enough for a range. Money thresholds are proposed comparison conventions, not universal business valuation rules.

| Criterion | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Business value | No supported action or plausible incremental benefit | Narrow convenience; under $10k/year | Clear actionable need; $10k to under $50k/year | Repeated consequential decision; $50k to under $150k/year | Broad/consequential action; at least $150k/year |
| Complexity | Novel/highly coupled architecture or adaptive action in critical workflows | Several heterogeneous sources with difficult semantics/state or model lifecycle | Multiple well-defined sources and material lifecycle/semantic reconciliation | One source family plus simple references; modest rules and edge cases | One stable extract, few transparent transformations and no material integration |
| Development cost | Over $100k | Over $50k through $100k | Over $25k through $50k | Over $10k through $25k | Up to $10k |
| Maintenance cost | Over $8k/month or no credible ownership plan | Over $4k through $8k/month | Over $2k through $4k/month | Over $750 through $2k/month | Up to $750/month |
| Time to value | Over 24 calendar weeks | Over 12 through 24 weeks | Over 6 through 12 weeks | Over 3 through 6 weeks | Up to 3 weeks |
| Data readiness | Critical data or labels unavailable; proxy cannot support necessary claim | Major history/key/definition gaps with uncertain repair | Usable extracts plausible; material quality/definition work remains | Stable exports and keys described; few bounded gaps | Representative source evidence, agreed definitions and quality checks available |
| Operational risk | Wrong/unavailable result can cause high-impact action with weak fallback | Material service/financial exposure or short recovery window | Advisory use with consequential decisions and a defined human check | Reversible low-impact decisions with straightforward independent checks | Informational use with little plausible harm and a reliable fallback |
| Dependency risk | Core dependency unavailable/uncontrolled without alternative | Multiple uncertain external owners/vendors or procurement blockers | One material external dependency with a plausible fallback | Mostly controlled dependencies with one bounded confirmation | Controlled, available dependencies with accountable owners and tested fallback |

Business value's dollar anchor requires a believable mechanism and conservative assumptions; money alone does not establish the score. For a nonmonetary exception, propose an analogous anchor with measurable scale/severity and obtain the manager's agreement rather than self-assigning a high score. Company data is hypothetical here: **no score of 5 for data readiness can be justified by generated fixtures**, and any score based only on scenario assumptions is explicitly low confidence. Common lab capability constraints are assessed as feasibility conditions, with candidate-specific impacts explained.

## Confidence, sensitivity, and correlated criteria

Phase 3 must preserve inputs sufficient to reproduce the calculation: approved framework version, candidate scope/version, each low/base/high input, evidence class, score/range, assigned confidence, and the formula. Confidence is **High** for directly observed relevant evidence, **Medium** for limited evidence with a bounded uncertainty, and **Low** for scenario assumptions or untested dependencies. A synthetic result can be high-confidence technical evidence while remaining irrelevant to real customer benefit. Benefits in this portfolio start Low.

Do not average incompatible alternatives into one score. Keep major scope variants separate and return a materially changed opportunity to the affected gate. If the decisive criterion is Unknown, propose bounded discovery rather than fill in a neutral 3.

Before recommending selection, run these checks on only the Gate-2-approved survivors:

1. **Weight sensitivity:** change each weight one at a time by plus/minus 5 percentage points, never below zero, and proportionally rescale the others to total 100%. Also compare these explicit full scenarios in criterion order from the table: ownership-first `(15,20,15,30,5,5,5,5)` and value-first `(35,15,10,15,5,10,5,5)`. Each totals 100%. Explain changes in the preferred set, not just decimal movement.
2. **Estimate sensitivity:** use low/base/high source and workload assumptions and development/maintenance ranges; score both ends of value and cost ranges. Do not assume all optimistic assumptions co-occur. Show a plausible adverse case such as lower benefit plus higher source-remediation cost, and identify which uncertainty could reverse the recommendation.
3. **Correlation audit:** attach one causal explanation to each major disadvantage. Complexity captures structural difficulty, development cost captures resources needed, and time captures calendar delay. When one driver affects several scores, disclose that dependency; never describe those as independent evidence. Low time weight reduces, but does not eliminate, this issue.
4. **Redundancy sensitivity:** rerun with the implementation-complexity weight set to zero and all other weights normalized; separately rerun with development cost zero; separately with time zero. Record whether the preferred set changes. If it does, explain the manager's choice between low technical difficulty, low cash/effort, and early use instead of hiding the correlated effect.
5. **No-build and efficient-frontier check:** compare credible incremental value with total burden and identify dominated options. Keep no-build/native configuration as a reference alternative outside the twelve initiative count; do not give an unsupported zero-cost/no-risk score. If options are within 0.2 weighted points, overlap materially under uncertainty, or switch under reasonable assumptions, treat them as a practical tie and explain the deciding evidence/tradeoff.

An apparently winning weighted score is an aid to judgment. Eligibility failures, material unresolved access/cost items, a superior existing-system option, or uncertainty that changes the conclusion can justify Additional Discovery or Do Not Proceed at Gate 3.

## Open questions and timing — submission context

There are **no hidden prerequisite questions** needed to prepare this portfolio or framework. The manager's current action is the explicit Gate 1 framework decision. Named business/platform owners, a selected project's benefit hypothesis, a lab deployment versus undeployed endpoint, licenses/access, and spending limits remain later decision-package inputs; they do not need to be invented or answered now. Material uncertainty discovered during triage will be presented at Gate 2 with a bounded question, owner role, and return point.

## Actual management decision — approved

| Field | Record |
|---|---|
| Final decision | **Approved — framework v1.0 unchanged** |
| Approver | Human Manager (user in this conversation) |
| Decision date / recorded time | 2026-09-20 America/Chicago; first instrumented recording 2026-09-21T01:02:44Z. Exact message timestamp is not exposed. |
| Decision source | User's explicit reply to the v1.0 framework approval request; faithful excerpt below. No message ID is exposed. |
| Approved artifact revisions | Submitted framework v1.0, SHA-256 `EB7F4A1ACBABB11E32D96D9523FA53D353C7572016BB3A94902791916D6DFB5D`; original package linked above. Portfolio v1.0 is the candidate input, not an approved survivor set. |
| Conditions / owner / evidence / due point / blocking status | No new blocking conditions imposed. The experiment-specific value/cost tradeoff is an explicit decision rationale; it does not waive the credible-value floor or change weights. |
| Authorized next work after decision | Phase 2 triage of all twelve candidates and preparation of Gate 2; stop before numerical scoring/ranking until the survivor set is approved. |
| Reopening history | None |

Faithful decision excerpt:

> v1.0 framework approved. Be sure to document the approval. The value-maximizing model is recognized as having more real-world value. But the scope of this experiment makes the concessiosn for lower implementation cost acceptable.

**Management rationale:** the manager recognizes the value-maximizing model as having more real-world value, while accepting the concession toward lower implementation cost for this experiment's bounded scope. Apply the approved weights as an experiment preference; do not generalize this preference into a claim that lower-cost initiatives are inherently better real-world investments. Preserve higher-value deferred opportunities and show the opportunity cost and approved value-first sensitivity at selection. This is a management judgment, not an empirically established comparison of outcomes.

The decision is indexed in the [decision log](../decisions/decision-log.md) and reflected in [project state](../project-state.md). Approval does not select a project, authorize development/spend, or approve any later gate.
