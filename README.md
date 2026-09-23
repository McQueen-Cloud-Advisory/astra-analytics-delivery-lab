# Astra Analytics Delivery Lab

A stage-gated experiment using GPT-6 Astra to discover, prioritize, design, and deliver an analytics solution with GCP, BigQuery, and Power BI. The manager retains project selection, material business/architecture decisions, spending/access authority, release, and acceptance.

Harborline Distribution Group is fictional. This is an agent-assisted experiment conducted by one human; fictional company labor benchmarks are separate from that person's actual time and incremental costs. Use suitable public data and synthesize unavailable business events, documenting provenance and limits. Such data can establish demonstrated technical behavior; actual business savings and adoption remain hypotheses. The delivery endpoint is confirmed at project selection.

## Current work

See [project state](docs/project-state.md) for the current phase and next boundary. **Gate 5 is approved unchanged; Phase 6's minimal cloud-to-Desktop proof has passed.** The manager confirmed both refreshes displayed 48 remaining units, $144 overdue value and 10 lines, including after save/reopen. [Desktop evidence](docs/evidence/desktop-proof-validation.md) combines that human observation with saved source and actual BigQuery jobs. Correction, replay and recovery implementation now proceeds within the existing limits. Gate 6 is not yet ready for approval.

Credential containment and renewed access are recorded in [security evidence](docs/evidence/security-evidence.md). The [separate proof](powerbi/opp02-proof/opp02-proof.pbip) remains on the original verified batch; no further Desktop refresh is needed for this first proof. Explicit dependency-audit authorization and actual CI execution remain outstanding. Broader report behavior and final report development still follow their approved later gates.

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
| Minimal cloud-to-Desktop proof | [Cloud result](docs/evidence/phase-6-cloud-proof.md), [Desktop steps](docs/operations/desktop-proof-steps.md), [separate proof artifact](powerbi/opp02-proof/opp02-proof.pbip) and [configured controls](docs/evidence/cloud-controls.json) |
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

Git, Node and authenticated gcloud support the work. Billing, keyless runtime access, regional pricing, the alerts-only budget and the daily query quota are verified for `astra-po-lab-20260921`; the manager confirms at least $15 available headroom. The first cloud slice passes; actual invoices, full acceptance coverage and Desktop behavior remain unverified. Deprecated `financial-analytics-demo` is excluded. Desktop August 2026 x64 is identified; its report remains unpublished. Standing ChatGPT Pro is excluded from project costs. Respect the $10/month and $20 experiment ceilings, original resource expirations and required Desktop proof before backend expansion. The experiment ends after required evidence and cleanup, with no 60-day run. See [environment readiness](docs/environment-readiness.md) for observation limits.

The existing `powerbi-files/placeholder-report.pbip` is a user-provided starting artifact. Its presence is not evidence of a functioning analytical product. Keep Power BI local caches/settings out of version control.

Completion means the manager has accepted the specifically identified deliverable and deployment status at Gate 9, with evidence, handoff, residual obligations, and cleanup or continuing ownership recorded. A stopped experiment with honest evidence is also a useful outcome.
