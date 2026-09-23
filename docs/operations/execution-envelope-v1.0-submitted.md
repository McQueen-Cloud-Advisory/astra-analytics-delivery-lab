# Proposed execution envelope

Version: **v1.0**. Prepared: **2026-09-20 America/Chicago**. Run: HDG-20260920-01; selected initiative: **OPP-02** under [Gate 3 / DEC-G3-001](../gates/gate-3-project-selection.md). **Proposed for Gate 4; no resource, spending, access-change or implementation approval is recorded here.** Gate 4 approves architecture/design limits; implementation still requires Gate 5 and closure of blocking conditions. All operational controls below are **Not Implemented / Not Verified**.

Latest manager facts supersede the earlier assumption of an existing project: the GCP account/allowance exists, **a project must still be created**, the requested geography is **East US**, none of the approximately **$30/month allowance** is currently used, and Power BI Desktop is installed. These are manager-reported facts, not cloud billing, IAM, regional pricing or host-test evidence. Propose **`us-east4` (Northern Virginia)** as the explicit interpretation of East US, subject to the Gate 4 decision. Exclude the standing ChatGPT Pro subscription and Power BI publishing from project costs.

## Scope, ownership and unresolved bindings

The [architecture](../architecture/solution-architecture.md) proposes an existing local Node runner, direct BigQuery batch loads/transformations, and an **unpublished Desktop Import** report. The manager initiates runs on demonstration days and refreshes the report after successful publication of a fixed analytical batch. This does not promise unattended daily execution or availability. The [Power BI integration proposal](../architecture/power-bi-integration.md) controls connector and host-verification details.

| Binding | Proposed value / current evidence | Required closure |
|---|---|---|
| Environment and endpoint | One dedicated nonproduction lab project; deployed BigQuery data plus locally verified, unpublished Desktop report | Gate 4 architecture decision; Gate 8 later authorizes release |
| Resource and query billing project | **TBD — new project**, exact ID and number not yet established; runner and Desktop must use the same explicitly approved billing project | Record exact project before any project-scoped mutation; observe supported access before Gate 4 approval or expressly amend the prerequisite |
| Billing account and allowance | **TBD account reference**; manager reports approximately $30/month wholly unused | Verify billing linkage, allowance meaning/currency/reset period and current consumption; retain a redacted reference, never credentials |
| Dataset/job region | **`us-east4` proposed**, including work and serving data and all query jobs | Manager confirms interpretation; verify selected-region rates and location before binding the decision |
| Local runtime / report host | Existing Node 24; user About evidence: August 2026 Desktop **2.157.1354.0 x64**, relevant PBIP/TMDL/PBIR flags enabled, normal launch/no error | Build/bitness supplied; C3-02 ready for closure review on documented procedure. Verify actual connector/format behavior in the first slice after Gate 5; legacy ODBC currently disabled |
| Real owner | Human Manager is sole cost, authentication, local-refresh, host-verification and cleanup owner; agent prepares automation and evidence | Manager accepts operating model and available time; no fictitious business staff are assumed available |
| Existing approvals | Gate 3 selects problem/charter and permits architecture preparation only | Gate 4 envelope decision and Gate 5 implementation approval remain required |

The missing identifiers, access/host evidence and regional quote are **open conditions**, not values silently filled by a default. Read-only discovery can continue. Creating a new project or modifying access requires its concrete authorization; the optional bootstrap scope below is a proposal only.

## Financial limits proposed for approval

