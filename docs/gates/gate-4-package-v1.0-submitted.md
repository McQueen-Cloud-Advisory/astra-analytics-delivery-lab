# Gate 4 — Architecture review

Package: **v1.0**. Prepared: **2026-09-20 America/Chicago**. Run: HDG-20260920-01. Gate status: **In Progress**. Recommendation and design are prepared; **readiness conditions remain open, so full Gate 4 approval is not yet ready**. Decision owner: Human Manager. No architecture, setup, spend or implementation approval is recorded here.

Authority: [Gate 3 / DEC-G3-001](gate-3-project-selection.md) selects **OPP-02** and approves **charter v1.1 unchanged**, including C3-01/02/03 before Gate 4 approval and C3-04 before Gate 5. The manager chose substantive design/business decisions with controlled cost, and the greater hypothetical value of OPP-02 over OPP-01. The design below preserves that intent without adding services merely to make the experiment complicated.

## Recommended architecture

Use a **local Node batch runner → BigQuery work/serving datasets → unpublished Power BI Desktop Import report**. A versioned synthetic source, independent expected cases, controlled event reconciliation, idempotent runs and immutable published batches provide the non-trivial engineering work. Pin one published batch across all report imports to prevent mixed-version refreshes. Propose a new dedicated project in **`us-east4` (Northern Virginia)** as the explicit interpretation of “East US”; the final project ID, exact region and billing linkage remain to be confirmed.

