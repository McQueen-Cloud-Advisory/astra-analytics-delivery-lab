# Opportunity portfolio

Version: **v1.0**. Prepared: **2026-09-20**. Governing baseline: [master prompt v2.0](../../prompts/astra-analytics-delivery-master-prompt.md). Stage: **Phase 1 complete; Gate 1 decision pending**. No opportunity has been scored, formally triaged, selected, or approved.

This is discovery for fictional Harborline Distribution Group. Company problems, volumes, benefits, staffing, source readiness, and costs below are **scenario assumptions or planning estimates**, not customer findings. Benefits remain hypotheses even if a synthetic demonstration works. The [assumptions register](../assumptions.md) records common assumptions; [environment readiness](../environment-readiness.md) records actual lab capability. No candidate's inclusion establishes cloud access, a usable Power BI license, or a working integration.

## Comparison at a glance

The presentation buckets are disjoint: **3 small, 4 medium, 3 large, 2 debatable**. IDs identify candidates and do not express preference. Effort is professional engineering person-days; maintenance is engineering/support hours per month. Labor development cost uses the explicit scenario basis below. Cloud profile codes distinguish small lab workloads from hypothetical company workloads.

| ID / initiative | Bucket | Main decision / user | Sources; freshness | Complexity; effort | Development labor USD | Maintenance | Cloud profile | First-run route |
|---|---|---|---|---|---|---|---|---|
| OPP-01 Receivables follow-up exceptions | Small | Whom to contact; AR team | ERP; daily | Low; 8-15 days | $6.4k-12k | 2-4 h/mo | B1 | Compatible |
| OPP-02 Overdue purchase-order follow-up | Small | Which vendor to chase; buyers | ERP + owner reference; daily | Low; 10-18 days | $8k-14.4k | 3-6 h/mo | B1 | Compatible |
| OPP-03 Weekly sales scorecard | Small | Which sales exceptions to investigate; sales managers | ERP; weekly | Low; 6-12 days | $4.8k-9.6k | 2-4 h/mo | B1 | Compatible; duplication concern |
| OPP-04 Ship-by exception reporting | Medium | Which orders to expedite; DC supervisors | OMS + WMS; daily | Moderate; 18-30 days | $14.4k-24k | 6-12 h/mo | B2 | Compatible |
| OPP-05 Inventory aging and slow movers | Medium | Which stock to review; inventory planners | WMS + ERP; daily | Moderate; 22-40 days | $17.6k-32k | 8-16 h/mo | B2 | Compatible |
| OPP-06 Returns and refund cycle analysis | Medium | Which return stage to fix; returns/CX managers | OMS + WMS + ERP; daily | Moderate; 25-45 days | $20k-36k | 10-18 h/mo | B2 | Compatible |
| OPP-07 Freight invoice variance review | Medium | Which charges to dispute; transport finance | TMS + ERP + rates; weekly | Moderate-high; 25-45 days | $20k-36k | 10-20 h/mo | B2 | Compatible |
| OPP-08 Customer cost-to-serve analysis | Large | Which service/pricing terms to review; finance/commercial | ERP + WMS + TMS + allocation reference; weekly | High; 50-90 days | $40k-72k | 20-40 h/mo | B3 | Compatible |
| OPP-09 Demand and replenishment recommendations | Large | What/when to replenish; planners | OMS + ERP + WMS; daily | High; 70-120 days | $56k-96k | 30-60 h/mo | B3 + model allowance | Compatible if advisory |
| OPP-10 Delivery exception control tower | Large | Which threatened deliveries to intervene on; dispatch | OMS + WMS + TMS/carriers; 5-15 minutes | High; 80-140 days | $64k-112k | 40-80 h/mo | B4 | Compatible; freshness unproved |
| OPP-11 Customer-service resolution assistant | Debatable | What answer/action to propose; service agents | Tickets + order data + knowledge base; on request | High; 60-110 days | $48k-88k | 30-70 h/mo | A1 | Future route |
| OPP-12 Supplier-portal status automation | Debatable | Which shipment statuses to reconcile; purchasing coordinators | ERP + vendor portals; twice daily | High; 40-80 days | $32k-64k | 25-60 h/mo | A2 | Future route |

