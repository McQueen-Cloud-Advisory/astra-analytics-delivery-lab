# Experiment protocol

Version: 1.0. Run: HDG-20260920-01. Governing rules: [master prompt](../prompts/astra-analytics-delivery-master-prompt.md).

## Questions and evidence

| Question | Evidence to collect | Limit |
|---|---|---|
| Can the agent deliver correct, reproducible analytics within approved scope? | Versioned artifacts, independently expected KPI results, executed tests, rerun/recovery and host evidence, gate deviations | A single selected initiative supports a case study, not general capability claims |
| Where did management judgment change the result? | Decision alternatives, source and approved scope, rejected recommendations, subsequent effects | A business choice or scope change is not automatically an agent error |
| How much technical intervention was required? | Linked correction events with cause, consequence, and agent response | Routine gates, permissions, authentication, and human-only platform actions are separate categories |
| Was effort/cost proportionate to demonstrated value? | Observed timing, user-reported effort, actual available cost records, estimated ongoing cost, criteria results | Unknown effort and real business ROI remain unknown; simulation is not adoption or savings evidence |

## Measurement boundary

The earlier critical review is preparatory context, excluded from execution metrics. The first instrumented clock reading for this execution is **2026-09-21T00:43:44Z** (September 20 in America/Chicago). Some turn setup preceded that reading; a complete execution start timestamp is not available. Report measured elapsed time from that boundary, not total historic project time.

Target named in this experiment: GPT-6 Astra. The session identifies the assistant as GPT-6; an independently verified runtime model snapshot, hidden reasoning configuration, token usage, and agent monetary cost are unavailable. Record them as unknown rather than assuming exact values.

Three delegated agents support this preparation: governing-prompt revision, record templates, and opportunity/framework drafting. The primary agent integrates, performs preflight and checks, and owns the final recommendation. Agent review is part of the assisted workflow, not independent human validation. Record later changes to tools, model/configuration when observable, and delegation.

## Event records

Use [experiment-events.csv](experiment-events.csv) with `event_id,recorded_at_utc,run_id,phase,actor,category,outcome,evidence,human_minutes,notes`. Log material boundaries, recoveries, decisions, and interventions; do not produce one event per routine keystroke or tool call. `recorded_at_utc` is when the record was made; use notes if the action occurred earlier or over an interval. Unknown numeric observations are blank, never zero.

| Category | Definition |
|---|---|
| management_decision | Business, scope, cost, risk, or gate decision with a supported manager source |
| autonomous_execution | Substantial work completed inside approved scope |
| autonomous_recovery | Agent diagnoses/corrects an observed failure; identify evidence and whether recovery succeeded |
| technical_correction | Manager supplies/corrects material technical reasoning or implementation; also link the intervention log |
| permission_authentication | Required permission or authentication step, separate from technical correction |
| human_only_platform_action | Human performs a required host/platform step that the available tools cannot perform |
| external_blocker | A relevant external capability is unavailable or unverified; record scope affected |

A gate conversation may contain both a normal management decision and a technical correction; use distinct linked records when necessary. Count each correction once through its event ID. Record attempted versus successful recovery separately. Do not count the number of tests, commits, or CI executions as a quality score.

Elapsed time, active agent work, approval wait, and external blocker wait are different measures. Capture interval boundaries prospectively where practical; otherwise mark the decomposition unavailable. Human minutes come only from a user-reported value or an agreed timer. Never infer effort from chat timestamps. Cloud costs use actual attributable records when available; keep forecast and actual columns separate. No billable workload has been authorized by this protocol.

## Evidence conventions

Use [evidence/acceptance template](templates/evidence-and-acceptance.md). Each material claim identifies its type: observed lab result, scenario assumption, estimate, or unvalidated business hypothesis. Record source revision, environment, input/seed, expected and actual outcomes, command/procedure, timestamp, limitations, and retained evidence. Redact sensitive outputs. Preserve failed attempts alongside the later correction.

Acceptance statuses: Pass, Fail, Not Run, Blocked, N/A with justification. Missing host validation cannot pass a required report check. Thresholds and material KPI definitions are agreed before evaluating the resulting implementation. The generator/transform itself cannot be the sole oracle for expected results.

At the retrospective, report completeness of measurements as well as observed values. Separate technical correctness, observed lab usability/operations, and hypothesized real-world benefits. Include rejected recommendations, defects, unnecessary complexity, and valid stop decisions.

## Gate 2 clarification — single human, public or synthetic data

DEC-G2-001 establishes one human manager/operator/verifier assisted by the agent. Fictional business roles are personas, not additional staff. Delegated agents do not change the human count or provide independent human acceptance. Record actual user time only when observed/reported; a task-based planning allowance is a forecast, not measured effort or an implied hourly wage.

Keep three cost views distinct: (1) fictional-company professional labor and operation benchmarks used to compare opportunities; (2) projected incremental cash and personal workload for this lab; and (3) actual measured charges/time. Do not equate benchmark person-days with agent runtime, cash purchases, or a promised calendar schedule. Existing subscriptions, usage allowances and hardware are sunk/incremental only when confirmed; unavailable measurements remain unknown.

Public data must be appropriate and permitted for the intended use. For unavailable business events, synthesize data and label it; a public synthetic sample is still synthetic. Record generator effort, reference assumptions, injected defects, an independent small expected-result fixture, and omitted real-system behavior. Synthetic data can demonstrate specified logic and measured behavior at the tested scale; it cannot establish real business benefit, real extraction feasibility, unbiased distributions or unseen production edge cases. No data generator or platform has been implemented by recording these instructions.

## Selection follow-up — incremental cost boundary

DEC-SCOPE-001 confirms existing GCP with approximately $30/month allowance, an unpublished Power BI report and exclusion of the standing ChatGPT Pro subscription because it would be incurred regardless of this project. Do not allocate that subscription to the experiment or carry Power BI Service publication/capacity as an unresolved baseline cost. Agent runtime/effort remain measurable in principle even though the standing subscription is excluded; separately purchased API/tool usage is not assumed.

Focus actual cash measurement and optimization on attributable GCP consumption. Distinguish the allowance, existing/shared consumption, gross project usage charges and any verified credits or reductions; an allowance is not a credit or proof of zero incremental expense. Reconcile project costs to the relevant billing scope when available. Retain the fictional-company professional-labor model solely for its scenario comparison. Human time and actual charges remain unknown until observed/reported. This clarification is not selection or deployment authority.
