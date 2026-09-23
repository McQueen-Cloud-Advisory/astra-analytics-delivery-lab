# Project state

Run ID: HDG-20260920-01  
Prompt baseline: v2.0; SHA-256 `62B17009EBF408664AFEFCEC08AE93F5CF0AC4873FD2A2AB7E19C7CEEA3BA2FA`  
Current phase: Phase 6 — Correction/recovery/replay proven; remaining platform cases and CI  
Current gate: Gate 6 — Data Platform Validation  
Gate status: In Progress; package not yet ready  
Latest approved gate: Gate 5 — Analytics Design, unchanged  
Selected initiative: OPP-02 — overdue purchase-order follow-up  
Approved business baseline: Charter v1.1; Gate 4 architecture/envelope; Gate 5 contracts/fixtures/acceptance package v1.0 unchanged

## Actual authority and constraints

[Gate 3 / DEC-G3-001](gates/gate-3-project-selection.md) records OPP-02 selection and charter approval unchanged. [Gate 4 / DEC-G4-001](gates/gate-4-architecture.md) records architecture and bounded setup authority. [Gate 5 / DEC-G5-001](gates/gate-5-data-design.md#dec-g5-001--actual-approval-and-subsequent-evidence) approves the analytics/acceptance baseline unchanged and authorizes Phase 6. Do not request these approvals again. Future decisions must present **at most three options, identifying the recommendation**. Prior cost/publication/standing-subscription constraints remain.

Use local Node batches, BigQuery work/serving datasets in **us-east4**, and unpublished Desktop Import. Operate only long enough to retain the approved ingestion/processing/reporting and rerun/recovery evidence, then clean up. No 60-day minimum or observation requirement. Accepted ceilings remain **$10/calendar-month and $20 whole experiment**, with early stops at $8/month or $16 cumulative; they are not cloud-enforced monetary caps.

Gate 5 approves the seven-active-day aim, day-14 stop/review and seven-day raw retention. C3-04 closes on the approved contracts/fixtures. The minimal real cloud-to-Desktop proof now passes, permitting the next Phase 6 platform work; broader report behavior and final report development remain subject to the later gates.

## Executed setup and first-slice result

[Bootstrap evidence](evidence/cloud-bootstrap.md) preserves the earlier failed link. The manager subsequently linked an account and reauthenticated. [Cloud-control evidence](evidence/cloud-controls.json) verifies billing enabled on the open USD account ending **BA6E**, exact regional prices, a project-scoped **$10 alerts-only monthly budget**, and effective daily query quota **10,240 MiB (10 GiB)**. The manager confirms **at least $15 headroom**. No billing account was created by the agent. Headroom is a manager confirmation; an actual invoice has not been inspected.

Keyless `po-pipeline@astra-po-lab-20260921.iam.gserviceaccount.com` impersonation and a metadata request are verified, with project Job User and dataset-only Data Editor. The manager's Token Creator grant is scoped to that service account. Runtime calls bind the lab resource/quota project and do not use shared ADC or an Owner fallback. **financial-analytics-demo remains prohibited** for resources, billing or quota context.

Provisioning verified **two datasets (`po_work`, `po_serving`) and five tables** in us-east4 with logical storage billing, exact schemas, bounded grants and fixed expiry. Local `.lab/resource-manifest.json` starts the conservative resource clock at **2026-09-22T02:26:29.341Z**: raw expiry **September 29**, serving/absolute cleanup backstop **October 6**, at the same UTC time. Later runs do not reset it. These are setup observations, not proof of ingestion or analytics.

The second attempt completed **2026-09-22T02:36:20.527Z** with **PUBLISHED_AND_RECONCILED**: ten lines, ten events and zero independent-oracle differences. [First-slice cloud evidence](evidence/phase-6-cloud-proof.md) records **52,428,800 billed query bytes**, approximately **$0.000298 gross query cost at the verified rate**, not an observed invoice. The first attempt's unexplained exit1 is preserved as **ABORTED_PROCESS_EXIT**, with its reservation retained; the successful retry is the second of three permitted cloud attempts for the Pacific September 21 quota day. This is a first-slice cloud pass, not complete backend acceptance. Desktop was Not Run at that observation; the subsequent human/cloud proof below now closes the minimal integration check.

**Credential containment and reauthentication are complete.** The diagnostic token exposure is preserved in [SEC-001](evidence/security-evidence.md). Manager-authorized CLI revocation succeeded at **2026-09-22T02:43:12.7747162Z**, with zero active accounts verified; the manager then signed in again. A sanitized read-only check passed at **02:48:18.909Z**, including scoped access and existing results. No old-token reuse probe was performed. Cloud readiness is resumed; the historical exposure is not erased. Explicit dependency-audit authorization and executed CI remain open security/delivery evidence requirements.

The [post-run metadata record](evidence/cloud-proof.json) confirms exactly two datasets/five tables: raw **10/10** rows, serving snapshot/evidence **10/10**, and **one manifest**. Six top-level jobs and six script children are DONE without errors; children report zero billed bytes and total query usage remains **50 MiB**. No new query was submitted by that read-only validation. The prior diagnostic403 and corrected child-listing400 remain in the evidence history.

## Approved baseline and next action

- [Gate 5 approved v1.0](gates/gate-5-data-design.md): current promise, dates/quantities/value, whole-candidate rejection/corrections, and acceptance/short-duration details.
- [Source contracts](data/source-contracts.md), [KPI contracts](data/kpi-contracts.md), [generator spec](data/generator-spec.md), [independent fixtures](data/expected-fixtures.md), [implementation plan](plans/implementation-plan.md) and [acceptance plan](qa/acceptance-plan.md).
- [Architecture](architecture/solution-architecture.md), [ADR](decisions/adr-001-lab-architecture.md), [execution envelope](operations/execution-envelope.md), [minimal Desktop proof steps](operations/desktop-proof-steps.md), [proof artifact](../powerbi/opp02-proof/opp02-proof.pbip) and [readiness](environment-readiness.md).
- [Design validation](evidence/data-design-validation.md), [historical architecture checks](evidence/architecture-validation.md), [decision log](decisions/decision-log.md), [events](experiment-events.csv) and [protocol](experiment-protocol.md).

The manager already supplied Desktop August 2026 **2.157.1354.0 x64**, relevant format flags and normal launch/no error. Do not ask again; the manager remains the human host verifier. Native/browser automation was unavailable in the last check.

**Minimal proof closed:** on September 22 America/Chicago the manager reported no issues on either PBIP use and explicitly confirmed both refreshes showed 48 remaining units, $144 overdue value and 10 lines, including after save/reopen. [Desktop evidence](evidence/desktop-proof-validation.md) retains the messages and source round-trip. A fresh read-only check at **2026-09-23T02:35:33.487Z**, after required reauthentication, verifies 18 additional successful connector queries in the approved project/region against the pinned batch, 20 MiB additional billed query bytes, and no extra named dataset/table. Those jobs are not an exact refresh counter. Original cloud-plus-Desktop query usage is 70 MiB, about $0.000417 gross, not an invoice; the current Pacific September 22 day has zero billed bytes from these cached Desktop jobs. Do not repeat the completed host test. Preserve the user's Desktop-saved files.

**Correction/recovery/replay completed:** [FIX-02 evidence](evidence/phase-6-correction-validation.md) retains all three Pacific September 22 attempts. The first reached the intended pre-publication stop with candidate and retained FIX-01 reconciled, then failed on a local journal `EPERM`. A bounded atomic-file replacement repair passed fault tests. Recovery reused both load jobs and published the independent **48 units/$140** result; the third run verified a no-op. FIX-01 stayed unchanged. The same five tables now contain raw **20/22**, serving **20/22**, and **two manifests**, with original expirations. Today's workloads billed **280 MiB**; cumulative pipeline-plus-Desktop query bytes are **350 MiB**, approximately **$0.002086 gross query cost**, not an invoice or total-service bill.

**No fourth cloud attempt on Pacific September 22.** The daily attempt allowance is exhausted, including the retained failure. Next authorized local work is retained-history delta composition, remaining small boundary/rejection/duplicate cases, CI and security evidence. Future cloud work needs a new quota day and fresh readiness; do not clear reservations or reset resource lifetimes. Cumulative FIX-02 alone does not prove merging a partial delta with retained history. [Current local checks](evidence/ci-validation.md) pass 98 tests; GitHub CI is being prepared on a separate branch. Dependency-audit authorization remains pending. No final report development or release is approved.

On resume, reconcile this index with actual decisions and latest billing evidence. Earlier submissions/status text are historical; do not infer approval or test completion from a plan.
