# Evidence and acceptance — TEMPLATE

**Draft template; no criteria approved and no checks executed.** Copy into `docs/evidence/` for the selected initiative. The [master prompt](../../prompts/astra-analytics-delivery-master-prompt.md) governs evidence and acceptance; link this record from the relevant gate package.

## Baseline

| Field | Value |
|---|---|
| Run / initiative / record revision | Unknown |
| Requirement baseline and approving decision | Unknown — no approval recorded |
| Evidence owner / reviewer | Unknown |
| Threshold definition date and revision | Unknown — define before observing results |
| Latest evidence timestamp | Unknown — no execution recorded |
| Durable evidence location and retention / expiry | Unknown |

Result vocabulary: `Pass`, `Fail`, `Not Run`, `Blocked`, `N/A`. Use `N/A` only with a reason and any required applicability decision. Preserve failed attempts and link subsequent fixes and reruns; missing or inaccessible evidence does not establish a pass.

## Requirement-to-test matrix

| Requirement ID | Approved definition / source revision | Expected result and tolerance | Scenario / fixture / seed | Verification method and independent oracle | Owner / reviewer | Result | Evidence / blocker / N/A rationale |
|---|---|---|---|---|---|---|---|
| Unknown | Unknown — unapproved | Unknown — not defined | Unknown | Unknown | Unknown | Not Run | None recorded |

Use stable IDs and one row per material criterion. Cover applicable business rules, initial and repeat loads, omitted/duplicated events, corrections, malformed input, recovery, actual CI/security execution, cost limits, and report/operations behavior. Identify applicability explicitly rather than creating unnecessary implementation requirements.

## Execution evidence — repeat per run or link equivalent retained output

| Field | Value |
|---|---|
| Evidence / execution ID and requirement IDs | Unknown |
| Command or exact human verification procedure | Unknown |
| Timestamp with timezone / executor | Unknown |
| Source revision or content hash | Unknown |
| Dataset / generator / fixture version and seed | Unknown |
| Environment / host / relevant tool versions | Unknown |
| Expected result / threshold baseline | Unknown |
| Actual result / observation | Unknown — not executed |
| Result | Not Run |
| Sanitized output / screenshots / retained CI run | None recorded |
| Durable summary if original evidence expires | Unknown |
| Failure / defect and fix revision | Unknown |
| Previous attempt / rerun evidence IDs | Unknown |
| Verification limitations | Unknown |

## Report and operations coverage

These are coverage prompts, not completed checks. Split rows into requirement IDs with concrete expected results in the matrix above; use justified `N/A` when appropriate.

| Coverage area | Applicable scenarios and requirement IDs | Intended host / named verifier | Result / evidence |
|---|---|---|---|
| KPI totals and filter context | Unknown — include totals, subtotals, slices, and independent reconciliation | Unknown | Not Run |
| Relationships, dates, and aggregation | Unknown | Unknown | Not Run |
| Empty, error, and stale states | Unknown | Unknown | Not Run |
| Refresh sequencing, freshness, completeness | Unknown | Unknown | Not Run |
| Intended-user access and row-level restrictions | Unknown | Unknown | Not Run |
| Interaction performance and usability | Unknown | Unknown | Not Run |
| Accessibility and platform limitations | Unknown | Unknown | Not Run |
| Failure, alert routing, replay, and recovery | Unknown | Unknown | Not Run |
| Release smoke / access / refresh checks | Unknown | Unknown | Not Run |

## Claim-to-evidence register

Evidence types: `Observed lab result`, `Scenario assumption`, `Estimate`, `Unvalidated business hypothesis`. Separate technical correctness, observed lab usability/operations, and hypothesized business benefit.

| Claim ID / conclusion | Evidence type | Supporting requirement / evidence | Scope and limitations | Remaining validation and owner |
|---|---|---|---|---|
| Unknown — no conclusion recorded | Unknown — not classified | None recorded | Unknown | Unknown |

## Acceptance summary for a gate

- **Exact artifact / environment evaluated:** Unknown.
- **Passed, failed, not run, blocked, and N/A requirements:** Unknown — no execution recorded.
- **Unresolved defects, missing host verification, and conditions:** Unknown.
- **Recommendation and alternatives:** Unknown — this is not the manager's decision.
- **Actual decision record:** None recorded — link the gate record when available.
