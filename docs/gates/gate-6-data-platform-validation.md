# Gate 6 — Data platform validation

Run HDG-20260920-01. Status: **In Progress; not ready for a decision**. Gate 5 approved the data/analytics/acceptance package unchanged in DEC-G5-001. Phase 6 has passed the fixed-fixture ingestion → BigQuery → Desktop proof and is implementing correction, replay and recovery checks. Final report development remains outside this phase.

## Current evidence and remaining work

The manager's newly linked USD billing account is verified. Regional SKU prices, a project-only $10 monthly alert budget, effective 10 GiB/day query quota and scoped keyless runtime metadata access are recorded in [cloud controls](../evidence/cloud-controls.json). The manager confirmed the required $15 allowance headroom. No billing account was created by the agent; deprecated `financial-analytics-demo` is excluded.

The [first cloud slice](../evidence/phase-6-cloud-proof.md) ingested ten lines/ten events and published/reconciled FIX-01 with zero oracle differences. [Local validation](../evidence/phase-6-local-validation.md) records the initial 73 passing tests. The separate minimal Power BI proof remains bound to that batch. [Desktop verification](../evidence/desktop-proof-validation.md) passes: the manager confirmed both refreshes matched 48 units/$144/10 lines including save/reopen, and actual jobs used the approved project/region. The [acceptance plan](../qa/acceptance-plan.md) remains the criterion baseline; the [acceptance matrix](../evidence/acceptance-matrix.md) records completed and missing evidence.

A diagnostic exposed a temporary token in tool output; manager-authorized CLI revocation, renewed sign-in and safe access verification completed. [Security evidence](../evidence/security-evidence.md) retains the incident and also records the separately blocked explicit npm audit and the passing bounded local secret-pattern scan. No clean-security or complete-platform claim is made.

The minimal integration condition is closed. Before a Gate 6 recommendation, complete the approved subsequent/incremental/replay/correction/failure/recovery checks and actual CI/security evidence. Cumulative corrected input is not proof of partial-delta history merging. Preserve failures and unknowns; final report development remains gated.

[FIX-02 correction, pre-publication recovery and no-op](../evidence/phase-6-correction-validation.md) now pass their bounded checks. The retained local journal failure was repaired without repeating completed loads; both old and corrected batches reconcile. All three Pacific September 22 workload attempts are consumed. [Current local validation](../evidence/ci-validation.md) has 98 passing tests and a credential-free workflow prepared; actual CI, npm advisory authorization, retained-history delta ingestion and remaining boundary/invalid cases still prevent a Gate 6 recommendation.

## Decision presentation preference

When this gate becomes ready, present at most three options with the recommended option identified, as the manager instructed at Gate 5. No approval is requested while evidence is incomplete.

| Field | Record |
|---|---|
| Gate outcome | No decision; In Progress |
| Authorized work | Phase 6 inside the approved limits; first real end-to-end proof before expansion |
| Current owner | Agent implementation and cloud evidence; Human Manager Desktop verification and gate decision |
