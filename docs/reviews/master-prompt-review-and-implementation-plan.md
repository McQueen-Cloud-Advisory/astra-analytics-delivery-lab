# Master prompt review and implementation plan

Review date: 2026-09-20. Status: proposed plan; the experiment has not been started by this review.

Execution follow-up, 2026-09-20: the manager accepted these recommendations and instructed execution (see [DEC-0001](../decisions/decision-log.md)). W1–W4 and Phase 1 were completed; later gate decisions are recorded in [project state](../project-state.md) and the linked gate records. See [revision notes](prompt-revision-notes.md) for prompt changes and [preparation validation](../evidence/preparation-validation.md) for preparation results. The review and references below preserve the original review-time assessment; they are not current gate approvals.

Reviewed: [master prompt](../../prompts/astra-analytics-delivery-master-prompt.md), [README](../../README.md), repository structure, and `.gitignore`. Source references below use the master prompt's original 1,076-line version. Its SHA-256 is `641070840EE739C6E729812809088294D44463FB9CDE991389EC7EDA4495194F`. The prompt was untracked at review time; the repository HEAD was `92f4bad`.

## Assessment

The prompt is a strong statement of management intent, but needs a more precise execution contract before a long-running experiment. It establishes appropriate decision rights, rewards honest failure, prioritizes value relative to complexity, requires independent reconciliation, and explicitly rejects claiming Power BI success from generated files alone. Preserve these features.

The principal risks are ambiguity at approval boundaries, a mismatch between selectable projects and the required delivery stack, and evidence that could establish a working demonstration without establishing business value. It also leaves a gap between release authorization and actual release verification. These are substantive workflow issues, not wording preferences.

The repository currently contains the prompt, a two-line README, license, and a general Python `.gitignore`; it has no implementation, gate records, or test infrastructure. That is appropriate for its pre-discovery stage. The plan therefore first strengthens the experiment's instructions and records, then describes how to deliver the eventual selected initiative. It does not choose an initiative or prematurely select GCP services.

## Findings and remedies

Priorities: **P1** = resolve before launch or the named authorization boundary; **P2** = complete before the affected delivery gate; **P3** = useful refinement. References identify the relevant existing provisions, including provisions that partially address the issue.

