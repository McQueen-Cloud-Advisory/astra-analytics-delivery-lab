# Prioritization

Version: **v1.1**. Run: HDG-20260920-01. Updated: **2026-09-20 America/Chicago**. Status: **Phase 3 analysis; Gate 3 selection pending re-review**. Authority: [Gate 1 framework v1.0 / DEC-G1-001](../gates/gate-1-portfolio-review.md) and [Gate 2 package v1.0 / DEC-G2-001](../gates/gate-2-triage-review.md). Only approved survivors **OPP-01, OPP-02 and OPP-04** are scored. [Submitted v1.0](prioritization-v1.0-submitted.md) is retained; the scoring inputs, results and approved weights are unchanged.

**For the selection rationale and tradeoffs, start with the [selection scorecard](selection-scorecard.md) and [opportunity-cost addendum](opportunity-cost-addendum.md).** They separate experimental learning, human effort and GCP headroom from fictional company benefits. A criterion scorecard already existed below; the new scorecard brings the actual experiment comparison and reasons for the recommendation together.

## Recommendation and its limits

**OPP-01 and OPP-02 are a practical tie. Recommend OPP-02 for the manager's consideration**, conditional on a feasible workload for the experiment's **one human participant**, usable platform access, and an affordable verification path. Its assumed residual business-value opportunity has more room above the approved floor, while its lab data burden is comparable to OPP-01. This is an explicit judgment within a tie, not a unique numerical winner or permission to build. OPP-01 remains a reasonable alternative if PO lifecycle semantics or human verification make OPP-02 materially harder.

The approved company-comparison model gives **4.0 / 3.9 / 3.3** respectively. Its broad uncertainty intervals also overlap OPP-04; under the framework's overlap rule, a robust ordering among all three is **not established**. OPP-04 offers more hypothetical business value and remains viable. Selecting OPP-02 would express the manager's accepted preference for lower implementation burden in this particular experiment, not a general claim that it creates the greatest real-world value.

## Separate comparison estimates from actual execution

The framework's labor-dollar anchors describe a **fictional professional-delivery benchmark**. They are retained unchanged so the approved model can be reproduced. Their scores are provisional where purchases, licenses and access costs are unknown; they are **not scores of measured lab cost or feasibility**. The experiment has one human manager/operator, supported by agents. Fictional buyers, finance analysts, source owners and administrators are scenario roles, not additional available participants.

The manager now reports existing GCP with approximately **$30/month allowance**, confirms **no report publication**, and excludes the standing **ChatGPT Pro subscription** from incremental project costs. GCP consumption is the primary optimization concern. Both OPP-01 and OPP-02 have the same inherited $2–12/month component estimate; this clarification does not make either one the cheaper cloud choice. Their human-effort ranges overlap, with OPP-01 somewhat smaller. No superior experimental learning value for OPP-02 has been demonstrated; its original fictional-value tie-break is not a monetary benefit to the experimenter.

Observed human effort, agent runtime, actual GCP charges, installation/authentication work, Power BI Desktop verification and deployment permissions remain **Unknown** unless separately evidenced. The [experiment delivery estimate](experiment-delivery-estimate.md) supplies updated cost boundaries and separate, low-confidence one-person effort forecasts. No neutral score of 3 substitutes for unresolved actual feasibility. Professional days multiplied by $100/hour are neither the user's cash expense nor an estimate of agent runtime; assumed owner-wait weeks below are not the user's schedule. The calculation JSON remains the unchanged v1.0 company-comparison input; its then-unresolved lab-cost notes are superseded for current planning by this clarification and the v1.1 estimate.

The [data-feasibility comparison](data-feasibility.md) explains public-source suitability and the required synthetic gaps. All three need invented company transactions/relationships to demonstrate their exact workflow. Those fixtures can support repeatable technical checks; they cannot establish real source readiness, operational adoption, work saved, prevention effectiveness, or ROI. Company data-readiness scores below therefore do not improve because synthesis is easy. The current [environment evidence](../environment-readiness.md) remains authoritative for actual capability, including what has not been verified.

## Reproducible inputs and anchors

The [machine-readable inputs](prioritization-inputs.json) preserve every low/base/high value, score rationale, confidence classification, profile and formula input. The [calculation script](../../scripts/calculate-prioritization.mjs) uses only Node's standard library; [retained results](../evidence/prioritization-results.json) include input/script/source hashes, all sensitivity cases, and arithmetic checks. All candidate estimates and qualitative anchors have **Low confidence**: they are bounded fictional assumptions, not observations. The local arithmetic itself is reproducible technical evidence with that narrow scope.

