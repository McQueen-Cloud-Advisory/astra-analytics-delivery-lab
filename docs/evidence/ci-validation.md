# Phase 6 CI and current local validation

Run HDG-20260920-01. Prepared 2026-09-23 UTC. **Local checks: Pass. GitHub CI: Not Run.** Gate 6 remains In Progress; this record is updated only after observing an actual workflow result.

The [workflow](../../.github/workflows/ci.yml) runs locked dependency installation with lifecycle scripts and npm advisory auditing disabled, Node tests, documentation checks, a bounded local secret-pattern scan, Power BI source checks and the local pipeline plan. It has read-only repository permission, no GCP credentials, no cloud execution/deployment, and no persisted checkout credential or dependency cache. The separate npm advisory request remains pending; this workflow does not bypass that rejection or substitute a clean dependency result.

Official [checkout](https://github.com/actions/checkout) v7.0.1 and [setup-node](https://github.com/actions/setup-node) v7.0.0 are pinned to the immutable commits resolved from their release tags on this date. Node **24.15.0** matches the local runtime. Source/evidence byte preservation is configured in [.gitattributes](../../.gitattributes) so recorded hashes survive Windows/Linux checkout; the pre-existing license retains normal text handling.

Observed local commands on the current correction/recovery/metadata/security source:

- `node --test --test-reporter=tap`: **98 tests passed**, zero failures/skips, including five atomic-ledger fault tests, four private-file exclusion/metadata tests and seven secret-scanner tests.
- `node scripts/check-secrets.mjs`: **155 source files scanned, zero findings/errors** at that observation. Private contents and Git history/index contents are outside this bounded scanner's scope. [Retained result](security-scan-2026-09-23.json).
- `node scripts/validate-docs.mjs`: **71 Markdown files passed** before this evidence page was added; a final structural check covers the complete package.
- `node powerbi/opp02-proof/validate-metadata.mjs`: **14 explicitly allowlisted sources / three visual bindings passed**; it does not traverse `.pbi` or execute Desktop.
- Local FIX-02 plan and actual [cloud recovery/replay](phase-6-correction-validation.md) are separate evidence. CI cannot verify BigQuery or Desktop behavior.

GitHub metadata confirms repository `McQueen-Cloud-Advisory/astra-analytics-delivery-lab` is public, Actions is enabled, and the remote/local baseline is `92f4badc305e61d55053daae46f90f9c148a091c`. A separate `codex/` branch is planned for review/CI; this does not authorize a merge, final release or Gate 6 approval. Original `powerbi-files/` artifacts and all private settings/caches/local runtime state remain outside the prepared commit.