| ID | Priority | Finding and source | Why it matters | Recommended remedy |
|---|---|---|---|---|
| F01 | P1 | Approval records lack binding scope and resumable state. Section 3, lines 144–199, requires decisions; Start Here, lines 1070–1076, always begins discovery. | A resumed agent may repeat work, confuse a proposal with approval, or apply approval to a changed design. | Add a current-state record and a common gate contract: approver, decision reference, artifact revision, conditions, authorized next work, and affected scope. Separate start and resume instructions. |
| F02 | P1 | Gate 5 says to stop only for material semantic decisions at line 734, then unconditionally wait at line 749. Gate 4's line 704 can also be read as authorizing implementation. | Two reasonable readings produce different approval behavior. | Make Gate 5 a mandatory baseline approval, focused on material semantics. Gate 4 authorizes detailed design; Gate 5 authorizes platform implementation within the approved envelope. Explicitly describe any exception for a bounded feasibility spike. |
| F03 | P1 | A charter becomes authoritative after selection without its own explicit baseline approval: lines 457–479 and 485–505. | The agent can effectively choose the success criteria by writing the charter after the selection decision. | Include a draft charter in Gate 3's decision package; approve the business problem, MVP, exclusions, owners, and measurable criteria with selection. Refine technical criteria at Gates 4–5 without silently changing business scope. |
| F04 | P1 | Portfolio scope allows automation, ML, and agentic AI at lines 265 and 292, while lines 759–768, 824, and 870 require a BigQuery/Power BI product. | A sound selection could be forced into an unnecessary reporting architecture. | Keep broad discovery but explicitly define eligibility for this experiment. Recommended first-run boundary: select an analytics initiative compatible with GCP, BigQuery, and Power BI; retain other candidates as future work. An alternate delivery route requires an explicit Gate 3 decision and revised applicability map. |
| F05 | P1 | Public/synthetic data is required at lines 53–55, yet Gate 8 asks whether business success was met at line 935 and Gate 9 assesses original criteria at line 984. | Correct simulated results do not establish actual savings, adoption, or operational improvement at a fictional company. | Separate demonstrated technical outcomes, observed lab usability/operations, and hypothesized business benefits. Give every success claim an evidence type and limitation. Unobserved real-world value remains unvalidated. |
| F06 | P1 | Cost and permission authority is reserved at lines 105–107, but estimates at lines 452 and 675 are not execution limits; provisioning and scheduling follow at lines 761 and 768. | Architecture approval can become open-ended spending or resource authority. | At Gate 4 approve projects, environments, regions, resource classes, identities, one-time and recurring budgets, workload limits, resource lifetime, and stop conditions. Record actual usage and cleanup ownership. |
| F07 | P1 | Platform access is assumed at lines 46–49; the first explicit Power BI connection is at line 824, after backend acceptance. Verification limits appear at lines 887–889. | Missing tenant access, licensing, supported authoring tools, or a viable authentication path can surface after substantial backend work. | Inventory actual capabilities before selection. Identify unresolved feasibility conditions by Gate 3 and settle the integration approach at Gate 4. Build a minimal end-to-end connectivity proof as the first authorized implementation slice, before scaling the backend. |
| F08 | P1 | Gate 8's release decision at line 955 goes directly to handoff and acceptance at lines 959–988. | Readiness approval can be mistaken for a deployed, functioning release. | Insert release execution and post-release verification between Gates 8 and 9. Record the accepted version, environment, access, refresh results, smoke tests, recovery evidence, and release outcome. Permit an explicitly accepted undeployed demonstration. |
| F09 | P2 | Synthetic realism, data design, and tests are strong principles but underspecified contracts: lines 55, 533–537, 712–724, and 777–786. | Plausible data and a successful run can conceal shared generator/transformation errors, lifecycle errors, or unclear KPI meaning. | Require a versioned generator specification, independent expected results, project-relevant source/KPI contracts, and a requirement-to-test acceptance matrix with thresholds. |
| F10 | P2 | Material deviations are documented at lines 207–215, but the rule does not explicitly require approval before executing reserved changes. Conditional decisions at lines 466–469 and 923–925 lack closure rules. | Approval may become retrospective, or a blocking condition may be forgotten. | Define material-change triggers and affected-gate reopening. Conditions need an owner, due point, evidence, and blocking status. Bound additional discovery and debugging by agreed effort/cost limits. |
| F11 | P2 | The final experiment metrics at lines 1050–1066 have no prospective measurement protocol. Intervention guidance at lines 219–234 also overlaps management changes with technical corrections. | The experiment can end with weak or inconsistently classified evidence of autonomy and management effort. | Start a lightweight event log before discovery. Define time, effort, recovery, recommendation rejection, and intervention categories; record model/tools and delegation when observable. Distinguish a routine approval from technical correction delivered during the same gate review. |
| F12 | P2 | Report and operations checks are broad lists: lines 828–858, 881–889, and 899–915. | Correct headline KPIs can coexist with wrong filter totals, stale data, unsuitable access, or an unowned failure. | Define applicable report interaction/access tests and an operating contract with owners, freshness/completeness targets, alert routing, replay/recovery steps, and a demonstrated failure-to-recovery sequence. |
| F13 | P2 | Prioritization asks for criteria, confidence, and sensitivity at lines 399–427 but does not define scoring mechanics. The four candidate buckets at lines 283–288 may overlap. | Cost, effort, complexity, and time can count the same disadvantage repeatedly; synthetic data availability can inflate readiness scores. | At Gate 1 approve anchored scoring, favorable score direction, normalized weights, minimum-value eligibility, uncertainty handling, and correlation checks. Separate assumed company data readiness from the ability to generate a lab proxy. Define how the 12 candidates satisfy the bucket counts without double-counting. |
| F14 | P3 | There is no repository operator guide or compact entry instruction; README lines 1–2 only describe the experiment. | The 1,076-line document is harder to invoke, navigate, and resume consistently. | Add a concise README and root `AGENTS.md` that point to the governing prompt and current state. Keep one authoritative rule set, with linked templates and phase-specific detail. |

