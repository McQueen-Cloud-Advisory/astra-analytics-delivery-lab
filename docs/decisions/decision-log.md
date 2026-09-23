# Decision log

This log indexes material decisions. Gate records remain authoritative for experiment gate approvals. Dates use the manager's America/Chicago calendar; recorded UTC timestamps in the event log are logging times, not invented approval times.

## DEC-0001 — Accept preparation recommendations and begin execution

- Date: 2026-09-20.
- Status: Accepted.
- Decision owner: Human Manager.
- Context: The agent delivered the [review and implementation plan](../reviews/master-prompt-review-and-implementation-plan.md), including 14 findings and W1–W8.
- Options considered: execute the recommended preparation; modify recommendations; defer execution.
- Recommendation: complete W1–W4, then start discovery and prepare Gate 1.
- Final decision/source: manager's next conversation message, “Your recommendations look fine. If you have questions buried for me in there, let me know. Otherwise, begin execution.” No message identifier or exact approval timestamp is exposed; this faithful excerpt identifies the source.
- Approved baseline: the 189-line review/plan delivered immediately before that instruction, SHA-256 `39D2EEF360E239D7E1F6FD91FB4A499E17E40A8811968DE922E2027F148F5805`; its original-prompt snapshot is identified in the review. A later execution-status note is bookkeeping, not a change to that recommendation baseline. The execution follow-up does not supersede existing stage-gate controls.
- Authorized scope: revise instructions and add lightweight records, preflight, measurement, validation; begin Phase 1 discovery through the Gate 1 package.
- Justification: explicit acceptance of recommendations and instruction to begin.
- Expected consequences: clearer approval/evidence boundaries and a decision-ready portfolio.
- Risks/tradeoffs: preparation overhead is kept to linked Markdown and a small local validation script; actual platform feasibility remains to be established.
- Follow-up: record preparation evidence and present Gate 1. The prioritization framework, candidate dispositions, project choice, spending, and release remain unapproved.
- Supersedes: none.

## DEC-G1-001 — Approve framework v1.0 for this experiment

- Date: 2026-09-20 America/Chicago. Recorded against the 2026-09-21T01:02:44Z instrumented reading; exact message timestamp unavailable.
- Status: Accepted. Gate 1 status: Approved.
- Decision owner: Human Manager.
- Context: the twelve-candidate portfolio and proposed framework were presented for Gate 1.
- Options considered: approve v1.0; modify anchors/weights; request bounded framework discovery. The value-maximizing alternative was explicitly acknowledged by the manager.
- Recommendation: approve v1.0 for the bounded low-complexity/low-cost experiment while retaining value eligibility and sensitivity checks.
- Final decision: framework v1.0 approved unchanged. See the [authoritative gate record and faithful excerpt](../gates/gate-1-portfolio-review.md).
- Approved baseline: [submitted framework v1.0](../gates/gate-1-framework-v1.0-submitted.md), SHA-256 `EB7F4A1ACBABB11E32D96D9523FA53D353C7572016BB3A94902791916D6DFB5D`.
- Justification: the manager recognizes greater real-world value in a value-maximizing model, but accepts concessions toward lower implementation cost because of the scope of this experiment. This rationale does not change the approved value floor, weights, or uncertainty rules.
- Expected consequences: prioritize a credible, manageable experiment; preserve deferred higher-value options and expose the opportunity cost. The experiment's preferred candidate need not be the best investment in a real operating portfolio.
- Risks/tradeoffs: lower burden may sacrifice greater business upside; synthetic evidence cannot establish realized benefit. Low cost alone cannot qualify an almost valueless project.
- Conditions: no new blocking conditions imposed; all existing downstream gates and execution limits remain.
- Authorized follow-up: triage all twelve candidates and submit Gate 2; detailed scores/ranking require Gate 2 survivor approval. Retain the approved value-first sensitivity for Phase 3.
- Supersedes: no prior approval; accepts the proposed DEC-G1-001. No technical intervention occurred.

## DEC-G2-001 — Approve triage and define the actual experiment boundary

