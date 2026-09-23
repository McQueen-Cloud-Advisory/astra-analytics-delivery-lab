# ADR-001 — Local batch execution with BigQuery and unpublished Desktop Import

- **Status:** Accepted with conditions, DEC-G4-001, 2026-09-21. [Exact v1.0 proposal](adr-001-v1.0-submitted.md) preserved.
- **Date:** 2026-09-20 America/Chicago.
- **Owner:** Human Manager for the material tradeoffs; Astra recommends.
- **Baseline:** selected OPP-02 and approved [charter v1.1](../project-charter.md); detailed proposal [architecture v1.1](../architecture/solution-architecture.md).
- **Decision record:** [Gate 4](../gates/gate-4-architecture.md); actual source, approval scope and conditions are recorded there. This ADR does not authorize execution.

## Context

The experiment has one human, synthetic canonical PO events, an existing Node 24 runtime and an approximately $30/month GCP allowance the manager reports is entirely unused. Dedicated project `astra-po-lab-20260921` is now created; “East US” is the stated location preference and `us-east4` is the interpretation accepted at Gate 4. The manager reports Desktop installed. The approved endpoint is a deployed GCP/BigQuery analytical backend with an unpublished Power BI Desktop report. Standing ChatGPT Pro is excluded from project cost. The manager selected OPP-02 for meaningful business/design choices while avoiding OPP-04's additional cost without a sufficient experimental benefit; OPP-02 retains greater hypothetical value than OPP-01 without claiming measured superiority.

The dedicated project `astra-po-lab-20260921` was created under the latest bounded setup authority, but billing linkage failed on account quota. No new billing account may be created by the agent; deprecated `financial-analytics-demo` is prohibited. Scoped runtime authentication and actual Desktop behavior remain untested. Implementation remains after Gate 5 and applicable condition closure. Detailed KPI, promise-date and event precedence choices remain Gate 5 matters.

## Accepted decision

Use a local, explicitly initiated Node batch runner that loads bounded local files directly into BigQuery, validates raw/canonical events, and publishes an immutable serving batch only after independent checks. Keep work and serving data in separate scoped datasets. Power BI Desktop uses Import against one fixed published batch identity; report use remains local and human-verified.

Use keyless scoped runtime authentication; keep setup authority separate and record any effective privileges the single manager cannot narrow. Run automated validation without GCP credentials in CI, followed by separately authorized cloud integration/apply and Desktop checks. Maintain declarative resource definitions and repeatable procedures without introducing an infrastructure platform solely for this lab.

**Material cadence decision:** recommend once-per-active-demonstration-day operator initiation and explicit Desktop refresh. Gate 4 accepts this daily-lab interpretation; it is not an implied downgrade from unattended daily freshness. No missing operator means a fictitious successful refresh. Show source-as-of and stale state.

## Options considered

| Option | Why accept or defer |
|---|---|
| Local runner + direct BigQuery batch + Desktop Import | Recommended: smallest service footprint consistent with the selected endpoint; retains nontrivial data/quality/recovery work. Accept workstation and operator dependence explicitly. |
| Cloud Run Jobs + Scheduler + Cloud Storage | Credible alternative if unattended backend operation is needed. Adds container/registry, service identities, staging retention and schedule/retry ownership; does not remove Desktop refresh dependency. Re-cost rather than assume it is unaffordable or free. |
| Always-on VM or orchestration platform | No present workload requirement justifies the added runtime administration. |
| Local-only analytical product | Lower cloud burden but a material endpoint change; requires the affected manager decision. |

Google documents [direct local batch loading](https://docs.cloud.google.com/bigquery/docs/batch-loading-data) and [scheduled Cloud Run jobs](https://docs.cloud.google.com/run/docs/execute/jobs-on-schedule). Microsoft documents [BigQuery Import support](https://learn.microsoft.com/en-us/power-query/connectors/google-bigquery). These are capability references; none proves authenticated lab execution. The architecture and [integration note](../architecture/power-bi-integration.md) retain implementation-specific limits and required proof.

## Consequences and residual risks

- Less cloud infrastructure and no continuous runtime are proposed; actual attributable costs still depend on query/refresh behavior, retained data and shared-account usage. Numerical authority resides in the [execution envelope](../operations/execution-envelope.md), not this ADR.
- Manual initiation makes single-operator availability visible and measurable. It cannot support an unattended availability or freshness claim.
- Immutable, pinned batches prevent refreshes from combining different publication revisions; batch selection becomes an explicit operator step and must be tested.
- Local credentials and report caches require care. No keys, imported cache or sensitive tokens enter source control. Broader existing manager privileges are disclosed, not described as least privilege merely because the intended query is read-only.
- Credential-free CI and manual host checks reduce automation scope; reproducible procedures, executed evidence and release controls remain required.
- Independent fixtures and synthetic provenance permit technical validation while preserving the lack of real company readiness, adoption or ROI evidence.

## Follow-up and reversal triggers

Gate 4 records acceptance of cadence, resource/access/cost bounds and proportionate delivery controls. Run only long enough to demonstrate the complete pipeline and preserve required evidence, then clean up; no 60-day observation is required. Resolve project/region/usage and host/authentication conditions before dependent actions. Gate 5 approves data contracts and thresholds; the first implementation slice then proves the real fixture-to-BigQuery-to-Desktop path before expansion.

Reopen the affected decision if unattended operation becomes necessary, the local host/authentication route is unsupported, required permissions exceed the approved boundary, safe cost/retention limits cannot be met, or report publication/real data is requested. Routine code repairs inside the accepted design do not reopen this ADR. Preserve earlier versions and evidence when changing it.
