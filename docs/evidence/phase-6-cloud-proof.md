# Phase 6 first cloud proof

Run HDG-20260920-01; OPP-02; observed 2026-09-22 UTC / September 21 America/Chicago. Authority: [DEC-G5-001](../gates/gate-5-data-design.md#dec-g5-001--actual-approval-and-subsequent-evidence), unchanged contract/fixture/QA baselines. **First cloud slice: Pass. Desktop: Not Run. Gate 6: In Progress.**

The [sanitized execution record](cloud-proof.json) preserves source hashes, both attempts, job IDs and byte counts, and the provisioner's read-back resource manifest. [Local validation](phase-6-local-validation.md) and [cloud controls](cloud-controls.json) establish separate supporting evidence; neither substitutes for the actual executed pipeline.

## Expected and observed result

Command: `node scripts/run-pipeline.mjs --execute --input .lab/fixtures/FIX-01`. Node 24.15.0; BigQuery client 9.1.0; Google auth library 11.1.0; keyless `po-pipeline` service account. Every job targets **astra-po-lab-20260921 / us-east4**. No deprecated project, new billing account, scheduled compute, Power BI publication or user-managed service-account key was used.

The pinned literal synthetic package is FIX-01 / GEN-01-v1.0, SHA-256 `d770f164353581d3c890d5bba4ca47b6ebef38142dbb36988c1a2807970a9c6f`. Its independent oracle requires 91 ordered, 31 received, 12 cancelled and **48 remaining units**, with **four overdue lines / 18 overdue units / $144 overdue purchase value**. The successful runner reconciled line fields, event identities/flags and scope totals against that oracle, atomically published snapshot/event-evidence/manifest, and reconciled the published batch again with **zero differences**. Ten raw lines and ten raw events loaded; ten snapshot rows and ten event-evidence rows passed reconciliation. The manifest is READY/PASS.

Batch: `fix01_5f624cd96d7420ac70f1d04569c97efa81697391353f6d455d5ec1dd1445c2cc`.

| Attempt | Observed outcome | Retained accounting |
|---|---|---|
| `32d8683c404649c9bb781059b3fe63bd`, started 02:29:07.848Z | Process exited 1 without output or normal error-handler completion. Process no longer existed; metadata inspection at 02:34:18.083Z found zero project jobs. Cause remains unknown. Original lock/ledger preserved before clearing the stale lock. | ABORTED_PROCESS_EXIT; one daily attempt and full 2 GiB reservation retained |
| `937a846714d24ecaa27a950c7dd8d4bd`, completed 02:36:20.527Z | **PUBLISHED_AND_RECONCILED**, exit 0. Added durable startup/dry-run stages before this bounded retry; no cost or business-rule limit changed. | Second of three permitted attempts on Pacific September 21; full 2 GiB reservation retained |

The first abort is not the planned publication-interruption/recovery acceptance test. That test, same-input rerun, subsequent/corrected input and broader boundary cases remain unexecuted in the cloud.

## Usage, resources and limitations

The successful runner returned **52,428,800 query billed bytes (50 MiB)**: 20 MiB transformation and 30 MiB published read-back; pre-read and publication parent reported zero. At the verified regional $6.25/TiB rate this is a **$0.000298 gross query estimate**, before free tiers/credits. It is not an invoice or a complete storage/Storage API cost measurement. Actual account charges remain unknown. No extra query was submitted for evidence collection.

Created `po_work` and `po_serving`, with five explicit tables listed in the JSON manifest. Runtime has project Job User plus dataset Writer; manager retains pre-existing setup Owner privileges, which are broader than report-only access. Region, schema and expiry were verified before pipeline queries. Query limits were configured and actual usage stayed within them; an intentional over-limit rejection has not been exercised.

The conservative resource clock began **2026-09-22T02:26:29.341Z**. Raw table expiry is **September 29 at 02:26:29.341Z**; serving expiry and absolute cleanup/review backstop are **October 6 at 02:26:29.341Z**. Dataset/service-account/budget/binding cleanup remains an explicit obligation: table expiration does not delete those resources. Finish and preserve evidence sooner where possible; no minimum operating duration applies.

A post-run diagnostic incorrectly tried to read the service account's temporary query results as the setup user and received HTTP 403. Its uncaught SDK error exposed a temporary access token in tool output. The diagnostic wrote no evidence file and submitted no new query. [SEC-001](security-evidence.md) records the incident and manager-authorized CLI revocation, which succeeded at 02:43:12.7747162Z, followed by renewed sign-in and successful safe access verification at **02:48:18.909Z**. The security pause is resolved; the earlier failure remains part of the evidence.

The JSON evidence now retains the post-run named-resource inventory, all six top-level jobs, all six publication child jobs, and the 21 rows returned by the completed publication read-back (10 lines, 10 events, one manifest). All jobs are DONE without error; child jobs each report zero billed bytes, confirming the publication parent's zero without double counting. Named tables total **12,257 logical bytes** at inspection; default dataset listing excludes BigQuery-managed anonymous result caches. An intermediate child-job listing with setup/allUsers returned HTTP 400; using the original scoped identity without allUsers succeeded. These were metadata/result retrievals, not new SQL queries. The [jobs.list API](https://docs.cloud.google.com/bigquery/docs/reference/rest/v2/jobs/list) distinguishes top-level jobs from a parent-filtered child listing. Actual billing and Desktop job usage remain unverified.

## Next authorized step

Complete the [minimal Desktop procedure](../operations/desktop-proof-steps.md) using the separately generated proof bound to this batch. Local metadata validation passes; actual TMDL/M/DAX parsing, Google sign-in, initial/repeat Import, rendering and reopen remain **Not Run**. The manager is the host verifier and has been asked to execute the procedure. Do not expand backend work before the real minimal proof passes, or begin final report development before Gate 6 approval.

These are synthetic lab observations. They establish neither Harborline source quality nor adoption, financial return or actual business savings.