- Date: 2026-09-20 America/Chicago; first instrumented record 2026-09-21T01:18:53Z. Exact message timestamp unavailable.
- Status: Accepted. Gate 2 status: Approved. Decision owner: Human Manager.
- Context: Gate 2 proposed three survivors with explicit fictional incremental-value premises and retained all other dispositions.
- Options considered: approve the package; change premises/candidates; conduct bounded further discovery before comparison.
- Recommendation/final decision: package v1.0 approved without changes. OPP-01, OPP-02 and OPP-04 Advance with SCN-01/02/04 adopted. OPP-05/06/07 remain Needs Discovery, OPP-03 is Rejected as framed, OPP-08/09/10/11/12 are Deferred.
- Authority: the [Gate 2 actual decision](../gates/gate-2-triage-review.md) contains the faithful user excerpt. [Submitted package](../gates/gate-2-package-v1.0-submitted.md) SHA-256 `C9FB7CA53C53BB54551F826E87EC646DA03BF93D084BF801E8BCFE135871E52A`; triage v1.0 SHA-256 `F69FFE4BB6819B44C92F458D54DD2ED8206E0F9FFB8B1E17E6FF3533D9E80F30`.
- Execution clarification: actual implementation and feasibility are bounded by one human conducting an agent-assisted experiment. Separate professional fictional-company estimates from real personal effort, incremental charges and tool constraints. Use suitable publicly available data where feasible and synthesize missing data; explicitly document the implications. Approval is not a claim that the sources or platforms work.
- Justification: permits the experiment to progress under a concrete scenario while keeping delivery grounded in available people, data and tools.
- Expected consequences: compare only the approved survivors, include a separate solo-lab feasibility/cost view, and account for synthetic generation and independent validation effort.
- Risks/tradeoffs: missing real lifecycle data limits generalization; the same human holds several roles; generator and solution can share erroneous assumptions; unknown access and licenses can invalidate a proposed route.
- Follow-up: Phase 3 prioritization, public/synthetic-source assessment, actual experiment effort/cost assumptions, Gate 3 memo and draft charter. Resource limits and required host verification must be resolved at their stated gates. No project, spending or architecture is authorized yet.
- Supersedes: no prior approval; accepts proposed DEC-G2-001. This is a management clarification, not a technical correction.

## DEC-SCOPE-001 — Clarify lab costs and request selection comparison

- Date: 2026-09-20 America/Chicago. First instrumented record this turn: 2026-09-21T03:14:38Z; exact user-message timestamp unavailable.
- Status: Accepted planning constraints and authorized documentation follow-up. **Gate 3 remains Awaiting Decision; no project or charter approved.** Decision owner: Human Manager.
- Source: user's explicit request for an opportunity-cost addendum and scorecard before re-review. Faithful cost/next-step excerpt:

> As for development costs, we already have GCP with a about \~$30 allowance per month. The Power BI report won't be published. We won't consider the license for ChatGPT Pro because it is a cost that is incurred irrespective of this project. My primary concern is GCP costs and a bulk of cost optimization will be focused there. I will re-review charter once I have the opportunity cost addendum and scorecard.

- Accepted boundary: existing GCP with approximately $30/month allowance; unpublished Power BI report; exclude the standing ChatGPT Pro subscription from incremental project costs; focus cost optimization on GCP. No service-publication purchase or optional paid API/tool is part of the baseline.
- Interpretation retained explicitly: an allowance is not presumed to be credits, verified unused capacity or an enforced spending cap. Conservatively account for other usage until scope/headroom is verified. Account existence is user-reported; operational identity, tooling and billing visibility remain to be checked.
- Requested follow-up: [opportunity-cost addendum](../portfolio/opportunity-cost-addendum.md), [selection scorecard](../portfolio/selection-scorecard.md), and corresponding estimate/charter/Gate 3 revisions. Separate actual learning/human/GCP tradeoffs from fictional-company benefits and professional costs.
- Consequence: OPP-01 and OPP-02 have the same GCP estimate and comparable delivery-cycle coverage; the company benefit tie-break must not be portrayed as an actual financial or learning advantage to the experimenter. Keep alternatives explicit.
- Baseline impact: Gate 3/charter/prioritization/experiment estimate updated to v1.1; v1.0 submissions preserved. Approved Gates 1–2, scoring weights, scenario inputs and calculated results remain unchanged.
- Authorized scope: documentation and analysis only. Manager will re-review; no architecture, implementation, provisioning, spending or publication authorized by this message. This is management scope/cost clarification, not technical intervention.

## DEC-G3-001 — Select OPP-02 and approve charter v1.1

