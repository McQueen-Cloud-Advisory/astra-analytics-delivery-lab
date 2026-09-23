# Power BI integration and verification proposal

Version: **v1.1**. Researched: **2026-09-20 America/Chicago**. OPP-02 architecture input after [Gate 3](../gates/gate-3-project-selection.md); **accepted at Gate 4, not implemented or host-verified**. Existing `powerbi-files/` artifacts were read without modification. The integration review performed no credential changes, queries, refreshes, installations or report edits; separate project bootstrap results are linked below.

Latest setup: dedicated `astra-po-lab-20260921` exists, but billing linkage failed on account quota; see [bootstrap evidence](../evidence/cloud-bootstrap.md). Deprecated `financial-analytics-demo` is prohibited as a source/billing/quota target. The requested geography is East US and the approximately $30/month allowance is unused. User-supplied Desktop diagnostics identify **August 2026, version 2.157.1354.0, x64** and the relevant project-format options below. These narrow the host-version uncertainty without proving runtime identity, report open or connector behavior. `us-east4` (Northern Virginia) is the accepted Gate 4 region baseline; no dataset location is inferred from a connector default. [Google location reference](https://docs.cloud.google.com/bigquery/docs/locations)

## Recommended connection and ownership

Use **Import into the unpublished Power BI Desktop report**, with an explicit billing project and pinned connector implementation. Import queries a local cached model between refreshes; DirectQuery sends model queries to its source. Import data remains as current as its last refresh. [Microsoft model modes](https://learn.microsoft.com/en-us/power-bi/connect-data/service-dataset-modes-understand)

**Design judgment:** Import fits the small, daily PO review and gives the manager predictable occasions to consume cloud resources. Refresh only after a successful analytical batch; pin one immutable batch identifier across every imported table so concurrent publication cannot mix batches. Retain separate source-as-of and report-refresh timestamps. A manually refreshed local report does not promise unattended daily report freshness. DirectQuery adds source queries during interaction without a near-real-time requirement. Neither mode guarantees a dollar cap; development previews, refreshes and retries still need the execution envelope.

Microsoft supports both modes and Google-user or service-account authentication. Prefer the manager's Google-user sign-in through Desktop; service-account login instead needs JSON key material. V2 uses ADBC, was introduced in May 2025 and requires 64-bit Desktop. `BillingProject` avoids selecting an arbitrary available project. Storage API use defaults on. Documented limitations include unsupported proxy/relationship features, a DirectQuery `DateTime` issue and materialized views absent from Navigator. [Microsoft BigQuery connector](https://learn.microsoft.com/en-us/power-query/connectors/google-bigquery)

Proposed connection shape, **not an executed query**:

```text
GoogleBigQuery.Database([BillingProject = "<approved-project-id>", Implementation = "2.0"])
```

The current migration guidance recommends the current Desktop release; explicit `Implementation="2.0"` pins ADBC rather than relying on changing defaults. The connector article still describes a preview toggle, so record the actual build and available options instead of asserting one universal UI. Microsoft currently plans legacy ODBC removal from future Desktop/gateway distributions in spring 2027. Dates remain planned. [Microsoft ADBC migration](https://learn.microsoft.com/en-us/power-query/transition-to-adbc)

**V2 feasibility condition:** the first permitted proof must work within approved read/query permissions, region and resource allowlist. Do not assume ADBC's host behavior matches every driver default. The supplied diagnostic shows **`PBI_googleBigQueryLegacyOdbcVersionEnabled` disabled**, so legacy ODBC is **not an available fallback established by current evidence**. A possible `Implementation="1.0"` Import / `UseStorageApi=false` fallback first requires evidence that the installed build supports it and an explicit management decision covering any necessary feature toggle, the same identity/serving inputs and bounded attempts. Do not assume setting M alone overrides the disabled flag or recommend a toggle as an unexplained error fix. Unsupported fallback or required extra resources returns to the architecture decision. Neither path has been tested.

The manager owns interactive authentication, local refresh and host verification; the agent prepares files and test instructions. Keep credentials in the host's credential mechanism, never M source, Git or evidence. No service publication, Fabric workspace, gateway, hosted schedule or service-account key is proposed. A separately required identity/purchase/access expansion returns to the applicable authority.

## Permissions, location and connector limits

The driver documents query-job permissions (`bigquery.jobs.create/get/list`), data reads (`bigquery.tables.getData`) and read sessions (`bigquery.readsessions.create/getData`). Microsoft additionally lists `bigquery.readsessions.update` for its Storage API path. Confirm least-privilege coverage for the installed connector rather than granting broad administrator access. Some environments also require Service Usage Consumer permissions. [ADBC driver permissions](https://github.com/apache/arrow-adbc/tree/main/csharp/src/Drivers/BigQuery#permissions), [Microsoft Storage API requirements](https://learn.microsoft.com/en-us/power-query/connectors/google-bigquery#unable-to-authenticate-with-google-bigquery-storage-api)

The proposed report-user grants are dataset-scoped `roles/bigquery.dataViewer`, project `roles/bigquery.jobUser`, and project `roles/bigquery.readSessionUser` for the Storage API route. Read Session User includes create/getData/update; Job User does not itself enumerate all permissions listed by the driver. Validate access to the user's own jobs and inspect any denied call before proposing narrowly scoped additions. No BigQuery Admin or dataset-create permission is proposed for routine report use. [Google predefined permissions](https://docs.cloud.google.com/bigquery/docs/access-control)

ADBC's driver-level `allow_large_results` defaults false. When the large-result path is active, it may use/create a destination dataset, including `_bqadbc_temp_tables`; its destination must match the source region. Dataset-create permission is conditional on needing a new destination. **Proposal:** keep this small import outside that path, subject to proof of the installed connector's behavior. Do not silently authorize dataset creation or an unexpected region to fix an error. If temporary resources are required, use the expressly approved bounded fallback or amend the envelope with exact region, retention, permissions and cost before proceeding. [ADBC large-result behavior](https://github.com/apache/arrow-adbc/tree/main/csharp/src/Drivers/BigQuery#large-results)

Do not rely on connector-generated relationships. Define any model relationships explicitly at Gate 5 and test filter behavior in the host; the connector's brief relationship limitation does not itself establish the behavior of the eventual local model. Avoid nested serving fields and materialized-view navigation dependencies unless justified. Permission failures, type conversions and repeated-query behavior are proof outcomes to inspect, not assumed successes.

## Existing files and supported authoring boundary

| Observed local artifact | Read-only finding |
|---|---|
| `placeholder-report.pbip` | Version 1.0; points to the report folder |
| `placeholder-report.Report/definition.pbir` | Version 4.0; relative `byPath` reference to the local semantic model |
| `Report/definition/version.json` | PBIR definition version 2.0.0; report schema 3.3.0, page schema 2.1.0 |
| `SemanticModel/definition.pbism` | Version 4.2; TMDL folder present |
| `definition/database.tmdl`, `model.tmdl` | Compatibility 1606; culture/options only, no business tables, partitions, relationships or BigQuery connection |

These file-format numbers do not identify the Desktop build. The manager subsequently supplied diagnostic evidence identifying **August 2026 / 2.157.1354.0 / x64**; enabled flags are `PBI_gitIntegration`, `PBI_tmdlInDataset`, `PBI_enhancedReportFormat` and `PBI_enhancedReportFormatPBIX`. This supports version/bitness and configured-format availability. The manager clarified that the information came from About after a normal Desktop launch, **with no error**, and was not a placeholder-opening attempt. The diagnostic labels Frown (Error) and model Empty therefore do not establish an application failure or a project-open result. No error blocker remains from those labels.

Earlier registry/Appx/common-path probes did not locate its build. During root preflight, the native helper imported successfully but app enumeration failed with an unavailable native pipe (OS error 2); browser control reported no browser available. These observations establish that the current automation path is unavailable, not that all native APIs or the user's installation are absent. See [environment readiness](../environment-readiness.md). Only the task-relevant diagnostic fields above are retained; user/session identifiers, trace paths and unrelated telemetry are excluded.

Microsoft still documents **PBIP as preview**, enabled through Desktop options. External TMDL editing is supported, while some layout/legacy files are not. PBIP-to-PBIX conversion requires Desktop's Save As; a generated text project is not a verified binary report. Microsoft also warns about Windows path length and save failures in locally synced OneDrive folders. [PBIP overview and limitations](https://learn.microsoft.com/en-us/power-bi/developer/projects/projects-overview)

PBIR under `Report/definition/` supports external, schema-conforming JSON edits; this differs from unsupported edits to the root PBIR-Legacy `report.json`. `definition.pbir` version 4.0 or above accepts the PBIR folder representation, and `byPath` opens the model locally. PBIR remains documented as preview; conversions require preserving a recoverable copy. [Report formats and editing](https://learn.microsoft.com/en-us/power-bi/developer/projects/projects-report)

`definition.pbism` version 4.0 or above permits TMDL. Microsoft documents the TMDL project preview option and warns conversion from TMSL cannot be reversed through that upgrade flow. The semantic-model article requires reopening for external changes, whereas newer overview guidance describes change detection. Use close/edit/reopen as the conservative repeatable workflow and record the actual build's behavior. [Semantic-model format](https://learn.microsoft.com/en-us/power-bi/developer/projects/projects-dataset)

**Proposal:** retain the existing PBIP/PBIR/TMDL formats without upgrading or replacing the user's starting artifacts now. In approved implementation, use short object names, UTF-8 without BOM, schema validation and explicit host reopen/refresh checks. This repository is under OneDrive: coordinate a single writer and preserve a clean copy before host saves; a short nonsynced staging location, if needed, requires an established allowed path and synchronization procedure. Do not move the repository or assume current save compatibility.

## Human checks and gate placement

| Due point | Required action and retained evidence |
|---|---|
| **At Gate 4 review** | Version/bitness, normal Desktop launch, configured-format flags, official format support and the approved manager-verifier procedure make **C3-02 sufficient for architecture readiness**. Do not add an empty-project-opening prerequisite to the original condition. Gate 4 records readiness closure; cloud runtime identity/billing remain separate conditions. No project-open, refresh/query or integration success is implied. |
| **After Gate 5, before broad build-out** | On one approved fixed fixture, manager opens the prepared proof project, signs in to the approved Google account, uses the approved billing project/Import connection, and refreshes. Agent/human retain sanitized job/refresh evidence, implementation/build, data version, totals and any failure. Reopen and repeat refresh; reconcile independent expected values and check at least one filter/relationship if present. Inspect actual permissions, region, bytes and connector-created resources. No automatic permissions expansion or unlimited retries. |
| **Gate 6 review** | Present executed minimal connection/calculation/refresh proof and unresolved failures. A screenshot alone does not prove data freshness or correct query billing; generated files alone prove none of these. |
| **After Gates 6–7** | Complete only the approved report; verify agreed totals/filter contexts, navigation, stale/invalid-data display and accessibility in Desktop using the same named human verifier. |
| **After Gate 8 release authorization** | Verify the exact local report/backend revision and repeat the agreed smoke/refresh checks; keep the report unpublished. Record rollback/recovery and actual ownership. |

Exact KPI definitions, expected values, refresh targets and thresholds belong to Gate 5. With the current native helper unavailable, the manager performs the required host actions. **Do not request the already supplied version or resolved diagnostic context again.** C3-02 is closed for architecture readiness under Gate 4; actual format opening and connector/refresh proof remain after Gate 5. If that proof fails, retain diagnostics and return to the affected architecture/endpoint decision rather than claiming completion from metadata.
