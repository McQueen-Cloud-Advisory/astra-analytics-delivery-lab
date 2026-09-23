# Single-person delivery estimate

Version: **v1.1**. Updated: **2026-09-20 America/Chicago**. Incorporates [DEC-SCOPE-001](../decisions/decision-log.md#dec-scope-001--clarify-lab-costs-and-request-selection-comparison): existing GCP with approximately $30/month allowance, no Power BI publication, standing ChatGPT Pro subscription excluded, GCP optimization the primary cost concern. [Prior v1.0 submission](experiment-delivery-estimate-v1.0-submitted.md) is retained. Forecasts remain Low confidence; currency is USD. No spending authority is created by this estimate.

**For OPP-02, allow approximately 5–12 hours of the manager's time from Gate 3 through handoff, plus agent execution and waiting whose duration is unknown.** This is a task-based planning allowance, not an hourly labor bill, guaranteed maximum or claim that a conventional 10–18-day project takes the agent a particular number of hours. One human fills every real management, authentication, verification and ownership role.

## Human workload

| Remaining human task | OPP-01 | OPP-02 | OPP-04 |
|---|---:|---:|---:|
| Access, authentication and approved setup actions | 0.5–2 h | 0.5–2 h | 0.5–2 h |
| Gate reviews, material semantics and independent expected-case spot-checks | 2–4 h | 2.5–4.5 h | 3–5 h |
| Power BI host connection, rendering, interaction, refresh and release checks | 1–2 h | 1–2.5 h | 1.5–3 h |
| Human-only troubleshooting allowance | 0.5–1.5 h | 0.5–2 h | 1–3 h |
| Handoff, continuing ownership and authorized cleanup actions | 0.5–1 h | 0.5–1 h | 0.5–1 h |
| **Total prospective human time** | **4.5–10.5 h** | **5–12 h** | **6.5–14 h** |

Assumptions: existing supported hardware can run the chosen report host; usable accounts can be established without enterprise procurement; the agent prepares concise decisions, artifacts and verification procedures. No extra business analyst, administrator or independent human tester is assumed. Multiple agent reviewers remain part of one assisted workflow. Severe account/tooling failures could exceed these allowances and require re-estimation rather than hidden extra human work.

Agent work includes source research, synthetic generator and independent fixture preparation, implementation, tests, deployment instructions, report definitions, evidence and documentation. Agent runtime, retry effort and approval waiting are **Unknown**. The standing ChatGPT Pro subscription is excluded from incremental project cost; no separate paid agent/API purchase is assumed. Do not derive runtime from professional engineering days or an assumed AI speed multiplier. For scheduling illustration only, 5–12 human hours at an assumed 2–4 hours/week suggests roughly 2–6 weeks of human availability; the manager has not supplied that availability, and agent execution or external waits can extend elapsed delivery. Reforecast at Gate 4. No committed completion date is proposed.

For continued OPP-02 demonstration ownership, initially allow **0.5–1 human hour/month** for reviewing usage, freshness and an occasional rerun, plus unbounded incident/change effort until observed. This is a low-confidence lab estimate with no service-level promise. Retaining a runnable artifact while shutting down paid resources is an alternative to continued operation; the choice and cleanup authority belong in the approved operating envelope.

## Costs: benchmark, prospective cash, measured cash

The [original portfolio](opportunity-portfolio.md) uses $100/hour and eight-hour professional days for hypothetical company comparison. OPP-02's 10–18 days therefore means **$8,000–14,400 benchmark labor**, not a bill for this experiment. Its company support assumption is 3–6 engineering hours/month. The [prioritization](prioritization.md) keeps those anchors for the unchanged framework and makes missing cost items explicit.

| Actual experiment component | Selection-stage forecast | What remains unresolved |
|---|---|---|
| Cloud analytics component, OPP-01 or OPP-02 | Existing B1 small-lab allowance **$2–12/month**, or **$4–24 for a common two-month costing window** | Reused scenario workload estimate, not a new quote, bill, cap or promised runtime; actual services, region, scan frequency, storage, transfers and free allowances require Gate 4 verification |
| Cloud analytics component, OPP-04 | Existing B2 allowance **$8–33/month**, or **$16–66 for two months** | Higher simulated lifecycle/workload; same exclusions and uncertainty |
| Standing ChatGPT Pro subscription | **Excluded from incremental project cost** by the manager; incurred irrespective of this project | This is an accounting boundary, not a claim that the subscription is free. No allocation of its standing fee to this project |
| Power BI publication/service capacity | **$0 planned purchase for publication**; report will remain unpublished | Service publishing, sharing and capacity are out of scope. Desktop authoring, connection, refresh and host verification still need a supported path |
| Optional APIs, CI purchases or other paid tools | **None assumed in the baseline** | Any newly required incremental purchase must be identified before changing the baseline; do not retain an unexplained generic subscription charge |
| Human labor | **No wage or cash purchase inferred**; use the workload estimate above | Personal opportunity cost exists but no rate is provided; actual minutes are logged only when reported/measured |
| Hardware, access remediation, incident or scope expansion | **Unknown; excluded from component allowances** | Reassess if the existing host or account route is unsuitable; do not silently buy a substitute |
| **Baseline incremental operating cash / actual charges to date** | **GCP-led: OPP-02 component forecast $2–12/month; actual attributable charges Unknown** | All-services cloud total still needs validation; hardware/access remediation is a contingency, not an invented recurring charge |

B1/B2 originate in the portfolio's assumed storage/query/ancillary-cost formula. The manager has existing GCP and approximately **$30/month allowance**. OPP-02's $2–12/month estimate consumes about **7–40%** of that allowance if wholly available; its high endpoint leaves **$18 before other usage, omitted charges and a reserve**. Existing consumption and whether the allowance is shared have not been verified, so conservatively account for other usage before allocating it. The allowance is not assumed to be free credits or an enforced cap. The two-month $4–24 component estimate is not an all-inclusive project price or a separate monthly allowance.

GCP consumption is the principal incremental operating cost and optimization focus. Do not allocate the standing ChatGPT Pro fee or publication licenses to it. At Gate 4, reconcile actual remaining GCP headroom, prices, workload and all required services; propose resource, query, retry, storage-retention and cleanup limits. Avoid spending human time on elaborate controls with negligible savings. See the [opportunity-cost addendum](opportunity-cost-addendum.md#where-cost-optimization-should-focus-after-selection) for requirements; no architecture or resource is selected here.

## Data work is part of implementation

The [public-source review](data-feasibility.md) found useful references but incomplete histories for all survivors. Plan to generate unavailable company events; do not require private Harborline records or burden the manager with obtaining nonexistent company exports. If a suitable public source is found later, document fitness, terms, pinned version and transformations before using it.

For OPP-02, budget agent work for coherent PO lines, receipt/cancellation events, changing promises and buyer references, along with duplicates, corrections, missing references and rejected inputs. Use a small independently calculated fixture before a larger seeded demonstration profile. The manager reviews material definitions and selected expected outcomes; they are not expected to hand-create the whole dataset. No generator has been implemented or dataset imported at selection.

Synthetic data adds generation, provenance, adversarial-case and validation work. It removes the need for private records but cannot establish real extraction feasibility, supplier distributions, adoption, savings or company-scale performance. Publicly distributed simulated data is still synthetic. The approved SCN-02 benefit remains a hypothetical comparison premise, never a result derived from generated records.

## Re-estimation and decision triggers

Gate 4 must resolve a supported GCP/BigQuery route, a Power BI host/verifier path and the actual incremental cost envelope. Gate 5 must bind the source/KPI contracts, independent expected cases and implementation sequence. If required host checks cannot be performed, mandatory costs are unacceptable, or scope exceeds one person's capacity, return to the affected gate for a smaller endpoint, additional discovery or stop. A forecast overrun is evidence to review, not automatic permission to expand effort or spend.
