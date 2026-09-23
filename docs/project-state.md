# Project state

Run ID: HDG-20260920-01  
Prompt baseline: v2.0; SHA-256 `62B17009EBF408664AFEFCEC08AE93F5CF0AC4873FD2A2AB7E19C7CEEA3BA2FA`  
Current phase: Phase 6 — Paused for the day at the manager's request  
Current gate: Gate 6 — Data Platform Validation  
Gate status: In Progress; no manager decision  
Latest approved gate: Gate 5 — Analytics Design, unchanged  
Selected initiative: OPP-02 — overdue purchase-order follow-up  
Updated: 2026-09-23 UTC

## Authority and boundaries

[Gate 3](gates/gate-3-project-selection.md) approves OPP-02/charter v1.1; [Gate 4](gates/gate-4-architecture.md) approves the architecture/envelope; [Gate 5 / DEC-G5-001](gates/gate-5-data-design.md#dec-g5-001--actual-approval-and-subsequent-evidence) approves the analytics/acceptance baseline unchanged and authorizes Phase 6. The manager's latest **“Proceed”** resumes that work. Gate 6, final report design/build, main merge and release remain unapproved. Future decisions offer **at most three options, identifying the recommendation**.

Use local Node batches, BigQuery in **astra-po-lab-20260921 / us-east4**, and unpublished Desktop Import. **financial-analytics-demo is prohibited**, including quota/billing context. Keyless service-account runtime is separate from setup-owner metadata inspection; no shared ADC or Owner fallback. The user linked billing and confirmed **at least $15 allowance headroom**. No agent-created billing account is permitted.

The [approved envelope](operations/execution-envelope.md) retains **$10/month and $20 experiment ceilings**, **$8/$16 early stops**, a $10 alerts-only budget, **10 GiB/day across clients**, **1 GiB/query**, **2 GiB reserved per cloud attempt**, **three attempts/Pacific day**, one active runner, two Desktop attempts/day and 5 GiB storage. Exclude standing ChatGPT Pro and Power BI publication costs.

Original resource clock: **2026-09-22T02:26:29.341Z**. Raw expiry: **September 29**; serving/absolute cleanup backstop: **October 6**, at the same UTC time. Runs never reset these dates. Preserve required evidence, then clean up promptly; no minimum operating period or 60-day observation. Project deletion/billing-account changes require separate authority.

## Completed evidence and its limits

- [Initial cloud proof](evidence/phase-6-cloud-proof.md): FIX-01 published/reconciled at **48 remaining units / $144 overdue / 10 lines**. The initial unexplained process failure remains recorded.
- [Desktop proof](evidence/desktop-proof-validation.md): the manager confirmed both refreshes and save/reopen matched those values; actual jobs used the approved project/region. Preserve the user's saved PBIP and original `powerbi-files/` artifacts. Do not repeat this completed test or request the already supplied August 2026 **2.157.1354.0 x64** build.
- [Correction/recovery/replay](evidence/phase-6-correction-validation.md): cumulative FIX-02 published **48 units / $140**, preserving FIX-01. The journal `EPERM`, bounded repair, reused loads and subsequent no-op are retained. This proves the pre-publication boundary, not injected mid-transaction rollback.
- [Runtime delta](evidence/phase-6-incremental-cloud-validation.md): actual accepted FIX-01 serving evidence, original load jobs and all 20 raw occurrences were verified and reconstructed. Combining two delta events reproduced existing FIX-02; provenance was persisted before the verified no-op. New delta-origin publication remains mock-tested only.
- [Boundary/rejection checks](evidence/phase-6-boundary-validation.md): all **17 data cases**, exact duplicate candidate replay and original-batch preservation passed. The overall attempt remains **Fail** because its final cost checker did not recognize the service error shape. The repaired checker passed [separate existing-job metadata reconciliation](evidence/phase-6-limit-probe-reconciliation.json) without resubmission; it does not erase the failure or establish a full repaired-suite rerun.

These are synthetic technical observations; real company savings, adoption and supplier outcomes remain unvalidated hypotheses.

## Current resources, cost and attempt boundary

[Fresh readiness](evidence/resume-readiness-2026-09-23.json) verified login, billing, budget, effective **10,240 MiB/day** quota and original expiry before workloads. [Post-run metadata](evidence/phase-6-validation-post-run.json), **2026-09-23T23:10:38.401Z**, verifies the same **two datasets/five tables**, **86,024 logical bytes**, raw **110/118** rows, serving **20/22** and **two manifests**. Validation inputs added no serving batch.

All **three Pacific September 23 attempts are consumed**: resource-verification failure with zero recorded jobs; successful delta no-op (**110 MiB**); boundary suite (**280 MiB reported**, final checker failure). Retain all three 2 GiB reservations. **No fourth workload today.** Existing-job metadata reads submit no query.

Cumulative explicitly reported query usage: **740 MiB**, approximately **$0.004411 gross at $6.25/TiB**. The rejected probe omits billed-byte statistics; any no-charge interpretation is based on the specific service rejection and provider policy, not a measured zero. Actual invoice/total-service charges remain unknown. Retain the original other-service contingency and stop rules.

## Security, CI and next decision

[SEC-001](evidence/security-evidence.md) preserves the earlier diagnostic token exposure. Authorized revocation, renewed login and safe verification completed; do not repeat containment. [DEC-SEC-002](decisions/decision-log.md#dec-sec-002--authorize-npm-audit-and-conditional-public-ci-push) authorized the audit and conditional publication of the earlier exact snapshot. The [audit](evidence/npm-audit-2026-09-23.json) found zero known vulnerabilities; dependency hashes remain unchanged.

Published commit **`8e9649e4fda23196e51491fad05644cbb765d0ce`** passed **98 tests and all checks** in [CI run 35816243301](https://github.com/McQueen-Cloud-Advisory/astra-analytics-delivery-lab/actions/runs/35816243301). Later implementation/evidence needs matching exact-revision review and CI; see [CI evidence](evidence/ci-validation.md). Local tests and cloud results do not substitute for that run.

**Stopping point:** the manager instructed, “Find a stopping point then update the README to reflect the current project status. We are calling it a day.” The checker repair is locally verified, the retained probe is DONE, all **177 local tests pass**, and the bounded source scan has zero findings/errors. At that stopping point, changes remained uncommitted and unpublished; matching CI was pending. Resources remain under their original expiry and cleanup obligations.

On the next authorized resume, finish the current-revision security/publication review and credential-free CI, reconcile the acceptance matrix, then finalize the [Gate 6 package](gates/gate-6-data-platform-validation.md). Proposed **AM-G6-01** would move only report-layer FIX-05/KPI-08/empty/filter checks from QA-02's original Gate 6 deadline to existing QA-08/09 checks before Gate 8, preserving every expected result and threshold. **The amendment is not approved.** Keep QA-02 and later report criteria incomplete pending actual evidence or an explicit applicable decision.

On resume, reconcile this index with actual [decisions](decisions/decision-log.md), [events](experiment-events.csv), evidence and resource lifetimes. Draft recommendations, historical pending-status text and silence supply no approval.

**Publication-only follow-up:** the manager subsequently instructed "Commit and publish the changes." [DEC-SEC-003](decisions/decision-log.md#dec-sec-003---publish-the-current-phase-6-changes) authorizes the current public review-branch commit and CI; preparation is in progress. The experiment remains paused and Gate 6 unapproved.