## Recommended design decisions

These are proposed defaults for revising the workflow, not approvals of an analytics project, cloud spending, or release.

1. **Preserve the nine human gates.** Resolve Gate 5 as mandatory; limit the decision package to material business definitions and acceptance criteria. Avoid adding a tenth management gate for bookkeeping. Preflight belongs inside startup, and release execution belongs between Gates 8 and 9.
2. **Make the first run an analytics delivery experiment.** Keep all 12 opportunities visible, but explicitly identify whether each fits the intended GCP/BigQuery/Power BI route. Present a no-build or existing-system alternative alongside the portfolio. If that is the best decision, recommend stopping or changing scope rather than forcing a technical implementation.
3. **Use a deployed lab demonstration as the planning assumption.** Confirm the target outcome at Gate 3. Reserve “production” for an explicitly authorized real operating environment; record a separate decision if the endpoint is an undeployed deliverable. Professional engineering standards alone do not make a lab system production-validated.
4. **Keep governance lightweight.** Start with Markdown records and one small state file. Do not build a workflow service, generalized agent framework, or large compliance system. Templates should produce short decision memos backed by linked evidence.
5. **Treat the manager's explicit decision as the authority.** An agent may transcribe that decision with its source reference. An agent-written `Approved` label is not sufficient authority by itself, and ordinary approvals need not be requested again when their scope still applies.

## Execution contract to add to the prompt

### State, approvals, and changes

Maintain a compact `docs/project-state.md` containing run ID, prompt version, current phase, selected initiative if any, current gate and status, approved baselines, open conditions, blockers, and next authorized action. Gate records remain the source of truth for decisions; the state file is a navigational summary, not a second approval ledger.

Use the common gate states `Not Started`, `In Progress`, `Awaiting Decision`, `Approved`, `Approved with Conditions`, `Rework Required`, and `Stopped`. Keep phase-specific recommendations such as “Not Ready” distinct from the manager's actual decision. Preserve previous decision versions when a gate is reopened.

Every gate package should identify prerequisites, completed artifacts and their revisions, acceptance evidence, recommendation and alternatives, unresolved conditions, and the exact decision sought. After the decision, append the approver, timestamp, conversation/message reference or faithful decision excerpt, authorized scope, and next work. Use commit IDs when the relevant files are committed; otherwise identify a version or content hash. Do not pretend an untracked artifact belongs to a commit.

Conditional approval authorizes only the work explicitly permitted while conditions remain open. Each condition has an owner, closure evidence, due gate, and blocking/nonblocking designation. Silence and elapsed time do not close conditions. Evidence that requires judgment is reviewed by the manager; objectively verifiable closure may be delegated explicitly.

Material changes include changes to selected problem, MVP or success criteria, KPI meaning, data source/classification, access boundaries, approved cost envelope, consequential dependency, or deployment environment. Propose reserved changes before executing them. Identify and reopen only the affected gates. Routine fixes within the approved baseline proceed autonomously.

Start or resume the experiment only when the user instructs execution. Reading the repository, reviewing the prompt, or editing its instructions does not activate Start Here. A review/edit task remains within its requested scope.

On an authorized resume, read the prompt, state, relevant decisions, and latest evidence; reconcile them against the repository before acting. If an approval cannot be established, continue independent authorized work and request only the missing decision. A missing state file must not silently restart a project that already has gate records.

### Evidence and acceptance

Each material requirement should have a stable ID, approved definition, expected result or tolerance, test scenario, verification method, result status, evidence link, and owner. Define thresholds before observing results. Use `Pass`, `Fail`, `Not Run`, `Blocked`, and justified `N/A`; missing evidence is never a pass.