Base benefit comes from the explicitly adopted SCN-01/02/04 premises. Low/high benefits retain the original [portfolio](opportunity-portfolio.md) bands as sensitivity hypotheses; they do not amend the adopted premises or assert that upside will occur. Actual realized benefit may be zero. Other base numerical inputs are explicitly chosen midpoints, not measured central estimates.

| Input, shown low / base / high | OPP-01 | OPP-02 | OPP-04 |
|---|---|---|---|
| Gross addressable benefit USD/year | 10,000 / **12,000** / 40,000 | 15,000 / **19,200** / 60,000 | 30,000 / **30,000** / 100,000 |
| Professional engineering days | 8 / 11.5 / 15 | 10 / 14 / 18 | 18 / 24 / 30 |
| Support hours/month | 2 / 3 / 4 | 3 / 4.5 / 6 | 6 / 9 / 12 |
| Assumed source-owner/access wait weeks, additional to professional build time | 0.4 / 2 / 5 | 0.5 / 2 / 5 | 1 / 4 / 8 |
| Resulting company benchmark calendar weeks | 2.0 / 4.3 / 8.0 | 2.5 / 4.8 / 8.6 | 4.6 / 8.8 / 14.0 |
| Company source rows, millions | 0.5 / 1.25 / 2.0 | 0.3 / 0.9 / 1.5 | 8 / 14 / 20 |
| Extracted source GiB | 1 / 3 / 5 | 0.5 / 1.75 / 3 | 15 / 32.5 / 50 |
| Cloud workload profile | B1 | B1 | B2 |

The source ranges describe the fictional company. They are **not the required lab workload**. A small fixture is sufficient for initial lab correctness checks; later scale profiles require a separately approved envelope. Source bytes do not determine query bytes automatically.

For B1, company storage/query/other allowance low/base/high are **5/12.5/20 GiB**, **1/3/5 TiB/month**, **$10/25/40 per month**. Lab inputs are **1/3/5 GiB**, **0.1/0.3/0.5 TiB/month**, **$2/5/8 per month**. For B2, company inputs are **50/150/250 GiB**, **5/17.5/30 TiB/month**, **$30/90/150 per month**; lab inputs are **5/12.5/20 GiB**, **0.5/1.25/2 TiB/month**, **$5/12.5/20 per month**. These inherit the portfolio's dated component model, not fresh quotes or spending limits.

Formulae:

```text
monthly analytics component = 6.25 × query TiB + 0.023 × stored GiB + allowance USD
partial development = professional days × 8 hours × $100 + 2 months × lab component
partial monthly ownership = support hours × $100 + company component
benchmark calendar weeks = professional days / 5 + assumed source-owner wait weeks
weighted score = Σ(approved weight percent × integer criterion score) / 100
```

Required purchases, licenses, source access and other excluded additions remain unknown. Their absence from these partial sums is **not an assumption that they cost zero**. The two-month development cloud allowance is the existing comparison convention; it does not establish duration or actual lab spend. The input JSON retains exact values for calculation; displayed scores use one decimal and monetary results are rounded estimates.

## Criterion scores

All scores use the approved **1–5 favorable-direction anchors**. Confidence for every cell is **Low**, reflecting a scenario assumption or planning estimate. The ranges in the input JSON describe bounded hypothetical alternatives; an actually decisive unknown remains a separate condition.

| Criterion | Weight | OPP-01 | OPP-02 | OPP-04 | Base anchor and reason |
|---|---:|---:|---:|---:|---|
| Business value | 20% | 3 | 3 | 3 | Each adopted premise describes an action and $10k–under $50k gross addressable benefit; this broad anchor masks their dollar differences |
| Implementation complexity | 20% | 4 | 4 | 3 | 01/02 use one ERP family plus owner references and bounded rules; 04 requires material OMS/WMS lifecycle reconciliation |
| Development cost | 15% | 5 | 4 | 4 | Partial base costs about $9.2k / $11.2k / $19.2k cross the approved $10k boundary; excluded costs can change the score |
| Maintenance cost | 20% | 5 | 5 | 4 | Partial base ownership about $344 / $494 / $1,103 monthly; 04 exceeds the $750 anchor |
| Time to value | 5% | 4 | 4 | 3 | Assumed 4.3 / 4.8 / 8.8 calendar weeks for company delivery; unobserved waits are scenario inputs |
| Data readiness | 10% | 3 | 3 | 3 | Usable company extracts are plausible but material definitions/quality work remains; no representative evidence supports 5 |
| Operational risk | 5% | 3 | 4 | 3 | Collections and expedites are consequential even with review; a checked PO follow-up queue has more reversible actions and native-line fallback |
| Dependency risk | 5% | 3 | 3 | 2 | 01/02 assume a material ERP/export-owner dependency with a workbook/native fallback; 04 has multiple uncertain OMS/WMS owners |
| **Weighted result** | **100%** | **4.0** | **3.9** | **3.3** | **01/02 practical tie; actual lab feasibility remains unscored and conditional** |