| Limit | Proposal | Meaning and response |
|---|---|---|
| Planning forecast | **Up to approximately $5/month** for the bounded baseline, before regional-price/tax confirmation | Workload-based estimate below; not a bill or guaranteed maximum |
| Maximum project spending authority | **$10 per calendar month**, USD, including all attributable GCP services and applicable charges | Prospective management limit, not an enforceable Cloud Billing hard cap; pause before reaching it |
| Initial development total and lifetime | **$20 cumulative across the first 60 days from first billable use**, while respecting every $10 calendar-month limit | The limits apply simultaneously; crossing a month boundary does not reset the $20 total |
| Early cost stop | **$8 in a month or $16 cumulative**, or a forecast of exceeding either spending limit | Stop new runs and report refreshes; preserve evidence, review delayed charges and arrange approved cleanup |
| Shared allowance reserve | Require at least **$15 of current monthly headroom** before launch: $10 project ceiling plus $5 reserve | At the reported $30 unused allowance this leaves $15 outside that allocation. Reconcile other usage before launch; reduce/reapprove if headroom shrinks |
| Alerts-only budget | Proposed dedicated-project $10 calendar-month budget with actual thresholds **50%, 80%, 100%** and forecast threshold **100%** | Send to the manager's existing billing notification route; alerts supplement pre-run checks |
| New purchases / standing subscriptions | **No new paid tool/API, hardware, capacity or publication purchase** in this baseline; standing ChatGPT Pro excluded | A newly necessary purchase is a scope/cost decision, not an expense hidden in contingency |
| Beyond the initial 60 days | **No automatic extension** | Review actual cost, continued need, resource lifetime and ownership; obtain continued operating authority or perform approved cleanup |

The approximate $30 allowance is not assumed to be free credits or a hard cap. Compare gross list-price usage before free allowances/discounts so the estimate does not depend on their availability. Capture net billed costs separately. Exact tax, billing currency and allowance treatment remain to be confirmed; lower workload or return for a revised envelope if they consume the reserve.

### Cost model and regional verification

The current official BigQuery pricing page exposes **$6.25/TiB on-demand analysis** and **$0.000031507/GiB-hour active logical storage** in its default Iowa table. These are **reference rates**, not a falsely relabeled Northern Virginia quote. Google's SKU catalog identifies the distinct `us-east4` analysis SKU **5094-D030-92B2** and active logical-storage SKU **645D-4279-C1D2**. Confirm their current prices for the approved billing context before Gate 4 closure. [BigQuery pricing](https://cloud.google.com/bigquery/pricing), [analysis SKU catalog](https://cloud.google.com/skus/sku-groups/data-analytics), [storage SKU catalog](https://cloud.google.com/skus/sku-groups/bigquery-storage)

| Component at the proposed workload | Reproducible reference calculation | Monthly planning amount |
|---|---|---:|
| On-demand queries, all clients combined | 10 GiB/day × 31 days ÷ 1,024 × $6.25/TiB | $1.89 |
| Active logical storage, all lab tables combined | 5 GiB × 744 hours × $0.000031507/GiB-hour | $0.12 |
| Connector read/transfer, metadata/logging, rounding and minor usage contingency | Explicit planning allowance, **not a service quote**; verify actual connector path and regional charges | $2.00 |
| **Modeled subtotal / rounded planning forecast** | About $4.01, rounded upward for planning | **$5.00** |

At the proposed daily custom-quota target of 0.01 TiB, rather than the stricter 10 GiB workflow limit, the same 31-day query calculation is approximately **$1.94**. Neither is an observed monthly bill. The $10 authority ceiling leaves additional room for uncertainty; it is not a target to consume. This bounded architecture estimate refines the earlier broad B1 $2–12 component range without rescoring the fictional company model.

