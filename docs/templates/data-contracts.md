# Data generation, source, and KPI contracts — TEMPLATE

**Draft template; no data or semantic baseline approved.** Copy applicable sections into `docs/data/`. The [master prompt](../../prompts/astra-analytics-delivery-master-prompt.md) governs applicability, baseline approval, and independent validation. Keep source contracts and expected results versioned with the implementation.

## Identity

| Field | Value |
|---|---|
| Run / initiative / contract ID and revision | Unknown |
| Owner / reviewer | Unknown |
| Gate 5 decision and baseline revision | None recorded |
| Related source-to-target design / acceptance matrix | Unknown |

## Synthetic generator specification

| Field | Value |
|---|---|
| Generator revision / dependencies | Unknown |
| Seed and determinism limitations | Unknown |
| Time span / timezone / business calendar | Unknown |
| Entity relationships and referential constraints | Unknown |
| Distributions, correlations, seasonality, growth, and assumptions | Unknown — identify scenario assumptions |
| Event lifecycle and chronology constraints | Unknown |
| Injected duplicates, corrections, late events, malformed data, and outages | Unknown — select relevant cases |
| Expected clean results and independent fixture links | Unknown |
| Reproduction command and configuration | Unknown |
| Output location / retention / data version or hash | Unknown |

| Scale profile | Rows / volume / duration | Purpose | Runtime / cost estimate | Authorized workload-envelope reference | Execution evidence |
|---|---|---|---|---|---|
| Small | Unknown | Default local validation | Unknown | None recorded | Not Run |
| Representative | Unknown | Selected workload validation | Unknown | None recorded | Not Run |
| Stress | Unknown | Applicable limit / recovery validation | Unknown | None recorded | Not Run |

## Public-data provenance — use if applicable

| Dataset / publisher and source URL | License / permitted use and review date | Version / retrieval date / checksum | Transformations | Suitability limits / classification | Owner |
|---|---|---|---|---|---|
| Unknown | Unknown | Unknown | Unknown | Unknown | Unknown |

If no public data is used, record `N/A` with that reason. Do not treat available synthetic data as proof of the fictional company's operational data readiness.

## Source and target contracts — repeat per material source / table

| Field | Value |
|---|---|
| Source / target ID and owner | Unknown |
| Business event and grain | Unknown |
| Schema / types / nullability / units | Unknown — link detailed schema if needed |
| Primary / business keys and relationships | Unknown |
| Event identity and lifecycle states | Unknown |
| Update / correction / deletion behavior | Unknown |
| Incremental cursor / watermark / arrival ordering | Unknown |
| Deduplication and conflicting-record precedence | Unknown |
| Late-arrival windows and restatement rules | Unknown |
| Schema evolution and compatibility | Unknown |
| Replay / backfill / idempotency behavior | Unknown |
| Reject / quarantine / escalation behavior | Unknown |
| Freshness / completeness / quality thresholds | Unknown |
| Classification / access / retention | Unknown |
| Source-to-target mapping and reconciliation | Unknown — detect omitted and duplicated events |
| Acceptance requirement and fixture IDs | Unknown |
| Non-applicable items and rationale | Unknown |

## KPI semantics — repeat per material KPI / business rule

| Field | Value |
|---|---|
| KPI ID / name / definition revision | Unknown |
| Business owner / approving decision | Unknown / none recorded |
| User decision supported | Unknown |
| Base grain / numerator / denominator | Unknown |
| Included / excluded records and lifecycle states | Unknown |
| Filter context and relationship behavior | Unknown |
| Aggregation, totals / subtotals, and non-additive behavior | Unknown |
| Event date, reporting date, timezone, and calendar | Unknown |
| Currency / unit conversion and rounding | Unknown |
| Blank / zero / unknown / zero-denominator behavior | Unknown |
| Corrections, late arrivals, and restatement | Unknown |
| Expected value / tolerance and acceptance IDs | Unknown |
| Independent expected-result fixture | Unknown |
| Unresolved semantics and affected decisions | Unknown |
| Non-applicable items and rationale | Unknown |

## Independent expected results

| Fixture ID / version / seed | KPI or rule IDs | Input events / small fixture link | Independently calculated expected result | Derivation, author, and independence from transformation / generator | Omitted / duplicated event checks | Acceptance test / evidence |
|---|---|---|---|---|---|---|
| Unknown | Unknown | Unknown | Unknown — calculate before implementation result is observed | Unknown — transformation output cannot serve as its own oracle | Unknown | Not Run |

## Contract changes

| Revision / date | Proposed change / reason | Affected KPI, source, requirement, and gate IDs | Decision record and approved revision | Revalidation evidence |
|---|---|---|---|---|
| Unknown | Unknown | Unknown | No decision recorded | Not Run |
