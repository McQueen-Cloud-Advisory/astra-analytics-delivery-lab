# Master prompt revision notes

Date: 2026-09-20. Work package: **W1 — Revise the governing prompt**. Revised prompt: **2.0**.

The manager accepted the review recommendations and instructed execution of the implementation plan. This revision implements the preparation work; it does not select an initiative or supply any of the nine experiment gate decisions.

The [governing prompt](../../prompts/astra-analytics-delivery-master-prompt.md) retains Harborline's business scenario, the 12-opportunity portfolio, all nine human gates and their record paths, the manager's selection/release authority, and the substantive engineering, UX, accessibility, and independent-verification requirements. Focused replacements remove the original approval ambiguities; the added contracts make execution resumable and evidence claims reviewable.

The original baseline recorded by the [critical review](master-prompt-review-and-implementation-plan.md) was the 1,076-line prompt with SHA-256 `641070840EE739C6E729812809088294D44463FB9CDE991389EC7EDA4495194F`. The prompt was untracked at review time, so this reference is a content hash, not a claim that the original prompt belonged to a repository commit.

## Finding coverage

| Finding | Implemented change in the governing prompt |
|---|---|
| F01 — Approval scope and resume | Section 3 defines state, gate states, decision provenance, artifact revision binding, and conditional approval. Section 13 reconstructs authority on resume and prevents accidental restarts. |
| F02 — Gate 5 conflict | Gate 4 authorizes detailed design only. A pre-Gate-5 feasibility spike needs explicit bounds. Gate 5 is mandatory even without disputed semantics and authorizes implementation within the envelope. |
| F03 — Charter authority | Draft the charter before Gate 3; approve its business baseline with selection. Later technical refinement cannot silently change scope or success criteria. |
| F04 — Portfolio/stack mismatch | Section 4 keeps broad discovery but makes GCP/BigQuery/Power BI the first-run eligible route. Alternate routes require an explicit Gate 3 decision and equivalent applicability map. No-build/existing-system alternatives remain visible. |
| F05 — Lab versus business value | Section 1 labels observed results, assumptions, estimates, and business hypotheses. Gates 3, 8, and 9 distinguish demonstrated lab outcomes from unvalidated benefits; the default endpoint is a deployed lab. |
| F06 — Cost/access bounds | Sections 2 and Phase 4 reserve spending authority and define the project, identity, workload, cost, retention, cleanup, and stop envelope. Phase 6 records actual resources/usage. Alerts are distinguished from enforced limits. |
| F07 — Early feasibility | Phase 1 inventories actual read-only capability. Gate 3 exposes unresolved dependencies; Phase 4 settles the connection/verification approach. Phase 6 begins with a small end-to-end proof before backend expansion. |
| F08 — Release gap | A release-execution step between Gates 8 and 9 checks the authorized revision/target, deploys, verifies, and records recovery or failure. Explicitly accepted undeployed outcomes remain possible. |
| F09 — Acceptance/data contracts | Section 3 defines traceable acceptance/evidence records. Phase 5 specifies source, generator, and KPI contracts with independent fixtures and predefined thresholds. Phase 6 verifies reconciliation and lifecycle cases. |
| F10 — Changes and conditions | Section 3 requires the affected decision before material execution, preserves earlier baselines, assigns condition ownership/closure, and bounds discovery/retries. Routine fixes remain autonomous. |
| F11 — Experiment measurement | Section 3 starts prospective measurement before discovery, distinguishes event categories and time types, and treats unknowns honestly. The retrospective uses these records rather than invented metrics. |
| F12 — Report and operations | Phases 7–9 define host, filter-context, interaction, access, refresh, accessibility, ownership, targets, and demonstrated recovery requirements. Generated PBIP files remain insufficient behavioral evidence. |
| F13 — Scoring mechanics | Phase 1 assigns stable IDs and disjoint primary bucket counts. Gate 1 establishes eligibility, anchored favorable scoring, normalized weights, uncertainty and correlation treatment. Ranking remains after Gate 2. |
| F14 — Operator entry | The prompt names the state/protocol/record paths, links activation/resume guidance, and treats templates as support for one governing workflow. README/AGENTS navigation is delivered under W2. |

## Verification and execution limits

Structural checks confirm nine unique numbered gate headings in order, nine distinct gate-record paths, a mandatory Gate 5, a release step between Gates 8 and 9, and separate fresh-start/resume instructions. The original conflicting “Stop only” Gate 5 language and post-selection charter creation instruction have been removed. Workflow rehearsal across the shared records is part of W4.

This edit did not execute discovery, rank candidates, make gate decisions, provision cloud resources, or validate the actual Power BI connection. Those actions remain governed by the revised prompt and the manager's actual execution instructions and gate decisions.
