# Reusable records

These are unfilled drafting aids, not approvals or completed evidence. Use the [master prompt](../../prompts/astra-analytics-delivery-master-prompt.md) for governing requirements and [project state](../project-state.md) for the current authorized work.

| Template | When to use | Record location |
|---|---|---|
| [Gate and material decision](gate-decision.md) | Prepare a gate package or material decision; record the actual decision, conditions, or proposed change | `docs/gates/` or `docs/decisions/` |
| [Evidence and acceptance](evidence-and-acceptance.md) | Define acceptance criteria before results are observed, then retain test/verification results and claim limitations | `docs/evidence/acceptance-matrix.md` and linked evidence records |
| [Data contracts](data-contracts.md) | Prepare the generator, source, and KPI baseline for Gate 5 and maintain approved revisions | `docs/data/generator-spec.md`, `source-contracts.md`, and `kpi-contracts.md` |
| [Operating envelope](operating-envelope.md) | Propose limits for Gate 4, complete operations readiness for Gate 8, and record authorized release/cleanup | `docs/operations/execution-envelope.md`, `runbook.md`, and `release-record.md` |

Copy only the sections needed when the phase begins, retain explicit unknowns, and replace the template heading with the record identity. Closely related records may stay together if linked clearly from the expected entry points. Identify exact artifact revisions and source decisions; an agent-filled approval field is not authority. Use justified `N/A` for inapplicable requirements and preserve failed or unexecuted checks honestly.

Use the [experiment protocol](../experiment-protocol.md) and its CSV schema for event logging; do not create a second event ledger in these templates.
