# Gate 4 — Architecture decision

Decision record: **v1.1**, 2026-09-21 America/Chicago. Run: HDG-20260920-01. Status: **Approved with Conditions**. Decision owner: Human Manager. The exact [submitted v1.0 package](gate-4-package-v1.0-submitted.md) is preserved; its recommendations are accepted with a shorter, evidence-driven experiment lifecycle.

## Actual management decision — DEC-G4-001

The manager's conversation instruction is the approval source; exact message timestamp unavailable:

> I logged into gcloud through the terminal. We should be able to build out everything from there now. A new billing account may be needed. If so, don't attempt to create it. I will do so manually. Architecture looks fine, but we will only run this experiment long enough to demonstrate a working ingestion/processing/reporting pipeline. I imagine building that evidence will not take 60 days.

Subsequent explicit exclusion:

> financial-analytics-demo is deprecated and should not be used.

Record this as architecture acceptance and authority for bounded project setup using existing billing. **Do not request those approvals again.** The shorter lifecycle supersedes the proposed 60-day resource horizon. No new billing-account creation is authorized. This does not approve an unseen analytics baseline or expressly waive Gate 5.

C3-01/C3-03 are not claimed complete. In light of the manager's explicit architecture acceptance and direction to progress setup, carry them as **blocking conditions before dependent cloud implementation**, while proceeding with Phase 5 documentation. This is the recorded interpretation of the current decision, not a claim that login resolves billing, pricing or runtime access. C3-02 closes on supplied host/version evidence and the accepted human-verification procedure; actual report behavior remains untested.

## Accepted architecture and management choices

Use a **local operator-initiated Node runner → BigQuery work/serving datasets → unpublished Power BI Desktop Import report**. Pin one immutable published batch across report tables and publish only after independent validation. Use **`us-east4` (Northern Virginia)** for later datasets/jobs, the package's explicit interpretation of East US. The [architecture and diagram](../architecture/solution-architecture.md), [ADR-001](../decisions/adr-001-lab-architecture.md), [integration procedure](../architecture/power-bi-integration.md) and [envelope v1.1](../operations/execution-envelope.md) provide the design.

| Accepted decision | Scope and tradeoff |
|---|---|
| **D4-01 — Cadence and delivery** | Operator initiates updates on active demonstration days and refreshes Desktop. No unattended daily service; visible source-as-of/stale state remains required |
| **D4-02 — Resources, access and costs** | Dedicated lab target, us-east4, scoped keyless runtime and bounded workloads. Retain **$10/calendar-month** and **$20 total experiment** ceilings, with $8/month and $16 total early stops. These are authorities conditional on readiness and Gate 5, not spending targets or hard billing caps |
| **D4-03 — Delivery controls** | Credential-free CI, versioned resource configuration, repeatable local apply/release and manager Desktop verification. Executed evidence is required; workflow/report files alone do not pass |
| **Lifecycle amendment** | Run only long enough to demonstrate and retain required ingestion, processing, reporting, rerun/recovery evidence. Preserve accepted outputs and promptly clean up chargeable lab resources; no 60-day run or minimum observation period |

The envelope's **seven active cloud-working days / day-14 stop-and-review** and shorter table-retention settings are new **agent proposals**, not exact durations supplied by the manager. Include them in Gate 5 review before chargeable resources. They are outer safeguards, not a reason to keep resources after evidence is complete. The $5/month reference forecast is a normalized comparison; regional pricing and actual short-run costs remain to be verified.

Cloud Run/Scheduler/GCS, always-on compute, DirectQuery and a wholly local endpoint remain alternatives, not selected scope. The submitted package retains their comparison. Existing ChatGPT Pro and report publication remain excluded. Keyless access, explicit targets, independent fixtures, immutable batches and visible freshness preserve meaningful engineering without additional infrastructure.

## Setup and remaining conditions

[Sanitized bootstrap evidence](../evidence/cloud-bootstrap.md) records observations:

- Verified Cloud SDK **585.0.0**, BigQuery CLI **2.1.38**, active CLI login and metadata access.
- Created **`astra-po-lab-20260921`**, number **329955978985**, at **2026-09-21T09:39:31.233Z**; lifecycle ACTIVE.
- One open existing billing account was visible. Linking failed with **`FAILED_PRECONDITION: Cloud billing quota exceeded`**. Re-read confirms **billing disabled, no billing link**. No billing account was created.
- Creator has the normal direct **Owner** setup role. This is broad setup access, not scoped runtime access. An ADC file exists; contents/usability were not tested. Dataset listing returned no datasets.
- Project creation enabled Google's normal API bundle, including BigQuery. No dataset, load, query job, custom runtime identity, report refresh or paid workload was created. The deprecated project was not modified or used as a workload/quota target.

| Condition | Status and due point | Owner / next action |
|---|---|---|
| **C3-01 — Cloud path** | **Partial; billing blocked.** Project and CLI metadata route verified. Scoped Node runtime and connector remain untested | Manager resolves billing quota or manually links another account; agent verifies linkage and runtime before dependent cloud work |
| **C3-02 — Desktop path** | **Closed for architecture readiness**: August 2026 2.157.1354.0 x64, format flags, normal launch and manager-verifier procedure | Actual PBIP/connector/calculation/refresh proof after Gate 5. Legacy ODBC fallback is not silently enabled |
| **C3-03 — Cost/effort envelope** | **Limits accepted; verification open.** Regional rates, account/headroom and budget/quota controls unverified | Close before billable work. Billing quota failure does not establish exhausted dollar allowance; no monetary hard cap claimed |
| **C3-04 — Contracts and independent results** | Phase 5 package in preparation; approval due at Gate 5 | Agent prepares concrete contracts/fixtures/acceptance plan; manager decides material analytics definitions |

Do not create another project to bypass the billing failure. Google supplied a [billing quota request route](https://support.google.com/code/contact/billing_quota_increase); the manager may resolve that account or manually establish another usable account. Do not unlink, repurpose or change unrelated projects. Full billing identifiers/credentials stay out of repository records.

## Authorized next work and next boundary

Continue Phase 5 contracts, independent expected fixtures and implementation/acceptance planning. Complete read-only readiness checks and the already-authorized existing-billing link when the manager resolves quota. Product implementation still requires **Gate 5**, under the [analytics-baseline approval instruction](../../prompts/astra-analytics-delivery-master-prompt.md#gate-5--analytics-design). No data-to-report feasibility spike or gate waiver is inferred.

Gates 6–9 remain. Observation is a bounded sequence: initial load, subsequent/corrected load, replay, failed publication/recovery, real Desktop verification, authorized release checks and acceptance. Cleanup follows evidence preservation and the approved manifest.