Batch loading through the shared pool does not add an ingestion compute charge; query-result access and Storage Read API operations can have different charging paths. Limit the returned data as well as query scans, and verify the connector path instead of assuming all exports are free. No streaming writes, reservations or cross-region copy are proposed. [Google batch-ingestion explanation](https://cloud.google.com/blog/topics/developers-practitioners/bigquery-explained-data-ingestion), [BigQuery extraction/Storage Read pricing](https://cloud.google.com/bigquery/pricing#data_extraction_pricing)

### Managed alternative — comparison only

A Cloud Run Job plus one Scheduler job could remove dependence on a running local runner. At **31 runs/month, five minutes/run, one vCPU and 0.5 GiB memory**, Tier 1 job list rates yield `31 × 300 × (0.000018 + 0.5 × 0.000002)` = **about $0.18/month**, before free allowances. Northern Virginia is listed in Tier 1. One Scheduler job adds **$0.10 per 31 days** before its free allowance. These are partial modeled components, not the complete alternate-platform price. [Cloud Run pricing](https://cloud.google.com/run/pricing), [Scheduler pricing](https://cloud.google.com/scheduler/pricing)

A staging bucket, image registry, builds, operations, logs and transfers add separate charges and maintenance. A one-GiB Standard bucket would be a small storage component; its selected-region rate and the other charges would need pricing before approval. This alternative introduces additional identities, artifacts, scheduling and cleanup for modest modeled compute cost. It is excluded for simplicity and operating fit, not because evidence establishes a large Cloud Run bill. **Cloud Run, Scheduler, GCS and Artifact Registry are not authorized resources in the baseline.** [Cloud Storage pricing](https://cloud.google.com/storage/pricing)

## Resource, workload and identity limits

| Area | Proposed limit / configuration | Boundary |
|---|---|---|
| Resource classes | One new dedicated project; two named BigQuery datasets, work and serving; normal service-managed query-result storage within the same limits; one keyless pipeline service account; local runner/report files; project budget/quota configuration | Exact names are bound before creation. No VM, always-running service, GPU, scheduler, bucket, paid reservation, BI Engine, ML/model API or external source connector |
| Data / uploads | Initial independently expected fixture first; normal generated profile at most **100,000 total source-event rows** and **100 MiB per batch upload** | Exact contracts/fixture values come at Gate 5; these are workload maxima, not required scale or realism claims |
| Storage | **5 GiB active logical storage total**, including work, serving, retained batches and incidental lab tables; proposed logical billing model | Pre-load projected-size check and daily metadata review. No native total-storage quota is claimed |
| Query bytes | **10 GiB billed per day** across pipeline, metadata SQL, tests, previews and Desktop; **1 GiB `maximumBytesBilled` per runner query**, including child statements where applicable | Dry-run and check aggregate projected runner usage **≤2 GiB per attempt**; retain actual job bytes. Avoid uncapped multi-statement paths until their coverage is verified |
| Daily quota safeguard | Request dedicated-project on-demand query quota **0.01 TiB/day**; inspect accepted granularity/effective value | All project users are affected. No silent rounding up to a materially larger value; unsupported limit returns for a revised control decision |
| Frequency / concurrency | **One active pipeline attempt**, at most **three cloud attempts/day including retries**, and at most **two Desktop refresh attempts/day including retries** | Manual initiation on demonstration days; no unattended refresh/schedule. Daily byte/spend limits take precedence |
| Report/read volume | Serving import targeted at **≤25 MiB/refresh**, total connector/read/result traffic **≤3 GiB/month** | Includes retries and previews; verify with actual job/connector evidence, not just PBIP file size |
| Pipeline identity | Keyless service-account impersonation where supported; project `roles/bigquery.jobUser`, dataset-scoped `roles/bigquery.dataEditor` on only work/serving | Human bootstrap authority remains separate. No project-wide data editor, owner/admin runtime grant or downloaded key |
| Report identity | Manager Google sign-in; serving-dataset `roles/bigquery.dataViewer`, project Job User; Read Session User only for the approved Storage API path | Keep explicit billing project. Inspect denied permissions; do not respond by granting BigQuery Admin |
| Credentials / data exposure | Existing local credential mechanisms; no tokens, account keys, personal source data or settings in Git/evidence | Only synthetic or suitably licensed public inputs; report remains unpublished |

Google's predefined roles separate project job execution, dataset data access and read sessions. Role names do not establish effective access; inspect the actual bindings and connector behavior before declaring the path verified. [BigQuery IAM roles](https://docs.cloud.google.com/bigquery/docs/access-control)

**ADBC temporary-resource boundary:** the proposed baseline does not permit the report identity to create datasets or write serving tables. The small V2 Import proof must avoid an unexpected large-results path. If the installed connector requires `_bqadbc_temp_tables` or another destination dataset, stop. The supplied Desktop flags show legacy ODBC disabled, so a V1/REST fallback is not established as available: first confirm installed-build support and obtain the explicit decision for any required toggle and bounded attempt. Otherwise return for an amendment naming the temporary dataset, matching region, least permissions, expiration and cost. Do not silently add an ephemeral-resource exception. Any subsequently approved temporary storage/queries count inside the same limits. See the [integration proposal](../architecture/power-bi-integration.md).

## Control coverage and verification

| Control | Enforcement or alert? | Coverage and gaps | Required retained evidence |
|---|---|---|---|
| Runner `maximumBytesBilled` and dry-run preflight | Server rejects over-limit on-demand queries when the setting is applied; runner also refuses excessive aggregate estimates | Applies to submitted query configuration, not all storage/read/network charges. Does not automatically cover Desktop-generated queries. `LIMIT` alone is not a scan-cost control | Job configuration, deliberately over-limit dry-run/query test within the later authorized fixture, and actual billed-byte evidence |
| Project custom daily query quota | Service-side on-demand safeguard; **approximate**, not a strict dollar/byte guarantee | Aggregates project query users, resets at midnight Pacific Time; other billing projects can bypass this scope. Does not cover storage, read traffic or all other services | Configured/effective limit and explicit billing-project evidence for runner/Desktop; test only after permitted implementation |
| Explicit billing project and narrow datasets | Scope/access control | Prevent accidental default-project billing and restrict readable data; neither is a monetary ceiling | Sanitized connection/configuration plus job project/location and IAM evidence |
| $10 alerts-only budget | **Notification only** | Cost reporting and alerts lag usage; scope must include all project services. No automatic stop is supplied by the alert | Budget scope/thresholds, manager notification route and response procedure |
| Storage/upload/refresh/retry limits | Local checks and manual operating rules; only verified checks can be called enforced | Can be bypassed by another client/operator; metadata/billing visibility can lag. Failure to observe required evidence stops new work | Input size, retained table sizes, run/refresh counter, projected and actual cost ledger |
| Retention/expiration and cleanup | Service expiration where configured; otherwise a named human/agent procedure | Existing retained storage can continue to accrue charges after queries stop; cancellation does not reverse incurred charges | Bound resource manifest, expiry settings, deletion/retention evidence and subsequent billing review |

Maximum-bytes validation rejects estimated over-limit queries before charging, while clustered-table estimates can overstate actual bytes. [Query cost controls](https://docs.cloud.google.com/bigquery/docs/best-practices-costs) Custom quotas are explicitly documented as approximate and apply to on-demand query usage; they do not individually target one chosen user. [Custom query quotas](https://docs.cloud.google.com/bigquery/docs/custom-quotas) Alerts-only budgets do not cap spending and billing reports can lag. [Budget alerts](https://docs.cloud.google.com/billing/docs/how-to/budgets)

**Current spend-cap feature check:** Google now documents **Preview spend-cap budgets**, limited to one project and one eligible service. The listed services are Gemini API, Agent Platform, Cloud Run and Cloud Run functions; **BigQuery is not listed**. Even eligible services can incur in-flight/latency overages, and persistent-resource costs remain. Therefore this BigQuery-first design claims **no project-wide monetary hard cap**. A Cloud Run spend cap would not protect BigQuery, storage or the complete alternative architecture. [Spend-cap eligibility and limitations](https://docs.cloud.google.com/billing/docs/how-to/budgets-spend-caps)

The manager's acceptance must acknowledge the residual gap between workflow limits and delayed billing. No control is currently configured. After later authorized setup, verify configuration before the first charged query; verify behavior on the minimal fixture before broad implementation.

## Retry, effort and stop rules

- A failed cloud attempt permits at most **two targeted repair/retry attempts**, still within the three-attempt daily count. Poll a known job ID before resubmitting uncertain work; do not duplicate a possibly successful load. Retry transient failures only; authentication, permission, quota or cost-boundary failures stop the affected path.
- Allow at most **60 minutes of active agent diagnosis per blocking issue** or **two repair iterations**, whichever comes first, before presenting the concrete blocker and proposed next step. Exclude approval waits from this clock; instrument it when work begins. This is a proposed future effort bound, not a fabricated observation.
- Preserve the current **5–12-hour human forecast** as a forecast. Reforecast if setup/authentication exceeds **two human hours**, total requested human work would exceed **12 hours**, or continued routine ownership exceeds **one hour/month**. No automatic unpaid extra staff are assumed.
- Before each working session, check remaining byte/run/spend/lifetime bounds, latest available billing data and known unreported usage. If cost evidence is unavailable or over **48 hours** stale, pause chargeable work until the manager reviews the gap. Review daily during active cloud work and weekly while stored resources remain.
- Stop new work at the early cost threshold, an unsupported region/identity/resource request, unexpected service/SKU, storage/read-volume limit, a failed publication/reconciliation, or evidence that the next action could exceed a bound. Keep the last accepted batch/report available as explicitly stale; no partial batch is published.

To stop, prevent further local invocations and Desktop refreshes, record pending job IDs, and cancel active lab jobs where supported within the authorized identity. Cancellation may not prevent already incurred query charges. Preserve sanitized diagnostics and the resource manifest; then remove expired/unneeded lab resources within the approved cleanup scope. Never disable billing for unrelated resources or delete an account/project merely to respond to an alert.

## Retention, lifetime and cleanup proposal

| Resource / record | Proposed retention / owner | Cleanup boundary |
|---|---|---|
| Cloud raw/work data | At most **14 days**; manager owns, agent implements approved expiration | Retain only the bounded test/replay history; raw batches are reproducible from pinned source/seed |
| Cloud serving batches | At most **30 days**, within the 5 GiB aggregate cap | Preserve a currently referenced accepted batch until report evidence is retained, then explicitly replace/remove it; no indefinite history |
| Incidental/temporary lab tables | At most **24 hours** where explicitly approved; baseline permits no new report-created dataset | Matching region, expiry and identity are required before any exception |
| Local sanitized fixtures, manifests and evidence | Repository evidence retained; generated large/cache files excluded | Preserve existing user Power BI artifacts. No credential/cache directories are cleanup targets |
| Cloud resource lifetime | **60 days from first billable use**; no automatic continuation | Before expiry, choose approved retention/continued operation or remove lab tables/datasets and lab-only bindings/resources |

Create a manifest at the first later-authorized mutation with exact project ID/number, region, dataset/table/service-account identifiers, purpose, creation time, expiration, owner and decision reference. Before removal, verify identifiers against that manifest and the approved dedicated project. Proposed cleanup covers only created lab tables/datasets and lab-specific identity bindings/service account; **project deletion or billing-account changes require separately named authority**. Record completed versus failed removals and check for residual charges. A cleanup plan is not evidence that resources have been removed.

## Optional bootstrap before Gate 4 closure — separate decision required

Because the project does not exist, the approved C3-01 prerequisite cannot be represented as closed from account existence alone. A manager may explicitly authorize this **bounded bootstrap only**, identifying the exact project ID candidate and billing account reference before mutation:

1. Create at most **one dedicated project**, link the identified existing billing account, and enable **BigQuery API only** if required for metadata inspection. No source data, dataset, table, job, load, query, report refresh, user-managed service account/key or paid compute/storage resource is created by this bootstrap. Record any normal Google-managed service identity produced by API enablement; unexpected access/resource requirements stop the attempt.
2. Use the manager's existing authorized administrative identity; perform metadata-only checks of project, billing linkage, enabled services, relevant current IAM/quota visibility and region options. No self-granted or broad new IAM role, public access or credential export.
3. Bound the attempt to **30 human minutes, 60 active agent minutes and two attempts**, with **$0 authorized billable workload**. Stop on any requested charge, resource or permission expansion. Preserve the created project's identity and partial results; do not create replacement projects automatically.
4. Return the concrete evidence and unresolved items to Gate 4. This is account/project preparation, not an end-to-end feasibility proof or authorization for implementation. If abandoned, present the exact empty project for a separate retain/delete decision.

**No bootstrap authorization is recorded in this envelope.** The manager's actual decision must specify this scope separately; ordinary Gate 3 approval does not supply it. The current [capability inventory](../environment-readiness.md) has no usable GCP connector/CLI or computer-control path for this setup, so the immediate execution path would be the manager's own console action or a newly established authorized tool route. Approval alone would not make an unavailable tool usable. The minimal data-to-BigQuery-to-Desktop proof remains after Gate 5 unless a separately bounded spike is explicitly authorized.

## Decision and observation record

| Field | Current state |
|---|---|
| Envelope revision / actual approval | v1.0 proposed / **None** |
| Exact target/billing identifiers / region price confirmation | **Unresolved** |
| Bootstrap decision / action | **Not authorized here / Not executed by this record** |
| Query/control/refresh verification | **Not Run** |
| Cloud resources or actual attributable charges | **Not observed by this record** |
| Next required authority | Concrete bootstrap decision if used; completed C3 prerequisite evidence; Gate 4 architecture/envelope approval; Gate 5 implementation approval |

Revisions to services, target, identities, permissions, region, spend, workload, retries, lifetime or cleanup scope return to the affected decision **before** dependent action. Detailed runbook and release records are created in their later phases rather than marked complete here.
