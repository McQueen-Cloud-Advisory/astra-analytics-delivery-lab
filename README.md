# Astra Analytics Delivery Lab

A stage-gated experiment using GPT-6 Astra to discover, prioritize, design, and deliver an analytics solution with GCP, BigQuery, and Power BI. The manager retains project selection, material business/architecture decisions, spending/access authority, release, and acceptance.

Harborline Distribution Group is fictional. This is an agent-assisted experiment conducted by one human; fictional company labor benchmarks are separate from that person's actual time and incremental costs. Use suitable public data and synthesize unavailable business events, documenting provenance and limits. Such data can establish demonstrated technical behavior; actual business savings and adoption remain hypotheses. The delivery endpoint is confirmed at project selection.

## Current work

**Paused for the day at the manager's request — September 23, 2026.** Gate 5 is approved unchanged. Phase 6 implementation has progressed; **Gate 6 remains In Progress and unapproved**. See [project state](docs/project-state.md) for the resume record.

**Publication complete:** implementation commit [`acdb6d3`](https://github.com/McQueen-Cloud-Advisory/astra-analytics-delivery-lab/commit/acdb6d39f8074dcf5b61a3119778696071b1f5d8) is published on `codex/phase6-platform-proof`. [GitHub CI passed all 177 tests and every configured check](https://github.com/McQueen-Cloud-Advisory/astra-analytics-delivery-lab/actions/runs/35933272761). This publication follows [DEC-SEC-003](docs/decisions/decision-log.md#dec-sec-003---publish-the-current-phase-6-changes); experiment execution remains paused.

- **Working pipeline and Desktop proof:** FIX-01 produced **48 remaining units / $144 overdue / 10 lines**. The manager verified two refreshes and save/reopen. [FIX-02 correction, recovery and replay](docs/evidence/phase-6-correction-validation.md) produced **48 units / $140**, preserving the original batch. The [Desktop report](powerbi/opp02-proof/opp02-proof.pbip) stays pinned to FIX-01; no repeat host check is needed.
- **Retained-history and boundary checks:** [runtime delta verification](docs/evidence/phase-6-incremental-cloud-validation.md) reconstructed accepted cloud history, merged two correction records and verified the existing corrected batch without duplicating publication. [All 17 data cases and duplicate replay passed](docs/evidence/phase-6-boundary-validation.md), including invalid-input rejection, missing-event detection and time/void boundaries.
- **Failure retained and diagnosed:** the boundary attempt ended in a cost-probe checker failure. [Existing-job reconciliation](docs/evidence/phase-6-limit-probe-reconciliation.json) confirms BigQuery rejected the query at its byte cap. The checker is repaired locally; the original failed attempt remains recorded. The repaired full cloud suite has not been rerun.
- **Cost and resources:** [reported query usage](docs/evidence/phase-6-validation-post-run.json) totals **740 MiB**, approximately **$0.0044 gross**, not an invoice or total-service bill. Two datasets/five tables remain, using **86,024 logical bytes**. Raw expiry is **September 29**; serving/absolute cleanup backstop is **October 6**, both at **02:26:29.341 UTC**. No deadline was extended.
- **Security and CI:** all **177 local and CI tests pass**; bounded working-tree and committed-source scans found no credential-pattern findings. Dependency hashes still match the authorized zero-vulnerability audit. [Retained CI evidence](docs/evidence/ci-run-2026-09-23-platform.json) identifies the exact implementation commit and results. Main remains unchanged; no release or Gate 6 approval is implied.

**Next session:** review the preserved failures and finalize the Gate 6 package using the matching CI evidence. Its proposed sequencing amendment for later report-layer tests is **not approved**. Final report design/build and release remain gated. All **three Pacific September 23 cloud attempts are consumed**; any further workload needs a new quota day and fresh readiness checks. Resources remain subject to their existing expiry and prompt-cleanup obligations while work is paused.

## Start or resume

- **New experiment:** ask the agent to execute the [master prompt](prompts/astra-analytics-delivery-master-prompt.md). It checks capabilities, starts measurement, prepares the unranked 12-candidate portfolio and framework, then stops for Gate 1.
- **Continue this experiment:** ask the agent to resume from `docs/project-state.md`. It reads the recorded approvals and continues only the next authorized work. If a gate is pending, provide a decision on that specific package/version.
- **Review or edit only:** say what to review or change. Opening these files or asking for edits never activates the experiment automatically.

Approvals can be ordinary explicit conversation decisions. The agent records their source, scope, artifact versions, and conditions in the gate record. A file marked approved without supporting manager authorization is insufficient. The manager can modify or reject a recommendation; rejected approaches remain in history.

## Navigation

| Area | Entry point |
|---|---|
| Governing rules | [Master prompt](prompts/astra-analytics-delivery-master-prompt.md) |
| Current phase and next action | [Project state](docs/project-state.md) |
| Opportunities | [Original discovery portfolio](docs/portfolio/opportunity-portfolio.md) and [current triage](docs/portfolio/triage.md) |
| Approved framework | [Gate 1 decision and rationale](docs/gates/gate-1-portfolio-review.md) |
| Approved survivor set | [Gate 2 decision and single-person/data clarification](docs/gates/gate-2-triage-review.md) |
| Selected project and approved baseline | [Gate 3: OPP-02 approval and rationale](docs/gates/gate-3-project-selection.md) and [approved charter v1.1](docs/project-charter.md) |
| Approved architecture and analytics baseline | [Gate 4 decision](docs/gates/gate-4-architecture.md) and [Gate 5 approval](docs/gates/gate-5-data-design.md) |
| Executed platform and Desktop proofs | [First cloud result](docs/evidence/phase-6-cloud-proof.md), [Desktop evidence](docs/evidence/desktop-proof-validation.md), [executed host procedure](docs/operations/desktop-proof-steps.md), [FIX-02 recovery/no-op](docs/evidence/phase-6-correction-validation.md) and [configured controls](docs/evidence/cloud-controls.json) |
| Architecture and GCP limits | [Design and diagram](docs/architecture/solution-architecture.md), [execution envelope](docs/operations/execution-envelope.md) and [Desktop integration](docs/architecture/power-bi-integration.md) |
| Selection re-review | [Opportunity-cost addendum](docs/portfolio/opportunity-cost-addendum.md) and [selection scorecard](docs/portfolio/selection-scorecard.md) |
| Selection analysis | [Prioritization](docs/portfolio/prioritization.md), [data feasibility](docs/portfolio/data-feasibility.md) and [actual lab forecast](docs/portfolio/experiment-delivery-estimate.md) |
| Decisions and changes | [Decision log](docs/decisions/decision-log.md) |
| Actual capabilities | [Environment readiness](docs/environment-readiness.md) |
| Measurement and limitations | [Experiment protocol](docs/experiment-protocol.md) |
| Scenario uncertainties | [Assumptions](docs/assumptions.md) and [risks](docs/risk-register.md) |
| Evidence | [Preparation](docs/evidence/preparation-validation.md), [triage](docs/evidence/triage-validation.md), [prioritization](docs/evidence/prioritization-validation.md), [selection follow-up](docs/evidence/selection-follow-up-validation.md) and [architecture checks](docs/evidence/architecture-validation.md) |
| Reusable records | [Templates](docs/templates/README.md) |

## Local checks and prerequisites

Run `node scripts/validate-docs.mjs` from the repository root. No package installation is required. It checks local documentation links, gate/portfolio structure, and framework weights; it does not validate cloud resources or report behavior.

Run `node scripts/calculate-prioritization.mjs --check` to independently recalculate the selection scores and compare them with retained results. This verifies local arithmetic and reproducibility, not the fictional assumptions or actual delivery feasibility.

Git, Node and authenticated gcloud support the work. Billing, keyless runtime access, regional pricing, the alerts-only budget and the daily query quota are verified for `astra-po-lab-20260921`; the manager confirms at least $15 available headroom. Minimal Desktop integration and bounded FIX-02 platform checks pass; actual invoices and full acceptance coverage remain unverified. Deprecated `financial-analytics-demo` is excluded. Desktop August 2026 x64 is identified; its report remains unpublished. Standing ChatGPT Pro is excluded from project costs. Respect the $10/month and $20 experiment ceilings, daily attempt limit and original resource expirations. The experiment ends after required evidence and cleanup, with no 60-day run. See [environment readiness](docs/environment-readiness.md) for observation limits.

The existing `powerbi-files/placeholder-report.pbip` is a user-provided starting artifact. Its presence is not evidence of a functioning analytical product. Keep Power BI local caches/settings out of version control.

Completion means the manager has accepted the specifically identified deliverable and deployment status at Gate 9, with evidence, handoff, residual obligations, and cleanup or continuing ownership recorded. A stopped experiment with honest evidence is also a useful outcome.
