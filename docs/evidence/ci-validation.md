# Phase 6 CI and current local validation

Run HDG-20260920-01. Updated 2026-09-23 UTC. **Approved audit/review: Pass. Earlier public push: complete. GitHub CI: Pass for commit `8e9649e`.** Later implementation is outside the earlier run; its matching run is recorded below. **Subsequent publication: implementation commit `acdb6d3` passed 177/177 tests and all checks in actual CI.** Gate 6 remains In Progress; work is paused at the manager's request.

The [workflow](../../.github/workflows/ci.yml) runs locked dependency installation with lifecycle scripts and automatic npm advisory auditing disabled, Node tests, documentation checks, a bounded local secret-pattern scan, Power BI source checks and the local pipeline plan. It has read-only repository permission, no GCP credentials, no cloud execution/deployment, and no persisted checkout credential or dependency cache. Its frozen comment about pending npm permission reflects the earlier state; the separately authorized audit has now passed and is retained in [security evidence](security-evidence.md).

Official [checkout](https://github.com/actions/checkout) v7.0.1 and [setup-node](https://github.com/actions/setup-node) v7.0.0 are pinned to the immutable commits resolved from their release tags on this date. Node **24.15.0** matches the local runtime. Source/evidence byte preservation is configured in [.gitattributes](../../.gitattributes) so recorded hashes survive Windows/Linux checkout; the pre-existing license retains normal text handling.

Observed local commands on the correction/recovery/metadata/security snapshot in commit `8e9649e`:

- `node --test --test-reporter=tap`: **98 tests passed**, zero failures/skips, including five atomic-ledger fault tests, four private-file exclusion/metadata tests and seven secret-scanner tests.
- `node scripts/check-secrets.mjs`: **156 source files scanned, zero findings/errors** in the retained observation. Private contents and Git history/index contents are outside this bounded scanner's scope. [Retained result](security-scan-2026-09-23.json).
- `node scripts/validate-docs.mjs`: **72 Markdown files passed** including this evidence page.
- `node powerbi/opp02-proof/validate-metadata.mjs`: **14 explicitly allowlisted sources / three visual bindings passed**; it does not traverse `.pbi` or execute Desktop.
- Local FIX-02 plan and actual [cloud recovery/replay](phase-6-correction-validation.md) are separate evidence. CI cannot verify BigQuery or Desktop behavior.

GitHub metadata confirms repository `McQueen-Cloud-Advisory/astra-analytics-delivery-lab` is public, Actions is enabled, and the starting remote/local baseline is `92f4badc305e61d55053daae46f90f9c148a091c`. Local commit **`8e9649e`**, on **`codex/phase6-platform-proof`**, contains 143 changed files: source, documentation, synthetic fixtures, Desktop source and sanitized evidence. Original `powerbi-files/` artifacts and all private settings/caches/local runtime state remain outside that commit. Cloud project/resource identifiers remain in the evidence intentionally; a bounded scanner does not establish that every public disclosure is acceptable.

**Historical push rejection:** the attempted `git push -u origin codex/phase6-platform-proof` was rejected before execution because general CI authorization did not specifically authorize this 143-file payload to the public destination. The manager subsequently authorized the audit/review and conditional publication in [DEC-SEC-002](../decisions/decision-log.md#dec-sec-002--authorize-npm-audit-and-conditional-public-ci-push). No alternate upload route bypassed the rejection. Subsequent local work is outside this snapshot; CI identifies the exact revision tested. Main has not been merged and no release is authorized.

## Conditional publication review

The [authorized audit](npm-audit-2026-09-23.json) completed at **2026-09-23T03:53:11.806Z**, exit 0, with zero known vulnerabilities at every severity and no dependency changes. Both package files match frozen commit **`8e9649e4fda23196e51491fad05644cbb765d0ce`** byte-for-byte. A second agent separately reviewed the result and the complete committed tree: **144 total source files** (143 changed versus the starting commit), **1,330,630 bytes**, zero bounded credential-pattern findings/errors, no private/original-artifact paths, binary files, symlinks or submodules. It verified the credential-free workflow's read-only permissions, pinned actions and local-only commands. Agent review remains agent-assisted evidence, not human or exhaustive security verification.

**Findings disposition:** no dependency remediation or additional risk exception is required by these findings. The manager's audit-review condition for this exact public push is satisfied. Publication is restricted to this frozen commit on `codex/phase6-platform-proof`; later working-tree code/evidence remains local. Actual push and CI results are recorded separately from this pre-push review.

## Observed public push and CI

The authorized push completed successfully, creating the public review branch at **`8e9649e4fda23196e51491fad05644cbb765d0ce`**. The explicit refspec sent only that commit. [GitHub Actions run 35816243301](https://github.com/McQueen-Cloud-Advisory/astra-analytics-delivery-lab/actions/runs/35816243301), triggered by that push, was created **2026-09-23T03:55:18Z** and completed **03:55:32Z** with conclusion **success**, attempt **1**. [Durable sanitized result](ci-run-2026-09-23.json) retains head SHA, job/step outcomes and selected validation output.

Every workflow step passed on its `ubuntu-latest` runner with configured Node **24.15.0**: locked install without lifecycle scripts or automatic audit; **98 tests, 98 passes, zero failures/skips/cancellations** (reported duration **775.134755 ms**); **72 Markdown files** structurally valid; **144 source files** scanned with zero findings/errors; **14 Power BI source files / three visual bindings** valid; and the local pipeline plan. CI used no GCP credentials and submitted no cloud workload or deployment. The separately executed audit is not misreported as a CI audit step.

The existing main branch was not merged and no final release was made. Published documentation describes its historical snapshot; later audit/CI result records and the **110-test** local composition implementation remain uncommitted and unpublished. This run establishes CI for the exact reviewed snapshot, not for those later changes. Their eventual submitted revision still needs matching CI evidence.

## Subsequent local delta checks

At **2026-09-23T03:09:28.422Z–03:09:29.407Z**, Node **v24.15.0** ran `node --test --test-reporter=tap`: **110 tests passed**, zero failures/cancellations/skips; reported duration **946.0841 ms**. This includes 12 [local composition cases](phase-6-incremental-local-validation.md), whose source and evidence remain working-tree changes after commit `8e9649e`. Two agent reviews found no blocking defect within that pinned local scope; neither is independent human verification or cloud acceptance.

The current Power BI static check again passed 14 allowlisted source files and three visual bindings. A local plan initially failed `LOCAL_VALIDATION_FAILED` because the agent supplied the absent `.lab/fixtures/FIX-02` directory. Correcting the command to `node scripts/run-pipeline.mjs --plan --input fixtures/po/FIX-02` passed with the unchanged published source/batch/SQL hashes. The reproduction path in [correction evidence](phase-6-correction-validation.md) is corrected explicitly. Neither local plan invoked authentication, submitted cloud work or changed attempt reservations.

At **03:11:28.740Z**, the [subsequent bounded source scan](security-scan-2026-09-23-local-delta.json) inspected **163 working-tree source files**, with zero findings/errors. This observation predates writing its own result artifact. Documentation structure passed for **73 Markdown files**. At that time the public push and npm audit were blocked; the later authorization and successful results above supersede that status without extending CI coverage to the local delta changes.

## September 23 end-of-day stopping point

After runtime delta integration, the 17-case boundary suite and the cost-probe verifier repair, `node --test --test-reporter=tap` passed **177/177 tests**, zero failures/cancellations/skips, duration **983.3689 ms**. The final bounded working-tree scan inspected **242 source files**, with zero findings/errors. Power BI static validation again passed **14 allowlisted sources / three visual bindings**; no Desktop refresh occurred. Documentation-only status updates followed those checks.

The [boundary evidence](phase-6-boundary-validation.md) preserves the actual overall failed cloud attempt despite its 17 passing data cases. [Separate existing-job reconciliation](phase-6-limit-probe-reconciliation.json) passed against the repaired classifier; it submitted no query and did not rerun the full suite. Both dependency files still match the earlier zero-finding audit. These are local/security/metadata observations, not new CI results.

The manager requested an end-of-day stopping point and README update. All subsequent implementation/evidence remains **uncommitted and unpublished**, and no new CI run was requested. Next authorized work is exact-revision review/publication and credential-free CI before Gate 6 submission. No main merge, release or gate approval is implied.

## Authorized publication and matching implementation CI

[DEC-SEC-003](../decisions/decision-log.md#dec-sec-003---publish-the-current-phase-6-changes) records the manager's explicit "Commit and publish the changes." Commit **`acdb6d39f8074dcf5b61a3119778696071b1f5d8`** publishes 102 changed implementation/fixture/evidence/documentation files to the existing public review branch. Exact pre-publication index review inspected **229 complete source files / 2,132,304 bytes**, with zero bounded credential-pattern findings and no original Power BI artifacts, private paths, binaries, symlinks or submodules. Dependencies match the prior audit. Local 177-test validation and all configured local checks passed before publication.

[GitHub Actions run 35933272761](https://github.com/McQueen-Cloud-Advisory/astra-analytics-delivery-lab/actions/runs/35933272761) completed successfully: job finished **2026-09-23T23:22:46Z**, attempt 1, exact head above. **177 tests passed**, zero failures/skips/cancellations, duration **1468.351988 ms**. Locked install, 75-file documentation check, 229-file bounded source scan, 14-file/three-visual Power BI static check and local pipeline plan all passed. [Durable result](ci-run-2026-09-23-platform.json) includes selected logs and exact-payload review. A local evidence parser initially expected TAP markers; it was corrected for the actual Node spec reporter without rerunning CI.

This later success supersedes pending-publication/current-CI status at the earlier stopping point. A documentation-only follow-up records it; no runtime code changed after the tested commit. Experiment execution stays paused, with no GCP or Desktop workload, main merge, release or Gate 6 approval.
