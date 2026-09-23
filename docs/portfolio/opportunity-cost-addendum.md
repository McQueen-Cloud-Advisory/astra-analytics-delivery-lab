# Opportunity cost of the proposed PO follow-up project

Version: **v1.0**. Prepared: **2026-09-20 America/Chicago**. Follow-up to Gate 3; **OPP-02 is recommended, not selected**. Read alongside the [selection scorecard](selection-scorecard.md) and [updated charter v1.1](../project-charter.md). The manager requested this comparison before re-review and clarified the actual cost boundary in [DEC-SCOPE-001](../decisions/decision-log.md#dec-scope-001--clarify-lab-costs-and-request-selection-comparison).

**Choosing OPP-02 gives up a somewhat smaller receivables experiment and a richer, more demanding ship-by experiment.** It does not sacrifice any established real-company savings: all business values are fictional premises. OPP-01 and OPP-02 have the same estimated GCP component, overlapping human-effort ranges and comparable coverage of the full delivery process. There is no demonstrated learning advantage that makes OPP-02 objectively better than OPP-01.

Opportunity cost means the value of the best alternative forgone. It is not the sum of both rejected projects' benefits, and it is not simply their development cost. Because the experiment's learning value and the manager's time have no agreed dollar valuation, a single actual dollar opportunity cost cannot be established. The following comparisons expose what would be exchanged.

## What the experiment gains and gives up

| Choosing OPP-02 instead of… | What we give up | What we gain or avoid | Practical interpretation |
|---|---|---|---|
| **OPP-01: receivables follow-up** | Financial allocation, credit/payment, exact-balance and aging examples; the smaller **4.5–10.5 h** human allowance | Practice with changing PO commitments, partial receipts and cancellations; greater benefit headroom only in the fictional company scenario | PO's **5–12 h** allowance has endpoints 0.5 and 1.5 h higher. These overlapping estimates do not establish the actual extra time. Both use **$2–12/month** GCP components; there is no estimated cloud saving from choosing either one |
| **OPP-04: ship-by exceptions** | Cross-source identity reconciliation, split shipments, event ordering and cutoff/timezone coverage; a larger fictional gross opportunity | A smaller generator, semantic-review and verification burden; lower expected cloud consumption | PO's human allowance endpoints are 1.5 and 2 h lower than ship-by's **6.5–14 h**. Its cloud component is lower by $6 at the low endpoint and $21 at the high endpoint; neither paired difference is a measured saving |

All three can exercise requirements, source contracts, independent expected cases, reruns/corrections, BigQuery-to-Desktop behavior, governed release and cleanup. OPP-04 tests a broader simulated integration problem, but two generated systems cannot establish actual OMS/WMS access, mismatch rates or integration friction. More features or test cases are not automatically more useful experimental evidence.

The real tradeoff is allocating one person's attention and GCP capacity to one case. A more elaborate case could displace time for verification and evaluation; an overly simple case could omit the kinds of reconciliation the experiment should test. OPP-02 is a reasonable bounded case between these extremes, while OPP-01 could yield equally useful evidence with less domain review. These are judgments, not measured outcomes.

## Fictional company comparison — separate from your costs

The [approved-model calculations](prioritization.md#ownership-economics-and-alternatives) preserve professional labor and modeled cloud costs. The table compares **the alternative minus OPP-02**, using unrounded inputs before rounding displayed differences. Positive cost means the alternative costs more. Benefits are annual; partial first-year cost includes development plus twelve months of ownership. Unmodeled company licenses/access remain excluded.

| Base scenario difference versus OPP-02 | OPP-01 instead | OPP-04 instead |
|---|---:|---:|
| Gross addressable benefit/year | **−$7,200** | **+$10,800** |
| Professional development cost plus development cloud | −$2,000 | +$8,027 |
| Monthly support plus company cloud | −$150 | +$609 |
| Partial first-year ownership cost | **−$3,800** | **+$15,333** |
| First-year residual: gross benefit less partial ownership | **−$3,400** | **−$4,533** |

Thus choosing PO over receivables gives up $3,800 of hypothetical first-year cost reduction to pursue $7,200 more hypothetical gross benefit. Choosing PO over ship-by gives up $10,800 of hypothetical gross benefit while avoiding $15,333 of hypothetical first-year cost. Under these base assumptions, PO has the highest partial first-year residual; this is not robust ROI or money the experimenter earns. Missing costs, uncertain benefits and overlapping sensitivity ranges can reverse the comparison.

These professional-cost differences must not be deducted from your $30 allowance, priced as your labor, or substituted for experimental learning value. The standing ChatGPT Pro subscription and Power BI publication costs do not enter the actual lab comparison.

## Existing GCP and the approximately $30 monthly allowance

The manager reports existing GCP access and about **$30/month of allowance**. Treat that as the planning boundary for GCP, not a credit whose existence makes usage free, a verified remaining balance, or an enforced cap. Until its scope is checked, conservatively allow for other usage sharing it. No account creation or Power BI Service publication is part of the proposed project.

| Inherited small-lab component | OPP-01 | OPP-02 | OPP-04 |
|---|---:|---:|---:|
| Estimated GCP component/month | $2–12 | $2–12 | $8–33 |
| Fraction of approximately $30, if entirely available | 7–40% | 7–40% | 27–110% |
| Remaining allowance at the high endpoint, before other charges | $18 | $18 | **−$3** |

These are the existing low-confidence B1/B2 component estimates, not refreshed provider quotes or whole-account forecasts. If other GCP usage is **E** dollars/month, remaining project capacity is approximately `max(0, 30 − E)` before any reserve. At the inherited high endpoint, OPP-01/02 fit only if other usage plus reserve is at most $18; OPP-04's $33 endpoint does not fit even with no other usage. This does not prove ship-by cannot fit: a smaller justified workload could lower its cost, but the estimate must be revised openly.

GCP cost alone does **not** distinguish OPP-01 from OPP-02. It gives a reason to prefer either over the larger OPP-04 profile when cloud headroom matters. The approximate allowance guides planning; confirm its scope, remaining headroom and exact operating limits at Gate 4, with no objective to consume the allowance. Exclude the standing ChatGPT Pro license from incremental project cost as instructed. With no report publication, budget no Power BI Service publication/capacity purchase. Do not add optional paid tools or APIs to the baseline.

## Where cost optimization should focus after selection

Carry these requirements into Gate 4; this addendum selects no architecture or cloud resources:

1. Attribute incremental GCP usage and reconcile it with the allowance and existing consumption. Forecast development retries, report reads/refreshes, ongoing storage, ancillary services and cleanup, not just the first successful query.
2. Use the smallest workload that preserves the required semantics and failure cases. Run suitable deterministic checks locally, then use bounded cloud evidence for actual integration. Preserve independent expected results and required host verification.
3. Minimize repeated scanning, unnecessary refreshes, retained temporary data and idle services. Compare expected savings with the one person's setup/maintenance effort; an elaborate optimization system could cost more attention than it saves.
4. Specify how usage is limited and observed. Google documents dry-run estimates, per-query maximum bytes billed and daily query quotas for applicable BigQuery workloads. Their scope must be checked for the chosen execution path. [Google cost-control guidance](https://docs.cloud.google.com/bigquery/docs/best-practices-costs)
5. Verify the selected controls' actual coverage and stop behavior. An alerts-only budget notifies; it does not itself stop spending. Do not call an unverified budget setting an enforced whole-project cap. [Google budget documentation](https://docs.cloud.google.com/billing/docs/how-to/budgets)

Official control documentation was checked on 2026-09-20; no account, quota, query or resource was changed. Pricing and exact operating limits remain Gate 4 work.

## Recommendation after this clarification

**Keep OPP-02 as a conditional recommendation, with OPP-01 an equally defensible alternative.** The original tie-break was greater fictional benefit headroom at similar scope, not the highest weighted score or lower actual GCP cost. Your clarification makes that distinction more important: the lab recommendation rests on choosing a useful PO lifecycle case within a manageable footprint, not on claimed monetary superiority for you.

Choose OPP-01 if minimum human review or financial-reconciliation coverage matters most. Choose OPP-04 if cross-system chronology is an explicit learning priority worth more review and a revised workload that fits available GCP headroom. Reconsider any candidate if cost or human effort exceeds the accepted boundary; switching domains will not solve a shared BigQuery/Power BI host blocker.

Selection is cheapest to change now, before architecture or build. Later shared work may be reusable, but reuse savings have not been measured and sunk effort should not justify an unsuitable choice. **Gate 3 remains Awaiting Decision for your re-review.**