"Compatible" means the decision naturally supports a GCP/BigQuery analytical product with Power BI, subject to feasibility and approval. It is **not** an Advance disposition. OPP-11 and OPP-12 naturally require application/workflow delivery; adding a dashboard would not make that underlying work an appropriate first-run analytics project. Retain them for a later route unless the manager explicitly changes the experiment at Gate 3.

## Estimation basis and limits

- **Scope:** costs describe a bounded MVP with basic tests, documentation, deployment preparation, and operating handoff. They exclude enterprise rollout, historical source remediation, purchased source connectors, source-system changes, tax, and dedicated on-call staffing. New evidence can invalidate these ranges.
- **Engineering benchmark:** one person-day = 8 hours at an assumed fully loaded **$100/hour**, so development labor = days x $800. This is a comparison assumption, not a salary survey, invoice, or Astra usage cost. At one full-time engineer and five days per week, effort divided by five gives active development weeks; approvals, access, source owners, and procurement add unknown elapsed waits. Benefits are not calculated from this engineering rate.
- **Actual agent run:** agent elapsed time, observed human effort, and model/tool usage are separately measured under the experiment protocol. No speedup factor, guaranteed completion date, or model-spend estimate is inferred from professional effort.
- **Source size:** cards show approximate logical extracted bytes and rows for the stated history, not verified source databases. BigQuery storage includes retained copies/derived tables; it can exceed source size. "Growth" is annual business-event growth unless stated otherwise. Daily snapshots can dominate retained volume even when business growth is modest.
- **Maintenance:** includes routine failure review, source/schema or rule updates, report changes, and support; cost at the same planning rate is hours x $100/month. Business-user decision effort is separate. Model review and portal changes explain the higher non-BI maintenance ranges.
- **Value:** candidate cards state an addressable decision and a possible measurable effect. Dollar opportunity ranges, where stated, are gross hypothetical value before delivery/ownership cost, not savings demonstrated by the lab. They are deliberately broad and low confidence. Gate 2 must challenge them; Gate 3 must compare a no-build alternative and ownership cost.
- **Licensing/access:** Power BI, connector, ERP/API access, model-provider subscriptions, CI paid usage, and agent charges are **unknown and excluded**, never assumed free. License/user/workspace needs must be priced before selection if they can change the decision. A low cloud component is not a total operating cost estimate.