Evidence records should identify the requirement, command or human verification procedure, timestamp, source revision, fixture/data version and seed, environment/tool versions where relevant, expected and actual result, and sanitized output. Preserve failed attempts and associate later successful runs with the fix. A concise index can link to retained CI runs or local artifacts; large logs and generated datasets need not live in Git. Capture durable summaries when external evidence may expire.

Classify conclusions as observed lab results, scenario assumptions, estimates, or unvalidated business hypotheses. The experiment may demonstrate correctness, usability with available reviewers, freshness, repeatability, and bounded operating cost. It cannot demonstrate Harborline's actual financial return or adoption with generated data.

### Environment and spending

Before selection, perform a read-only capability inventory: local tools, actual cloud project access, CI availability, Power BI Desktop/service access, available artifact formats, rendering/interaction verification, publishing and refresh capabilities, and actions requiring the manager. Record `Verified`, `Unavailable`, or `Not Yet Verified` with evidence. The fictional scenario's statement that a platform is available is not evidence that this execution environment has access.

At Gate 4, approve the execution envelope: cloud project and billing project, region, deployment target, allowed resources and identities, maximum development spend, recurring budget, workload size/frequency, retry/discovery bounds, retention/lifetime, cleanup owner, and escalation triggers. Exact limits remain proposed until the manager approves them; do not invent a dollar authorization.

Distinguish alerting from enforcement. Google's documentation states that alerts-only budgets do not cap spending; supported spend-cap options must be evaluated for the selected services. Record the actual coverage and limitations of the chosen controls, with a scoped stop/cleanup procedure. Do not describe a budget notification as a guaranteed hard ceiling. [Google Cloud budget documentation](https://docs.cloud.google.com/billing/docs/how-to/budgets)

### Data and Power BI validation

Specify synthetic-data seed, generator version, time span, small/representative/stress scale profiles, distributions and assumptions, relationships, event chronology, injected failures, expected clean results, and reproduction commands. Small fixtures should be the default for local checks; run larger profiles only inside the approved workload envelope. Public datasets require provenance, license/usage review, version/date, and suitability limits.

For the selected problem, define grain, schema/types/nullability, keys, source update/delete behavior, schema evolution, deduplication, late arrivals/corrections, replay/backfill, and reject/quarantine behavior. Define applicable KPI numerator/denominator, inclusions/exclusions, filter context, aggregation behavior, date/timezone and currency rules, and blank/zero behavior. Mark irrelevant requirements N/A with reasons rather than implementing unnecessary features.

Create at least one independently calculated fixture for every material KPI/business rule; the transformation must not be its own expected-result oracle. Verify representative duplicate, correction/late arrival, malformed record, and recovery behavior as applicable. Reconciliation should detect both omitted and duplicated business events, not only compare total row counts.

Before full backend buildout, prove one small path from a fixed source fixture through BigQuery into a minimal Power BI semantic model/visual. This is a technical feasibility check, not final report development or business acceptance. Perform it only after the applicable design, access, and spending approvals. If it fails, resolve the integration or return to the affected decision before expanding the platform.