- Date: 2026-09-20 America/Chicago; first instrumented record 2026-09-21T03:36:30Z. Exact message timestamp unavailable. Decision owner: Human Manager.
- Status: Accepted. Gate 3: **Approved with Conditions**. Project: **OPP-02, overdue purchase-order follow-up**, unchanged recommended plan.
- Authority: [Gate 3 actual decision and faithful excerpt](../gates/gate-3-project-selection.md#actual-management-decision--approved-with-conditions).
- Approved baselines: [submitted Gate 3 v1.1](../gates/gate-3-package-v1.1-submitted.md), SHA-256 `F30CD7292E864C801996B6205AC57D91B146872BDEE08B5E805CD0BD5187448D`; [submitted charter v1.1](../project-charter-v1.1-submitted.md), SHA-256 `933247735BCB4DE9AC2DD3353BCA3F8F066101DE68B61247F6F151964B0FF957`.
- Rationale: the manager wants non-trivial design and business choices while avoiding costs without significant benefits, as could occur with the broader OPP-04 scope. Although OPP-01 has no significant experiment advantage/disadvantage over OPP-02, its value is lower in this hypothetical scenario. This is the manager's tradeoff, not an empirical learning/ROI claim.
- Conditions: C3-01 cloud execution path, C3-02 Desktop verification path, and C3-03 actual cost/effort envelope before Gate 4 approval; C3-04 source/KPI contracts and independent expected results before Gate 5 approval. All adopted and Open, not automatically satisfied by selection.
- Authorized follow-up: Phase 4 architecture, alternatives, engineering assessment, proposed execution envelope, read-only feasibility and Gate 4 package. No implementation, provisioning, permission change or spend; any feasibility spike needs its own explicit bounded authorization.
- Owner: the sole Human Manager is the approved business owner, host verifier and continuing account/resource owner; agent owns technical preparation within each boundary.
- Subsequent setup clarification in this turn, faithful response: “Still need to create the project. Region will be East US. None of the allowance is used. Power BI is installed.” This confirms account availability, not an existing target project; the approximately $30 allowance is unused per manager report, not billing inspection. Exact GCP region code, project ID, billing attachment, permissions and Desktop version remain to be established. Recommend `us-east4` (Northern Virginia) as an explicit interpretation for Gate 4; do not silently treat the broad region label as an exact approved location.
- Further host evidence: About details identify August 2026 Desktop 2.157.1354.0 x64 and enabled PBIP/TMDL/PBIR features. The manager clarifies normal Desktop launch, not placeholder-project opening, and **no error messages**. The copied diagnostic label does not establish an error. C3-02 is ready for closure review using the documented human procedure; no extra preliminary report-opening test is imposed. Actual source connection/refresh proof remains after Gate 5. Only necessary sanitized version/feature facts are retained.
- Supersedes: no prior selection approval. Cost/endpoint constraints in DEC-SCOPE-001 remain; new clarification replaces uncertainty about current allowance use and reported Desktop installation. No technical intervention occurred.

At the end of Phase 3, project selection was approved and architecture remained pending. Later gate decisions below record the additional authority.

## DEC-G4-001 — Accept architecture and shorten the experiment

- Date: 2026-09-21 America/Chicago. Decision owner: Human Manager. Exact message timestamp unavailable; observed follow-through recorded in the event log.
- Status: **Accepted with Conditions**, with faithful approval and deprecated-project excerpts in the [authoritative Gate 4 record](../gates/gate-4-architecture.md).
- Accepted design: local operator-initiated Node batches, BigQuery work/serving in us-east4, unpublished Desktop Import pinned to an immutable batch; credential-free CI and human host checks. Retain $10/calendar-month and $20 whole-experiment ceilings, conditional on readiness and Gate 5.
- Scope amendment: operate only long enough to demonstrate the working ingestion/processing/reporting pipeline and retain required rerun/recovery/release evidence; clean up promptly. No 60-day minimum or observation period. The agent's seven-active-day aim/day-14 backstop and shorter retention are new proposals for Gate 5, not user-specified exact durations.
- Setup authority: proceed using the newly available authenticated gcloud route; create one dedicated lab project and attach suitable existing billing. **Do not create a new billing account**; manager handles that manually if needed. **Do not use deprecated financial-analytics-demo**, including as workload, billing-project or quota context.
- Actual outcome: created astra-po-lab-20260921, number 329955978985. Existing-account linkage failed on Cloud billing quota exceeded; read-back confirms billing disabled/no account. No billable workload or new billing account. [Sanitized observations](../evidence/cloud-bootstrap.md).
- Condition treatment: C3-02 closes for architecture readiness on existing version/normal-launch evidence and the accepted manager-verification procedure. C3-01/03 are carried as blocking before dependent cloud implementation; the latest acceptance authorizes Phase 5 documentation while they remain open. This is the scope interpretation of the actual instruction, not invented technical closure. C3-04 remains due at Gate 5.
- Next boundary: [Gate 5](../gates/gate-5-data-design.md) presents proposed material analytics definitions, independent expectations and acceptance thresholds. No unseen baseline or required gate is self-approved.
- Measurement: CLI authentication and account setup are permission/authentication work, architecture/lifetime/project exclusions are management decisions, and billing quota is an external blocker. No material human technical correction has been observed; human effort and attributable bills remain unmeasured.
- Supersedes: Gate 4 proposal's pending architecture/setup status and 60-day horizon; does not alter OPP-02 selection or fictional business-value comparisons. Exact submitted v1.0 artifacts are preserved.

## DEC-G5-001 — Approve analytics baseline unchanged and begin the first implementation slice

- Date: 2026-09-21 America/Chicago; logging began 2026-09-22T02:10:30Z. Exact user-message timestamp unavailable. Decision owner: Human Manager.
- Status: **Approved, no changes**. The [authoritative Gate 5 record](../gates/gate-5-data-design.md#dec-g5-001--actual-approval-and-subsequent-evidence) retains the exact approval and subsequent billing evidence.
- Source: “Approve with no changes. In the future, when a decision is required, provide at most 3 options, along with the recommended option among the choices. Also, I set up and linked a billing account to the GCP project you created.”
- Approved baseline: [submitted Gate 5 package v1.0](../gates/gate-5-package-v1.0-submitted.md), SHA-256 `093292ABEF4AEC1500C9639A17C7865D017DD28073C29926BD564D82234C25B1`; linked SRC/KPI/generator/fixture/implementation/acceptance versions unchanged. The [submitted envelope v1.1](../operations/execution-envelope-v1.1-submitted.md), SHA-256 `22AA4483624B55A84463F7206987A1EAA27E035E38BBF50FE872C126952E636B`, includes the now-approved seven-active-day aim, day-14 backstop and seven-day raw retention.
- Consequence: C3-04 closes; implement the fixed-fixture cloud-to-Desktop slice within the existing architecture and spending limits before expanding backend scope. Final report design/completion, release and acceptance still require Gates 6–9.
- Future decision presentation: **at most three options, including the identified recommendation**. Do not retrospectively rewrite the four already-approved decision areas or request approval again.
- Subsequent operating evidence: manager reauthenticated and confirms at least $15 headroom. Billing is enabled on the open USD account ending BA6E. Regional pricing, project alerts-only budget, daily query quota and keyless scoped-runtime access are verified in [cloud controls](../evidence/cloud-controls.json); actual invoices remain unverified. The agent created no billing account and did not use the deprecated project.
- Executed first slice: two datasets/five tables provisioned; conservative resource clock starts 2026-09-22T02:26:29.341Z, raw tables expire September 29 and serving/cleanup backstop is October 6 at the same UTC time. The second attempt published/reconciled ten lines/ten events with zero oracle differences at 02:36:20.527Z; [cloud evidence](../evidence/phase-6-cloud-proof.md) preserves the earlier aborted exit and bounded retry. This is not complete backend or report acceptance.
- Subsequent security/authentication authority: the manager separately approved revocation after the diagnostic token exposure. `gcloud auth revoke` succeeded at 2026-09-22T02:43:12.7747162Z, with zero active CLI accounts verified; the manager then signed in again. Sanitized scoped validation passed at 02:48:18.909Z. No old-token reuse probe was performed. [Security evidence](../evidence/security-evidence.md) preserves the incident and residual checks; this is not a clean-security claim.
- Current boundary: Desktop proof **Not Run**; the manager has been asked for actual open/import/reopen/two-refresh results and times. No backend expansion until that proof. Dependency-audit authorization and executed CI remain open. Authentication/account/headroom responses are not technical corrections; observed human effort and invoice costs remain unknown.
- Supersedes: pending Gate 5 baseline/retention status and the old billing-link blocker. OPP-02, approved scoring/scenario assumptions, no-publication scope and exclusion of standing ChatGPT Pro remain unchanged.