For the analytics profiles, use **Iowa (`us-central1`) only as a pricing reference**, not a chosen region: $6.25/TiB of on-demand queries and approximately $0.023/GiB-month of active logical storage (hourly price $0.000031507 x 730 hours). These were checked on 2026-09-20 against [Google's BigQuery pricing](https://cloud.google.com/bigquery/pricing). Ignore free allowances, discounts, and long-term storage reductions in this comparison. No region, service, or spend is authorized here.

`Monthly analytics component = 6.25 x Q + 0.023 x S + A`, where Q is TiB scanned/month, S is average GiB stored, and A is an explicit planning allowance for ingestion/job execution, staging, logging, and modest transfer. A is an assumption, not a verified service quote. Lower and upper endpoints use all corresponding input endpoints and are rounded outward to whole dollars. Query volumes are workload inputs, not consequences inferred only from data size; they must later be checked using query plans and refresh frequency.

| Profile | Lab inputs: S; Q; A USD | Lab analytics component USD/month | Company inputs: S; Q; A USD | Company analytics component USD/month |
|---|---|---|---|---|
| B1 | 1-5 GiB; 0.1-0.5 TiB; $2-8 | $2-12 | 5-20 GiB; 1-5 TiB; $10-40 | $16-72 |
| B2 | 5-20 GiB; 0.5-2 TiB; $5-20 | $8-33 | 50-250 GiB; 5-30 TiB; $30-150 | $62-344 |
| B3 | 20-100 GiB; 2-10 TiB; $20-100 | $32-165 | 500-3,000 GiB; 30-300 TiB; $200-2,000 | $399-3,944 |
| B4 | 20-100 GiB; 5-30 TiB; $40-200 | $71-390 | 1,000-5,000 GiB; 100-1,000 TiB; $1,000-5,000 | $1,648-11,365 |

For example, B2's company upper endpoint is `30 x 6.25 + 250 x 0.023 + 150 = $343.25/month`, rounded up to $344. Profile amounts are **scenario planning ranges**, not hard limits or full cloud quotes. Capacity pricing, large cross-cloud exports, streaming, and model-training services require a revised estimate if proposed. Development cloud cost can be compared as **two months of the applicable lab profile**, plus the candidate's explicit model/workflow allowance; the two-month window is a common costing convention, not a promise about duration. No resources have been provisioned for this portfolio.

For the two future-route opportunities, retain transparent but especially uncertain allowances rather than borrowing BI prices:

- **A1 assistant:** lab 1,000-5,000 assisted cases/month, assumed model/retrieval execution allowance $0.01-0.05/case, plus $10-50 fixed services = **$20-300/month**. Company 50,000-150,000 cases at the same assumed unit allowance plus $100-500 fixed = **$600-8,000/month**. These unit amounts are placeholders, not provider price claims; token sizes, models, evaluation runs, and retrieval architecture remain undefined.
- **A2 portal automation:** lab 100-500 browser-minutes/month at an assumed execution allowance $0.02-0.10/minute plus $10-50 fixed = **$12-100/month**. Company 5,000-30,000 minutes plus $100-500 fixed = **$200-3,500/month**. This excludes commercial RPA licensing and human exception handling. Actual portal behavior and hosting determine the estimate.

Source extracts in the first ten candidates can be synthesized without permission to real customer systems. That makes a lab proxy possible; it says nothing about company exports, business definitions, labels, contracts, or adoption. Each card separates those readiness questions. Public data is optional and not assumed necessary. All source-system vendors and APIs are unspecified.

### Hypothetical benefit arithmetic

The following inputs explain the annual opportunity bands in the cards. **None of the quantities or unit values have been observed.** They are challengeable scenario parameters, not forecasts. Dollar benefit is quantity times unit value; paired lower/upper endpoints produce the stated ranges. Labor-related value uses an assumed $50/hour for business-user time, distinct from the $100/hour engineering-cost benchmark. Freed time is capacity, not necessarily a cash saving. Technical ownership cost is deducted later, not hidden inside gross benefit. Do not add overlapping opportunity values across candidates.

| Candidate | Annual addressable quantity assumed | Value per successful avoided/reduced item assumed | Gross annual range |
|---|---|---|---|
| OPP-01 | 200-800 preparation/rework hours; includes work beyond initial pack preparation | $50/hour | $10k-40k |
| OPP-02 | 300-1,200 reconciliation/expediting hours; includes avoidable follow-up rework | $50/hour | $15k-60k |
| OPP-03 | 100-300 preparation/rework hours | $50/hour | $5k-15k |
| OPP-04 | 3,000-5,000 preventable fulfillment rework events | $10-20/event | $30k-100k |
| OPP-05 | 500-1,000 actionable SKU/location disposition cases | $100-200 in avoidable loss/carrying cost per case, not full stock value | $50k-200k |
| OPP-06 | 3,000-6,000 avoidable return/refund rework cases | $10-20/case | $30k-120k |
| OPP-07 | 1,500-2,500 recoverable invoice errors | $50-100/error | $75k-250k |
| OPP-08 | 200-500 effective customer/service-term changes | $1,000-1,500 incremental contribution per change | $200k-750k |
| OPP-09 | 1,000-2,500 improved replenishment decisions | $200-400 net avoidable inventory/service loss per decision; count once | $200k-1m |
| OPP-10 | 3,000-6,000 delivery interventions that actually prevent a cost | $50-100/intervention | $150k-600k |
| OPP-11 | 100,000-200,000 cases with effective assistance; a subset of company cases | $1-2 net handling capacity per case after business-agent review | $100k-400k |
| OPP-12 | 800-3,000 coordinator hours avoided after exception review | $50/hour | $40k-150k |

Gate 2 must challenge whether these actions exist and whether native-system/process alternatives already capture the benefit. An observed exception is not a successful avoided event. Lower realization, missing action authority, or source defects can reduce incremental value below these illustrative ranges, including to zero. A $10k eligibility floor does not turn an assumed $10k lower endpoint into evidence.

## Candidate cards

### OPP-01 - Receivables follow-up exceptions

- **Problem / users:** AR analysts manually reconcile aging extracts and may miss high-exposure overdue invoices. The credit manager and collections team need a repeatable worklist.
- **Decision / benefit hypothesis:** identify accounts requiring investigation and contact, with invoice-level evidence. Avoiding 3-8 hours/week of preparation and improving coverage of high-value exceptions could matter; collection acceleration is working-capital timing, not automatically profit. Gross annual addressable value: $10k-40k as a scenario, subject to confirming current effort and actionability.
- **Sources / scale / growth:** ERP invoices, payments, customers, credit notes, plus an owner reference; 24 months, 0.5-2 million transaction rows, 1-5 GiB; 5-15% annual event growth. Daily freshness is adequate for a morning queue.
- **Approach:** batch data engineering, deterministic aging/open-balance rules, and a descriptive Power BI exception report backed by BigQuery. No ML or automated collections action is needed.
- **Dependencies / readiness:** assume one ERP export and usable invoice/payment keys; partial payments, credit allocation, aging date, currency, and disputed balances require owner definitions. Synthetic generation is straightforward; actual export availability and lab access remain unverified.
- **Complexity / effort / costs:** low, with financial-reconciliation edge cases; 8-15 engineering days (1.6-3 active weeks); $6.4k-12k labor. B1 cloud component: lab $2-12/month, company $16-72/month; two-month development cloud allowance $4-24. Maintenance 2-4 h/month ($200-400), plus unknown licenses/access costs.
- **Material risk / major uncertainty:** duplicate payments or bad aging rules could misdirect collections; customer balances are sensitive in a real deployment. It is unknown whether the ERP already provides an adequate worklist and whether staff can act on additional exceptions.
- **Simpler alternative / route:** configure the existing ERP aging report and owner filter. Compatible with the first-run analytics route only if that alternative leaves a meaningful gap.

### OPP-02 - Overdue purchase-order follow-up

- **Problem / users:** buyers track late open PO lines in spreadsheets; supplier changes and partial receipts make follow-up inconsistent.
- **Decision / benefit hypothesis:** prioritize overdue, unreceived lines and contact the responsible supplier. Reducing 4-10 hours/week of reconciliation and preventing some expediting events offers a hypothetical $15k-60k/year gross opportunity; avoided disruption is unvalidated and must not be inferred from synthetic lateness.
- **Sources / scale / growth:** ERP PO lines, promise-date revisions, receipts, cancellations, suppliers, and a maintained buyer/criticality reference; 24 months, 0.3-1.5 million rows, 0.5-3 GiB; 5-15% annual growth. Refresh daily before buyer review.
- **Approach:** batch transformations and descriptive BI; calculate outstanding quantities and lateness against an approved promise-date rule. A manually reviewed exception queue is enough; workflow automation or predictive ETA is unnecessary for the MVP.
- **Dependencies / readiness:** assume stable PO-line keys and reliable receipt/cancel flags. Original versus latest promise dates and overreceipts need definition. A synthetic proxy is easy, but historical promise revisions and reference ownership may be missing at the company; lab access is unverified.
- **Complexity / effort / costs:** low; 10-18 days (2-3.6 active weeks), $8k-14.4k labor. B1: lab $2-12/month, company $16-72/month; development cloud $4-24. Maintenance 3-6 h/month ($300-600), plus unknown licenses/access.
- **Material risk / major uncertainty:** erroneous remaining quantities cause needless escalation; missing promise history can make supplier performance misleading. Criticality and evidence that follow-up changes outcomes are uncertain.
- **Simpler alternative / route:** use ERP open-order alerts and establish buyer ownership. Compatible with the first-run analytics route; no vendor communication is automated.

### OPP-03 - Weekly sales scorecard

- **Problem / users:** sales managers assemble weekly revenue/margin spreadsheets with inconsistent customer/channel labels.
- **Decision / benefit hypothesis:** identify large deviations for investigation in the weekly review. A consistent pack could save 2-4 hours/week, but without an agreed follow-up decision the benefit is mostly presentation convenience. Gross opportunity is hypothesized at $5k-15k/year, with especially weak incremental value evidence.
- **Sources / scale / growth:** ERP invoice lines, credits, standard costs, customer/channel mappings; 24 months, 1-4 million rows, 2-8 GiB; 5-15% annual growth. Weekly refresh after a stated close/correction cutoff.
- **Approach:** basic data preparation and descriptive BI; BigQuery aggregates and a compact Power BI scorecard. No predictive or generative AI is justified.
- **Dependencies / readiness:** common fiscal calendar, gross-versus-net sales and margin definitions, stable channel mapping. Easy synthetic invoices do not resolve company cost corrections or demonstrate a reporting gap; lab capability is unverified.
- **Complexity / effort / costs:** low; 6-12 days (1.2-2.4 active weeks), $4.8k-9.6k labor. B1: lab $2-12/month, company $16-72/month; development cloud $4-24. Maintenance 2-4 h/month ($200-400), plus unknown licenses/access.
- **Material risk / major uncertainty:** misleading margin from stale costs and duplicated existing reporting. The chief uncertainty is whether any decision improves enough to justify a separate product.
- **Simpler alternative / route:** standardize an ERP report or the existing workbook and meeting agenda. Technically compatible, but business eligibility is doubtful until a distinct action and incremental value are identified.

### OPP-04 - Ship-by exception reporting

- **Problem / users:** DC supervisors cannot consistently connect promised ship dates to WMS execution status across fulfillment channels.
- **Decision / benefit hypothesis:** review missed or imminent ship-by commitments, assign an owner, and expedite viable orders at the morning planning meeting. A hypothetical $30k-100k/year opportunity combines preparation effort and preventable rework; it does not establish carrier delivery improvement.
- **Sources / scale / growth:** OMS order/line promises and cancellations plus WMS picks, packs, partial shipments, and DC calendars; 12 months, 8-20 million rows, 15-50 GiB; 10-20% annual growth. Daily freshness initially; intraday dispatch is outside the proposed MVP.
- **Approach:** data engineering across two sources; explicit order-line/shipment bridge; descriptive BI with exception drill-through. Rule-based deadlines fit the problem better than predictive ML initially.
- **Dependencies / readiness:** cross-system IDs, split shipments, business-day cutoffs, timezone and exclusion rules. Synthetic events are feasible with careful chronology; real key coverage and delayed status corrections are unknown. Lab integration is unverified.
- **Complexity / effort / costs:** moderate; 18-30 days (3.6-6 active weeks), $14.4k-24k labor. B2: lab $8-33/month, company $62-344/month; development cloud $16-66. Maintenance 6-12 h/month ($600-1,200), plus unknown licenses/access.
- **Material risk / major uncertainty:** counting partial shipments as complete or stale cancellations as open misdirects expediting. The daily planning use case may fail if the meaningful action window is only minutes.
- **Simpler alternative / route:** compare native WMS exception queues and an OMS promised-date export. Compatible analytics route if the cross-system reconciliation gap remains.

### OPP-05 - Inventory aging and slow movers

- **Problem / users:** inventory planners lack consistent aging/velocity views across DCs and disagree about which stock requires transfer, discount, or review.
- **Decision / benefit hypothesis:** investigate aged/slow-moving SKU-location balances before taking operational action. A hypothetical $50k-200k/year gross opportunity depends on executable disposition decisions; reporting an inventory balance is not a realized inventory reduction.
- **Sources / scale / growth:** WMS movements and daily snapshots; ERP item, cost, purchase/receipt references; 24 months, 25-80 million rows, 40-150 GiB; 5-15% annual SKU/event growth, with snapshot accumulation retained separately. Daily freshness.
- **Approach:** historical inventory data engineering plus descriptive/statistical velocity bands in Power BI. Start with explainable age and recent movement measures, not demand prediction.
- **Dependencies / readiness:** batch/lot tracking where available, transfers, unit conversions, returns, negative stock, and snapshot reconciliation. Synthetic movement generation needs stock-flow consistency; it cannot establish actual lot lineage or trusted opening balances. Lab access is unverified.
- **Complexity / effort / costs:** moderate; 22-40 days (4.4-8 active weeks), $17.6k-32k labor. B2: lab $8-33/month, company $62-344/month; development cloud $16-66. Maintenance 8-16 h/month ($800-1,600), plus unknown licenses/access.
- **Material risk / major uncertainty:** an assumed age allocation can misclassify transferred/returned stock; a planner could make poor disposition decisions. Availability of historical snapshots and authority to act on exceptions are uncertain.
- **Simpler alternative / route:** configure WMS inventory-age reporting and review a limited SKU/DC set. Compatible analytics route with clearly labeled estimates when exact age cannot be observed.

### OPP-06 - Returns and refund cycle analysis

- **Problem / users:** returns operations and customer-service managers cannot distinguish processing delay from refund delay and inconsistent reason coding.
- **Decision / benefit hypothesis:** find return stages and product groups causing avoidable delay; target operational fixes. A hypothetical $30k-120k/year opportunity covers preparation and rework; reduced repeat contacts or customer churn requires real observation.
- **Sources / scale / growth:** OMS return authorizations, WMS receipts/inspection/disposition, ERP credit/refund postings; 18 months, 1-5 million rows, 5-25 GiB; 10-20% annual growth. Daily freshness; no automatic refunding.
- **Approach:** event lifecycle data engineering, descriptive cycle-time analysis, and BI. Use structured reason mappings first; neither text classification nor generative AI is required.
- **Dependencies / readiness:** return-item to original-order/refund linkage, multiple refunds, missing terminal events, holidays, and approved reason taxonomy. A synthetic lifecycle can test chronology and censoring; it cannot establish source linkage or a real common taxonomy. Lab capability is unverified.
- **Complexity / effort / costs:** moderate; 25-45 days (5-9 active weeks), $20k-36k labor. B2: lab $8-33/month, company $62-344/month; development cloud $16-66. Maintenance 10-18 h/month ($1,000-1,800), plus unknown licenses/access.
- **Material risk / major uncertainty:** excluding still-open cases understates delay; double-counted refunds distort performance. Real return-link coverage and whether identified delays can be changed are uncertain.
- **Simpler alternative / route:** align status/reason definitions and use a native returns queue before integrating three systems. Compatible analytics route.

### OPP-07 - Freight invoice variance review

- **Problem / users:** transport finance staff manually compare carrier bills with shipments and contracted rates; legitimate and erroneous surcharges are hard to separate.
- **Decision / benefit hypothesis:** identify evidence-backed invoice exceptions for human review and possible dispute. A hypothetical $75k-250k/year addressable opportunity depends on invoice error rates and recoverability; flagged amounts are not savings.
- **Sources / scale / growth:** TMS shipments, ERP carrier invoice lines, and versioned rate/accessorial tables; 24 months, 5-15 million rows, 20-80 GiB; 10-20% annual growth. Weekly reconciliation, with invoice-arrival lag visible.
- **Approach:** data engineering and deterministic rate/variance calculation with descriptive BI. Use human judgment for ambiguous exceptions; no autonomous payment hold or dispute is proposed.
- **Dependencies / readiness:** shipment/invoice keys, contract effective dates, dimensional weight, fuel rules, currency, and LTL classifications. Synthetic rules can be documented, but real contract parsing and exception prevalence are unverified. Lab access is unverified.
- **Complexity / effort / costs:** moderate-high; 25-45 days (5-9 active weeks), $20k-36k labor. B2: lab $8-33/month, company $62-344/month; development cloud $16-66. Maintenance 10-20 h/month ($1,000-2,000), plus unknown licenses/access.
- **Material risk / major uncertainty:** oversimplified contract logic creates costly false disputes. The number of rate variants and availability of machine-readable contracts may move this into the large category during discovery.
- **Simpler alternative / route:** native TMS audit features, existing carrier audit service, or a limited rate/lane sample. Compatible analytics route when narrowed to explainable bill checks.

### OPP-08 - Customer cost-to-serve analysis

- **Problem / users:** finance and commercial leaders see sales margin but cannot reliably attribute fulfillment, handling, returns, and freight to customers or orders.
- **Decision / benefit hypothesis:** target contract, service, or pricing reviews using transparent cost attribution. Hypothetical gross opportunity $200k-750k/year; allocated costs are not necessarily avoidable costs, and customer responses remain unknown.
- **Sources / scale / growth:** ERP sales/costs, WMS activities, TMS charges, approved labor/overhead allocation references; 24 months, 80-200 million rows, 200-600 GiB; 10-20% annual growth. Weekly refresh after allocation/correction cutoffs.
- **Approach:** substantial cross-system data engineering, activity-based allocation/statistical analysis, and explainable BI. Predictive ML is unnecessary for the initial cost model.
- **Dependencies / readiness:** agreement on allocation drivers, event granularity, common IDs, labor-rate inputs, treatment of overhead, and confidentiality. Synthetic allocations can be made consistent but cannot validate that drivers explain real costs. Lab capability is unverified.
- **Complexity / effort / costs:** high; 50-90 days (10-18 active weeks), $40k-72k labor. B3: lab $32-165/month, company $399-3,944/month; development cloud $64-330. Maintenance 20-40 h/month ($2,000-4,000), plus unknown licenses/access.
- **Material risk / major uncertainty:** a precise-looking allocation can support harmful pricing decisions; finance/commercial disagreement may dominate delivery. Real cost causality and preventable versus fixed costs are major uncertainties.
- **Simpler alternative / route:** a finance-owned sample of a few customers using existing extracts. Compatible analytics route, with assumptions visible to decision-makers.

### OPP-09 - Demand and replenishment recommendations

- **Problem / users:** planners struggle with intermittent demand, promotions, supplier lead-time variability, and service/stock tradeoffs across locations.
- **Decision / benefit hypothesis:** compare forecast and replenishment scenarios for human approval; no purchase orders are created automatically. Hypothetical gross opportunity $200k-1m/year through service and inventory decisions, with significant overlap that must not be counted twice.
- **Sources / scale / growth:** OMS demand/cancellations, ERP purchasing/lead times, WMS stock/movements and stockout signals; 36 months, 100-300 million rows, 250-1,000 GiB; 10-25% annual growth. Daily recommendations; monthly model review initially.
- **Approach:** data engineering, simple statistical baselines, then predictive models only if temporal backtests beat those baselines; Power BI communicates uncertainty and comparison. Generative/agentic AI does not address forecast quality.
- **Dependencies / readiness:** distinguish observed sales from demand censored by stockouts, promotions and substitutions, supplier lead-time histories, forecast hierarchy, and planner ownership. Synthetic patterns test code but cannot establish out-of-sample accuracy on Harborline demand. Lab/model capability is unverified.
- **Complexity / effort / costs:** high; 70-120 days (14-24 active weeks), $56k-96k labor. B3 plus provisional model-run allowance: lab 4-20 runs/month x assumed $1-5/run = $4-100, total **$36-265/month**; company 20-100 runs x $5-20 = $100-2,000, total **$499-5,944/month**. These run rates are assumptions requiring model/service pricing, not provider quotes. Two-month development cloud $72-530. Maintenance 30-60 h/month ($3,000-6,000), plus unknown licenses/access.
- **Material risk / major uncertainty:** feedback effects and inaccurate demand estimates could increase stockouts or excess stock. Real historical signal quality and incremental performance over the current planning system are unknown.
- **Simpler alternative / route:** tune ERP reorder points, segment SKUs, and test seasonal/naive baselines. Compatible analytics route only as an advisory product with explicit model-evidence limitations.

### OPP-10 - Delivery exception control tower

- **Problem / users:** dispatch and service teams see late carrier updates in separate systems and lack a consistent view of deliveries needing intervention.
- **Decision / benefit hypothesis:** contact carriers or customers and investigate threatened commitments while action is still possible. Hypothetical gross opportunity $150k-600k/year; observed alert counts do not establish avoided service failures.
- **Sources / scale / growth:** OMS commitments, WMS departures, TMS shipment events, carrier status APIs; 12 months, 150-500 million events, 300-1,500 GiB; 15-30% annual growth. Desired end-to-end freshness 5-15 minutes, including source latency.
- **Approach:** incremental/event ingestion, event normalization and deduplication, rule-based exception analysis, BI with explicit stale/error states. Predictive ETA is a later possibility, not necessary to display observed exceptions.
- **Dependencies / readiness:** carrier access and rate limits, source timestamps, event ordering, operational ownership, and an approved Power BI connection/refresh approach that meets the requirement. Synthetic streams are possible but do not prove external latency or report freshness. Lab access and feasibility are unverified.
- **Complexity / effort / costs:** high; 80-140 days (16-28 active weeks), $64k-112k labor. B4: lab $71-390/month, company $1,648-11,365/month; development cloud $142-780. Maintenance 40-80 h/month ($4,000-8,000), plus unknown licenses/access and on-call coverage.
- **Material risk / major uncertainty:** stale or repeated alerts can misdirect time-critical action; outages require an operational fallback. Carrier event completeness and whether a report is an effective intervention surface are uncertain.
- **Simpler alternative / route:** existing TMS alerts, carrier tracking tools, or a daily retrospective before real-time investment. Compatible in concept; the freshness requirement could invalidate first-run feasibility.

### OPP-11 - Customer-service resolution assistant

- **Problem / users:** customer-service agents search order status and policy documents while handling repetitive cases.
- **Decision / benefit hypothesis:** propose a sourced answer and a next action for an agent to approve. Hypothetical gross opportunity $100k-400k/year depends on reduced handling time after review burden; no autonomous customer communication, refund, or account change is included.
- **Sources / scale / growth:** ticket text, knowledge articles, order/shipment lookup data; 24 months, 0.5-2 million tickets, 10k-50k documents, 20-100 GiB plus lookup tables; 10-25% annual growth. On-request retrieval with current order status.
- **Approach:** retrieval and generative AI in a service-agent workflow; a rules/search baseline must be compared. Agentic execution is not justified before evidence for answer quality and control of actions. BigQuery/Power BI might monitor results but are not the main product.
- **Dependencies / readiness:** real evaluation questions/answers, policy ownership, permission-aware retrieval, ticket-system integration, model/provider evaluation, and human-review design. Generating plausible tickets is easy; generating valid evidence of real resolution quality is not. Lab/model access is unverified.
- **Complexity / effort / costs:** high; 60-110 days (12-22 active weeks), $48k-88k labor. A1: lab $20-300/month, company $600-8,000/month; development service allowance $40-600. Maintenance 30-70 h/month ($3,000-7,000), plus unknown licenses/access and review effort.
- **Material risk / major uncertainty:** inaccurate policies or exposed customer information can harm customers; retrieved content is untrusted. Real task mix, evaluation quality, net agent time saved, and ongoing policy updates dominate uncertainty.
- **Simpler alternative / route:** improve knowledge search, macros, and native ticketing features. Future route; it does not fit an analytics delivery merely because a monitoring dashboard could be added.

### OPP-12 - Supplier-portal status automation

- **Problem / users:** purchasing coordinators repeatedly log into supplier portals to retrieve shipment statuses and reconcile them to open purchase orders.
- **Decision / benefit hypothesis:** prepare a reviewed status update/exception queue for buyers. Hypothetical gross opportunity $40k-150k/year depends on portal stability and review burden. No writeback to the ERP or external supplier message is part of the initial concept.
- **Sources / scale / growth:** ERP open POs plus 10-30 assumed supplier portals; 12 months, 0.2-1 million status records, 1-5 GiB excluding screenshots; 5-15% event growth and potentially 2-5 additional portals/year. Twice-daily collection.
- **Approach:** prefer vendor exports/APIs; use deterministic workflow/browser automation only where allowed and necessary. Generative or agentic AI is not required for routine extraction; operational exceptions need human handling.
- **Dependencies / readiness:** vendor permission, per-portal credentials, MFA/human steps, terms, reliable matching, and ownership of changing automation. Synthetic portal mocks can test extraction but cannot prove production portal access or reliability. Lab capability is unverified.
- **Complexity / effort / costs:** high and externally driven; 40-80 days (8-16 active weeks), $32k-64k labor. A2: lab $12-100/month, company $200-3,500/month; development service allowance $24-200. Maintenance 25-60 h/month ($2,500-6,000), plus unknown RPA licenses/access and manual exception effort.
- **Material risk / major uncertainty:** portal changes, account lockouts, or incomplete scraping produce stale or incorrect statuses. The usable API/export coverage and true frequency of portal changes are unknown.
- **Simpler alternative / route:** supplier-provided scheduled exports, agreed status emails, or a smaller manual follow-up process. Future workflow route; a BI layer does not remove its main operational burden.

## Decision boundary

The preliminary observations and proposed scoring framework are in [Gate 1](../gates/gate-1-portfolio-review.md). That record requests approval of the **framework**, not an initiative. Next, after that approval, Phase 2 may test these assumptions and propose triage dispositions. No ranking, development, cloud use, or project selection is authorized by this portfolio.

The analytics route is technically plausible in general: Microsoft documents BigQuery Import and DirectQuery support and an explicit billing-project option. Actual authentication, connector version, refresh, licensing, and intended-host behavior still require verification. [Microsoft BigQuery connector documentation](https://learn.microsoft.com/en-us/power-query/connectors/google-bigquery)