At architecture approval, record Import versus DirectQuery, connector/version, authentication and refresh ownership, explicit billing project, target workspace, artifact format, and deployment/verification approach. Microsoft documents both connection modes and an explicit Billing Project ID; these choices should be intentional rather than left to defaults. [Microsoft BigQuery connector documentation](https://learn.microsoft.com/en-us/power-query/connectors/google-bigquery)

The PBIP documentation retrieved for this review labels the feature as preview and identifies limitations on editing some files outside Desktop. Verify the installed version, supported formats, and current limitations before generating artifacts; record relevant dependencies and exceptions. [Microsoft Power BI project documentation](https://learn.microsoft.com/en-us/power-bi/developer/projects/projects-overview)

Report acceptance should cover material totals and filter contexts, relationships/date behavior, empty/error/stale states, refresh sequencing, intended-user access and row-level restrictions where required, interaction performance, and the prompt's accessibility requirements. Attach evidence from the intended host or a named human verifier. If those checks cannot run, preserve the existing rule that generated files do not establish functioning report behavior.

## Implementation work packages

Sizes are relative planning estimates for preparation: S = a small focused change; M = several related changes and review. W5–W8 must be sized after project selection and capability checks; they are not delivery commitments. W1–W4 prepare the experiment; W5–W8 execute its existing stages only when subsequently authorized. The agent prepares artifacts and performs authorized technical work; the manager owns the reserved scope, cost, access, gate, and release decisions. Name any human platform verifier during preflight.

| Package | Size / dependency | Deliverables and work | Acceptance / exit condition | Finding coverage |
|---|---|---|---|---|
| **W1 — Revise the governing prompt** | M; first | Resolve stack eligibility and endpoint; define the gate contract, mandatory Gate 5, approved charter at Gate 3, material-change rules, conditional decisions, start/resume behavior, and post-Gate-8 release step. Include a concise revision rationale. | Every phase has an unambiguous entry authorization, expected output, and next boundary. Gate 4 cannot be interpreted as general authority to skip Gate 5. The document preserves all nine gates and the manager's selection/release authority. | F01–F06, F08, F10 |
| **W2 — Add lean repository records and navigation** | M; W1 | Add root `AGENTS.md`, expand `README.md`, initialize `docs/project-state.md`, and add templates for gate/decision, condition/change, evidence/acceptance, and experiment events. Retain the existing portfolio, ADR, risk, and intervention paths. Extend `.gitignore` for the artifacts actually adopted, including applicable Power BI caches and local settings. | A new session can identify the governing instructions, current stage, approvals, and next action. Templates default to proposed/empty states and cannot be mistaken for approved decisions. No credentials or data caches are included. | F01, F10, F11, F14 |
| **W3 — Define evidence, experiment measures, and preflight** | M; W1, W2 | Add `docs/experiment-protocol.md`, `docs/environment-readiness.md`, an assumptions register, and templates for data generation, data/KPI contracts, acceptance criteria, and cost/access limits. Define prospective measurement categories and logging responsibility. | Each experiment question has observable evidence or an explicit limitation. Each platform dependency has a status and owner. Unknowns can become bounded gate conditions; none are presented as verified. | F05–F07, F09, F11, F12 |
| **W4 — Exercise the workflow before launch** | S; W1–W3 | Walk through the scenarios below against the revised prompt/templates; repair contradictions. Check paths, field definitions, gate numbering, and the single source of truth for each decision. Add small structural checks only where they catch meaningful errors. | The scenarios yield one consistent permitted next action. No scenario fabricates approval, silently waives a condition, or counts missing evidence as success. No cloud resources or portfolio ranking are required for this rehearsal. | F01–F14 |
| **W5 — Run discovery and selection** | TBD; W4 and instruction to begin | Produce exactly 12 candidates; propose the framework at Gate 1; triage after approval; rank only the approved survivors; submit a draft charter and selection memo at Gate 3. Preserve a no-build alternative and uncertainty. | Gates 1–3 have actual manager decisions. The selected route, scope, benefit hypotheses, success criteria, owners, and conditions are approved, or the experiment records a valid stop/discovery outcome. | F03–F05, F07, F13 |
| **W6 — Design and prove the selected path** | TBD; Gate 3 approval | Compare appropriate architectures; approve environment/spend limits at Gate 4; define generator/data/KPI contracts and acceptance matrix at Gate 5. Begin implementation with the minimal end-to-end connectivity proof, then build ingestion, transformations, tests, and CI as applicable. | Gate 6 receives executed evidence for initial and repeat loads, independent correctness checks, failure/recovery, CI/security controls, actual resources/cost, and deviations. Integration feasibility is resolved before full backend expansion. | F02, F06, F07, F09, F10, F12 |
| **W7 — Build and validate the analytical product** | TBD; Gate 6 approval | Propose decision-focused wireframes and accessibility review at Gate 7; implement the approved report; complete semantic, interaction, access, refresh, and host validation. Prepare runbook, operating targets, recovery evidence, cost review, and readiness scorecard. | Gate 8 distinguishes verified behavior, unmet criteria, unverified items, and acceptable residual conditions; the manager makes the actual release/no-release decision. | F05, F09, F12 |
| **W8 — Release, accept, and evaluate** | TBD; Gate 8 decision | Deploy the authorized revision/target when approved; execute smoke/access/refresh checks and the agreed observation period; act on rollback triggers; present Gate 9 acceptance evidence; complete handoff, retrospective, and cleanup or ownership transfer. | Final acceptance identifies the exact version, environment, deployment status, criteria results, remaining obligations, and owner. The retrospective uses recorded measurements; resources have a continuing owner or documented teardown. | F05, F08, F11, F12 |

The critical path is W1 → W2/W3 → W4 → Gates 1–3 → Gates 4–6 → Gates 7–8 → release verification → Gate 9. W2 and W3 can proceed partly in parallel once W1's record definitions stabilize. Within implementation, independent test-fixture review, documentation, and technical checks can run concurrently under the same approved scope.

### Minimal planned file structure

The following paths are proposed deliverables, not files already created by this review. Create project-specific implementation directories only after selection and design approval.

```text
AGENTS.md                              # compact entry rules and links
README.md                              # operator guide; start/resume and navigation
prompts/astra-analytics-delivery-master-prompt.md
docs/
  project-state.md                      # current position and next authorized action
  experiment-protocol.md                # measurements and evidence limitations
  experiment-events.csv                 # simple event log; no sensitive transcripts
  environment-readiness.md              # actual capabilities and unresolved access
  assumptions.md                       # scenario assumptions, confidence, validation
  templates/                           # small reusable record templates
  portfolio/                           # existing required discovery/triage/ranking docs
  decisions/                           # decision log and material ADRs
  gates/                               # existing nine gate records
  evidence/                            # requirement results and retained evidence index
  data/                                # generator, source, and KPI contracts
  operations/                          # envelope, runbook, release and cleanup records
  project-charter.md
  risk-register.md
  intervention-log.md
  retrospective.md
```

Keep `AGENTS.md` short and refer to the master prompt/state instead of duplicating the full prompt. Include the activation boundary above so a review or editing request cannot inadvertently launch the experiment. OpenAI documents repository `AGENTS.md` discovery as the mechanism for loading project instructions. The proposed routing file uses that mechanism to make these particular experiment rules discoverable. [OpenAI Docs: custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)

### Gate-by-gate exit evidence

| Gate | Minimum decision package and authorized next work |
|---|---|
| **1 — Portfolio/framework** | Twelve unranked candidates with stable IDs and explicit bucket counts; transparent scenario estimates; proposed eligibility rules, scoring anchors, weights, confidence treatment, and sensitivity approach. Approval authorizes triage using that framework. |
| **2 — Triage** | All 12 dispositions retained with rationale; unresolved discovery has a bounded question, owner, and return point. Approval identifies the survivor set eligible for detailed prioritization. |
| **3 — Selection/charter** | Reproducible scores and sensitivity, correlated-criteria assessment, no-build comparison, recommended project/route, draft charter and benefit hypotheses, capability constraints, effort/cost ranges, and conditions. Approval establishes the business baseline and authorizes architecture. |
| **4 — Architecture/envelope** | Architecture and material alternatives, component applicability, tool/connection/deployment feasibility, IAM/trust boundaries, cost/access/workload envelope, and exceptions. Approval authorizes detailed data design and only specifically bounded additional work. |
| **5 — Analytics baseline** | Data/generator/KPI contracts, independent expected outcomes, acceptance thresholds, and unresolved semantic decisions. Approval authorizes implementation inside the existing envelope. |
| **6 — Platform** | Minimal integration proof, initial/subsequent/replay results, reconciliation, failure/recovery, actual CI/security execution, spend/resources, and design deviations. Acceptance authorizes final report design and development subject to Gate 7. |
| **7 — Report design** | Decision-to-page mapping, wireframes, semantic measures, interaction/access tests, accessibility review, and proposed verification responsibilities. Approval authorizes completion of the report. |
| **8 — Release decision** | Acceptance results, actual host checks, operating owner and targets, recovery/rollback readiness, residual conditions, costs, exact release artifact and destination. Human authorization permits only the specified release, or records no-release/rework. |
| **9 — Final acceptance** | Release record and post-release results, or explicit undeployed status; criteria traceability; handoff; open obligations; resource ownership/cleanup; evidence-backed experiment assessment. Record the manager's final accepted scope and outcome. |

For each gate, failed requirements lead to rework, bounded discovery, an explicit permissible exception, or stopping. “Ready with Conditions” is not permission to self-approve a release.

### Measurement protocol

Record the run's prompt revision, observable model/configuration, tools and permissions, and use of subagents. Note material changes during the run; do not claim access to hidden model or runtime details. A second reviewer can check independent expected results and evidence completeness, but remains part of the agent-assisted workflow rather than independent human validation.

Use event categories for autonomous execution/recovery, business-management decision, technical correction, authentication/permission, human-only platform action, and external blocker. Link intervention-log entries to events instead of counting them twice. A business requirement change is not automatically an agent error; a correction during a stage-gate conversation can still be a technical intervention.

Measure elapsed time separately from observed active work and approval/blocker wait time. Human effort should come from user-reported time or an agreed timer, not be inferred from message timestamps. Record actual versus estimated cloud cost, and agent usage/cost only when available. Preserve unknown values as unknown.

Assess correctness, escaped defects, reproducibility, and recovery alongside effort and autonomy. Counts of tests or CI runs provide context; they are not standalone quality or productivity measures. A single selected initiative supports a bounded case study, not a general claim that all analytics work is safely delegable. A comparative baseline is an optional later experiment, not a prerequisite that expands this MVP.

### Workflow rehearsal scenarios

| Scenario | Expected behavior |
|---|---|
| Fresh run | Perform lightweight preflight and measurement setup, generate the unranked portfolio/framework, and stop at Gate 1. |
| Gate 1 approved | Record the actual decision and approved framework revision; perform triage only. |
| Ambiguous approval | Preserve completed work and ask for the unresolved scope; do not infer approval of several gates from a vague acknowledgement. |
| Conditional selection | Continue only expressly authorized work; track each condition to its owner and closure evidence. |
| Gate 5 has no disputed semantics | Still present the concise baseline and obtain the required approval; do not invent additional business decisions. |
| Session resumes after Gate 4 | Reconstruct the current baseline and proceed with data design; do not restart discovery or skip Gate 5. |
| A proposed KPI change alters prior approval | Reopen the affected semantic decision before applying it; retain the original evidence and approval. |
| Expensive workload or repeated failure approaches limits | Stop the affected execution, retain diagnostics, propose a bounded fix or revised envelope; continue independent permitted work. |
| Power BI cannot be opened or verified | Mark report behavior unverified; arrange the specified human check or propose a changed deliverable. Gate 7 may approve the design, but Gate 8 cannot count required functional checks as passed from PBIP files alone. |
| Synthetic test succeeds | Report the demonstrated calculation/system behavior; retain the business benefit as a hypothesis. |
| Release approved but smoke test fails | Follow agreed recovery/rollback rules, record the failed release, and withhold a successful-deployment claim. |
| Manager chooses no release or stops the experiment | Record the decision and learning, preserve evidence, and carry out already-authorized cleanup. Treat stopping as a valid experiment outcome. |

## Recommended first increment

Implement W1–W4 as one reviewable preparation increment: revised prompt, compact entry/navigation guidance, reusable records, capability/evidence protocol, and a completed workflow rehearsal. Keep the original prompt's business scenario and nine-gate intent intact. The next operational action after that increment is Phase 1 discovery and Gate 1 preparation; project selection, architecture, provisioning, and release remain governed by their respective decisions.

This review changed only this review/plan document. The master prompt remains unchanged for comparison. Platform documentation supports the feasibility checks above; it does not establish access, licensing, or working integrations in this repository's actual environment.
