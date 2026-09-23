# Cloud bootstrap and readiness

Run: HDG-20260920-01. Recorded: 2026-09-21. Scope: the manager's instruction to continue through the authenticated terminal, with existing billing only. [Gate 4](../gates/gate-4-architecture.md) records architecture approval and remaining conditions. This record distinguishes planned targets from observed results.

## Authorized target and exclusions

- Candidate project ID: **`astra-po-lab-20260921`**; display name **Astra PO Lab**. Record this target before creation; use explicit project flags for subsequent commands.
- Existing billing: discovery returned exactly **one open account**, redacted reference **ending BE9B**. Use only that existing account. **Never create a new billing account**; the manager will do that manually if needed.
- **`financial-analytics-demo` is deprecated and prohibited as a resource, billing/quota-project or deployment target.** It was observed as the existing CLI default; no changes were made to it. Do not silently use any other existing project.
- Bootstrap permits one project, existing-billing linkage and metadata/access inspection. No datasets, tables, paid jobs, data uploads, runtime identities or report refreshes in this step. Product implementation remains subject to Gate 5.
- Location for later lab datasets/jobs: **`us-east4`**, accepted architecture interpretation of East US. Creating an empty project does not establish dataset location.

## Observed tooling and access

Google Cloud SDK **585.0.0**, core **2026.09.11**, BigQuery CLI **2.1.38**. The SDK is accessible through an approved shell escalation outside the workspace sandbox; the default sandbox PATH/read restrictions did not establish that it was absent. `gcloud auth list` reports an active login. Project and billing account metadata reads succeeded. No token, account email or full billing identifier is retained.

## Executed setup results

- **Created:** `astra-po-lab-20260921`, number **329955978985**, ACTIVE, creation timestamp **2026-09-21T09:39:31.233Z**.
- **Existing-account link attempted once:** failed with `FAILED_PRECONDITION` and `google.rpc.QuotaFailure`: **Cloud billing quota exceeded**. The CLI's failure log was inspected with billing identifiers/account addresses redacted; no blind mutation retry.
- **Read-back:** `billingEnabled=false`; no attached billing account. The manager must resolve the account's quota or manually supply/link another account. [Google's supplied quota-request route](https://support.google.com/code/contact/billing_quota_increase). The failure does not prove that the dollar allowance is exhausted or that a new account is necessary.
- **IAM:** active creator has direct `roles/owner`, the normal creation result. No extra role was granted. Broad setup rights do not satisfy the intended scoped runtime identity.
- **BigQuery inventory:** `bq --project_id=astra-po-lab-20260921 ls --datasets=true` succeeded with no datasets returned. No SQL query was run.
- **ADC:** the conventional application-default-credentials file exists; its contents, identity, quota project, token validity and Node usability were **not inspected or tested**. Do not assume it avoids the deprecated default; verify/bind the lab runtime before use.
- **API defaults:** project creation automatically enabled its normal service bundle: BigQuery and related APIs, Cloud APIs, Service Usage/Management, logging/monitoring/trace, storage and other defaults. No optional workload or paid resource was provisioned. API enablement alone is not deployment or usage evidence.
- **Cloud workload boundary:** zero datasets/tables, uploads, queries, report refreshes or custom service-account creation performed by this bootstrap. No project deletion or billing-account creation/change beyond the failed new-project link.

The nonbillable bootstrap does **not** start the proposed short billable-resource lifetime clock. Retain this partial project; do not create replacements or alter unrelated projects. The CLI's existing default was not changed; all subsequent target-scoped actions use explicit lab project flags. No action was made against deprecated `financial-analytics-demo`.

## Evidence still required before billable implementation

Successful billing enablement/linkage; regional pricing and current allowance/headroom; budget/quota controls; separate runtime authentication; actual platform and Desktop evidence after Gate 5. The user's approximately $30/month unused allowance is a planning statement, not a Cloud Billing credit or hard cap proven by account status.