The operational-risk distinction depends on retaining human review and excluding automated purchasing, supplier scoring, collections and dispatch. A change in those uses requires reconsideration. The company-source anchors are explicit assumptions about possible exports, keys and owner confirmation; they are not claims that these have been observed at a nonexistent company.

## Ownership economics and alternatives

These are **partial fictional company estimates** using the same inputs as the scores. Residual means gross addressable value minus modeled development and twelve months of ownership. It is not cash savings, validated ROI, an approved budget, or the experimenter's cash bill.

| Base benchmark USD | OPP-01 | OPP-02 | OPP-04 |
|---|---:|---:|---:|
| Gross addressable benefit/year | 12,000 | 19,200 | 30,000 |
| Partial development | 9,214 | 11,214 | 19,241 |
| Partial monthly ownership | 344 | 494 | 1,103 |
| Partial first-year ownership, including development | 13,342 | 17,142 | 32,475 |
| Residual before unknown additions | **−1,342** | **+2,058** | **−2,475** |

Costs use unrounded inputs before display rounding. OPP-02's modest positive residual can disappear with roughly **$2.1k of extra first-year cost**, including licenses, access or remediation. It does not establish a robust investment case. OPP-01 and OPP-04 do not cover even their partial base first-year ownership at the adopted gross benefits; that fact remains visible despite their acceptable value-floor scores.

The cost anchors are also fragile in places. Roughly **$0.8k** of excluded one-time cost would move OPP-01 out of development score 5; roughly **$0.3k/month** of additional recurring cost would move OPP-02 out of maintenance score 5. Unknown extras must be resolved if they determine the choice. High benchmark cost does not itself prohibit a modest single-person lab demonstration; actual experiment cash/effort must be judged separately.

| Reference alternative | Incremental benefit and burden | Implication |
|---|---|---|
| Continue native ERP/WMS queues and the improved workbook/process | Existing operating costs and residual reconciliation work remain; incremental configuration effort and adequacy are unknown, not zero-cost/zero-risk | If these meet the decision need, prefer them; a dashboard alone is not value |
| OPP-01 | Lowest base modeled ownership, with only $12k gross value and the smallest floor buffer | Attractive if verified simplicity outweighs the thinner scenario benefit |
| OPP-02 | More assumed value than 01 at greater modeled ownership, with comparable source-family scope | A reasonable tie-break choice for this experiment, conditional on actual feasibility |
| OPP-04 | Highest adopted and upside benefit, with additional source coordination, chronology and ownership | A reasonable choice if the manager values the richer cross-system demonstration enough to accept its burden |

The adopted SCNs assume the simpler alternatives have already left a residual gap; no real ERP/workbook comparison was performed. In a real company that assumption must be challenged before investment. None of the three strictly dominates another on base gross benefit versus ownership cost: each higher-value option costs more. Higher residual benefit alone is not Pareto dominance over cost, risk and effort. No-build is retained outside the twelve-candidate count and is not assigned fabricated numerical scores.

## Sensitivity and robustness

Each weight is independently moved by ±5 percentage points; the others are rescaled proportionally to total 100%. The calculation retains all **16** cases. All keep 01/02 within the approved **0.2-point** practical-tie threshold, while 04 remains outside that base-input preferred pair. Arithmetic comparisons use unrounded values; displayed equal scores need not have identical underlying totals.

| Weight scenario, base inputs | OPP-01 | OPP-02 | OPP-04 | Meaning |
|---|---:|---:|---:|---|
| Approved framework | 4.0 | 3.9 | 3.3 | 01/02 practical tie |
| Ownership-first: 15/20/15/30/5/5/5/5 | 4.2 | 4.1 | 3.4 | Pair unchanged |
| Value-first: 35/15/10/15/5/10/5/5 | 3.7 | 3.7 | 3.2 | Pair unchanged; all base benefits occupy the same coarse value anchor |
| Complexity weight zero; others normalized | 3.9 | 3.8 | 3.4 | Pair unchanged |
| Development-cost weight zero; others normalized | 3.8 | 3.8 | 3.2 | Arithmetic lead changes to 02; pair remains tied |
| Time weight zero; others normalized | 3.9 | 3.8 | 3.3 | Pair unchanged |