The [architecture and diagram](../architecture/solution-architecture.md#components-and-trust-boundaries), [ADR-001](../decisions/adr-001-lab-architecture.md), [execution envelope](../operations/execution-envelope.md) and [Power BI integration note](../architecture/power-bi-integration.md) form this decision package. All are proposals, not executed tests.

The manager reports Power BI installed and the approximately $30/month GCP allowance unused. The target cloud project is **not yet created**. Current agent tools have no working GCP CLI/connector or browser connection; the native desktop helper is unavailable. The [capability record](../environment-readiness.md) distinguishes these observations from the user's reported installation/account availability.

## Three decisions for management judgment

| Decision | Recommendation | Meaningful tradeoff |
|---|---|---|
| **D4-01 — Operating cadence and delivery approach** | Local operator-initiated backend update once on each active demonstration day, then Desktop Import refresh; credential-free CI, repeatable local apply/release and human host verification | Small cloud footprint and explicit ownership, but no unattended daily freshness when the sole operator is absent. This daily-lab interpretation needs an explicit decision; choose and re-cost managed scheduling if unattended backend updates are required |
| **D4-02 — GCP, access and retention envelope** | Proposed approximately $5/month workload forecast, $10/month project authorization ceiling and $20 cumulative first-60-day development ceiling, with earlier stop thresholds; dedicated eastern-US project and scoped keyless access | Leaves allowance headroom and tests real cloud behavior at small scale. Forecast, authority ceiling and enforceable controls are distinct. Exact regional rates and actual targets must be verified; no full dollar hard cap is claimed |
| **D4-03 — Proportionate delivery controls** | Credential-free automated CI validation, versioned declarative resource definitions and repeatable local apply/release, with human Desktop checks | Avoids hosted cloud credentials and a separate infrastructure platform, while retaining automated checks and traceable execution. Accept the one-person ownership and manual host/release limitations; generated files or a workflow definition alone cannot pass verification |

The detailed technical settings support these decisions; they are not a request to approve every table or API call. Exact PO promise/cancellation/receipt meaning and test expectations are deliberately reserved for Gate 5. Proposed exceptions are the operator-dependent cadence, human Desktop verification, credential-free CI with authorized local deployment, and lightweight declarative resource definitions rather than a separate infrastructure platform. Correctness, security checks, traceability and all remaining gates still apply. **Before these decisions can close Gate 4, the separately bounded setup action below must establish the missing project/access evidence.** A setup response is not Gate 4 approval.

## Costs, risks and alternatives

The envelope proposes a gross workload estimate near **$5/month** without relying on free allowances. Its pricing basis and unresolved regional confirmation are explicit. The proposed **$10/month** project limit and **$20 cumulative development** limit are stricter than the manager's approximately $30/month allowance; they are requests for later authority, not current permission or guaranteed billing stops. Pause thresholds, query/storage bounds, retention and cleanup address overshoot risk. Standing ChatGPT Pro and report-publication purchases remain excluded.

| Alternative | Why it remains available / why not the default |
|---|---|
| Cloud Run Jobs + Scheduler + Cloud Storage | Provides unattended backend scheduling, but adds container/registry, identities, staging and retry/retention ownership. It does not refresh the unpublished Desktop report automatically. Select only if that additional operation has a required benefit |
| DirectQuery | Adds source queries during report interaction; the daily small-lab workflow does not presently need that behavior. Import trades immediate source freshness for controlled refresh occasions |
| Always-on VM or orchestration platform | No identified requirement justifies continuous runtime administration |
| Entirely local analytics | Lower cloud burden but changes the approved deployed GCP/BigQuery endpoint and would require an explicit affected-gate change |

Security implications: keep credentials out of Git, use separate setup/runtime authority and scoped keyless runtime credentials, and inspect effective user privileges. ADBC may require read-session permissions or unexpected temporary resources; do not broaden permissions or cross regions to cure a failure. The integration note proposes a bounded legacy Import fallback for consideration, with a recorded migration risk; neither path has passed a host test.

Operational implications: a failed candidate batch leaves the previous published batch intact; immutable batch selection makes report consistency testable. Visible source-as-of/stale state prevents an absent operator from looking like a successful refresh. Retention and rollback are bounded, and synthetic reconstruction is not a substitute for retained evidence. Maintainability comes from one runtime, a small service footprint, locked dependencies and versioned configuration, with executed CI/cloud/host evidence required later. The architecture's engineering-principles table covers security, TDD, DevSecOps, CI/CD, applicable Twelve-Factor principles, UX and accessibility.

## Readiness conditions and next steps

| Condition | Current evidence | Remaining closure / owner |
|---|---|---|
| **C3-01 — Cloud path** | GCP account and unused allowance reported; target project still absent. Node available; `gcloud`/`bq` not found, no GCP connector/browser route | Manager identifies/creates one dedicated project under explicit setup authority, attaches existing billing, and establishes supported authenticated metadata access. Record exact target and effective permissions without credentials. No company-data or query proof required at this point |
| **C3-02 — Desktop path** | User About evidence identifies August 2026 2.157.1354.0 x64 and enabled PBIP/TMDL/PBIR flags; normal launch/no errors confirmed. Legacy BigQuery ODBC flag disabled. Manager is approved verifier | **Ready for closure review at Gate 4** with the documented human verification procedure and explicit decision on any compatibility fallback. No extra preliminary empty-project test required; actual format/connector/end-to-end proof remains after Gate 5 |
| **C3-03 — Cost/effort envelope** | Approximately $30/month unused per manager; concrete narrower limits proposed | Verify exact regional price basis, billing/allowance scope and targets; manager decides envelope/cadence and accepts human setup/verification burden. Record what controls actually cover |
| **C3-04 — Contracts/expected cases** | Architecture separates raw events, validated state and published batches | Agent prepares exact schemas, business rules and independent expected outcomes after Gate 4; manager approves at Gate 5. Not due for closure at Gate 4 |

For the immediate setup step, use the [bounded bootstrap proposal](../operations/execution-envelope.md) as the authority boundary. Suggested project display name is **Astra PO Lab**, with an available `astra-po-lab-...` project ID under the manager's existing account. Do not create a new billing account, enroll in paid services, upload data, change unrelated projects or grant broad roles. The project ID must be recorded before any subsequent target-specific action; billing-account identifiers and credentials need not be pasted into chat or the public repository. Google documents project creation and existing-billing permissions in its [project guide](https://docs.cloud.google.com/resource-manager/docs/creating-managing-projects).

Because no working browser/cloud-authentication surface is available to the agent, the manager must perform the console setup or make a supported authenticated CLI path available. If local Google Cloud CLI setup is needed, use the [official Windows installation guidance](https://docs.cloud.google.com/sdk/docs/install-sdk); installation/login are not performed by this package. Keep credentials local and provide only project ID, billing-linked confirmation and sanitized readiness results. Desktop version/bitness and normal launch have now been supplied; no further host-identification question is pending. Region belongs to the resource/job configuration; an empty project does not itself prove a regional deployment.

**Approval sequence:** complete or explicitly authorize the bounded prerequisite setup; retain its evidence and close C3-01/02/03; then record the actual Gate 4 decision on architecture/envelope. Do not infer full Gate 4 approval from a bootstrap response, and do not silently move these prerequisite conditions to Gate 5. Gate 4 approval authorizes detailed data/analytics design only. Gate 5 remains mandatory before product implementation. No early data/query/report spike is requested by this package.

## Actual decisions

| Field | Record |
|---|---|
| Bootstrap authorization | None recorded; proposal only |
| Gate 4 outcome / approver / source | No decision recorded |
| Approved architecture / ADR / envelope versions | None |
| Condition closures | None formally recorded; C3-02 is ready for closure review using supplied host facts and the documented procedure. C3-01/03 remain open; C3-04 is due at Gate 5 |
| Authorized work now | Architecture preparation and existing-access read-only feasibility under Gate 3 |
| Next boundary | Close prerequisites, then Gate 4 decision; no general implementation before Gate 5 |

[Architecture validation](../evidence/architecture-validation.md) records document/source checks, preserved approval artifacts and execution limits.