The value-first result is limited to the approved survivor set. It does not refute the manager's judgment about real-world value maximization or rank the higher-value deferred opportunities. The value anchor treats $12k, $19.2k and $30k alike; underlying dollars and uncertainty remain material judgment inputs rather than reasons to silently change approved weights.

| Input case | OPP-01 | OPP-02 | OPP-04 | Interpretation |
|---|---:|---:|---:|---|
| Low inputs: smaller benefit/workload, less difficult assumed sources | 4.2 | 4.2 | 3.6 | 02 arithmetic lead; 01/02 tied |
| Base inputs | 4.0 | 3.9 | 3.3 | 01 arithmetic lead; 01/02 tied |
| High inputs: larger benefit/workload, more difficult assumed sources | 3.4 | 3.6 | 3.1 | 02 arithmetic lead; 01/02 tied |
| Independent score bounds across those inputs | 3.4–4.2 | 3.4–4.4 | 2.9–3.8 | All overlap; these are bounds, not joint forecasts or probabilities |

The low/high profiles pair smaller/larger opportunity with lower/higher implementation burden; they do not assume every favorable fact co-occurs. Separately, **26 one-criterion endpoint cases** vary bounded inputs while all others stay at base. If only OPP-02's complexity worsens from 4 to 3 because lifecycle semantics prove harder, OPP-01 becomes the sole candidate within 0.2 of the lead. A recommendation for 02 therefore remains sensitive to its data/semantic burden. Broader bound overlap means 04 cannot be declared decisively inferior: favorable 04 assumptions and adverse 01/02 assumptions can change the conclusion.

The adverse case explicitly halves **addressable opportunity**, rather than confusing the gross-value eligibility floor with a realized-savings target. It also raises development/support effort for source remediation. This is a stress test of the adopted premises, not a new approved baseline.

| Adverse input/result | OPP-01 | OPP-02 | OPP-04 |
|---|---:|---:|---:|
| Addressable benefit USD/year | 6,000 | 9,600 | 15,000 |
| Professional days / support hours per month | 18.5 / 6 | 24 / 9 | 45 / 18 |
| Raw comparison score | 3.2 | 3.0 | 2.6 |
| Passes $10k gross-value floor | **No** | **No** | Yes |
| First-year residual before unknown additions, USD | −16,883 | −21,283 | −46,785 |

OPP-04 being the only floor-eligible candidate in that case is **not a recommendation to select it**. Discovery, revising the affected premise, or no-build is preferable to forcing a winner with poor economics. At base, addressable benefit can fall about **16.7% / 47.9% / 66.7%** respectively before reaching the floor; this is OPP-02's advantage over 01, not proof of realized savings.

## Correlation audit and deciding evidence

| Underlying driver | Criteria affected; distinct meaning | Guard against overcounting |
|---|---|---|
| Event lifecycle and source reconciliation | Complexity = structural difficulty; development = resources; data readiness = existing company definitions/quality; maintenance = repeated support | These are related consequences of one driver, not independent corroborating facts; use the zero-complexity and zero-development checks |
| Export/owner and definition availability | Dependency = control/availability; time = calendar wait; readiness = suitability of available data | Hypothetical wait assumptions are separate from effort; zero-time check does not close real access conditions |
| Incorrect exception interpretation | Operational risk = consequences/reversibility; maintenance = routine support resources | Human checking reduces consequences only if actually included; avoid counting every support hour again as risk |
| Workload size | Modeled query/storage plus possible remediation/support | The company and lab workload profiles are separate; generating millions of rows is not necessary to establish simple correctness |

For [Gate 3](../gates/gate-3-project-selection.md), the deciding considerations are the **single person's ability to complete setup and verification**, the desired domain/learning coverage, **remaining GCP allowance and actual service consumption**, and whether OPP-02's source contracts can stay bounded. Standing ChatGPT Pro and Power BI publication costs are excluded from the actual lab comparison. Synthetic data removes dependence on unavailable customer extracts while adding generator design and independent expected-result work. It does not remove platform feasibility or human verification requirements. If those conditions cannot be bounded, recommend **Additional Discovery**. The manager makes the selection and charter decision; architecture starts only after that approval.

## Reproduction and verification scope

```powershell
node scripts/calculate-prioritization.mjs --write
node scripts/calculate-prioritization.mjs --check
node scripts/validate-docs.mjs
```

The script checks the approved weights, survivor IDs, SCN base benefits, anchor boundaries, normalization, valid integer scores and deterministic retained results. These checks validate calculation consistency only. No source-system, BigQuery, Power BI, CI, deployment, business-benefit or actual-spend test is represented by this record.
