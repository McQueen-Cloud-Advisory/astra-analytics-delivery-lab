# Phase 6 correction, recovery and replay validation

Record **EV-P6-CORR-001**, v1.1. Run HDG-20260920-01 / OPP-02. Updated through cloud observation **2026-09-23T02:50:40.289Z** / September 22 America/Chicago; initial local record prepared at 02:41:16Z. **The bounded prepublication recovery check passes; Gate 6 remains In Progress.** Authority: [Gate 5 / DEC-G5-001](../gates/gate-5-data-design.md); expected answers remain the approved [FIX v1.0 baseline](../data/expected-fixtures.md). Literal FIX-02 was stopped before publication, recovered, then rerun as a verified no-op. A real local persistence failure and its repair are preserved below. No larger generated profile was introduced.

## Local oracle extension and observed checks

Both literal expected-result files now include independently entered `event_states` rows with event ID, revision, winning/contributing/superseded/future-effective flags. FIX-01 has ten winning contributing events. FIX-02 preserves E10 revision 1 as superseded and noncontributing; E10 revision 2 and late event E11 revision 1 contribute once. Its twelve retained event revisions have eleven winners. No event is future-effective in these two cases.

All previously recorded business answers are unchanged: FIX-01 **48 remaining / four overdue lines / 18 overdue units / $144**; FIX-02 **48 / four / 18 / $140**, with L08 **six remaining / $36** and L09 **two / $16**. Tests preserve the prior business-oracle content fingerprints independently of the new annotations. These annotations were not calculated by SQL or the source transformation.

Command executed in the September 22 America/Chicago session:

```text
node --test test/data/source-package.test.mjs test/data/expected-fixtures.test.mjs
```

**Pass: 49 tests, zero failures/skips, exit 0; reported duration 135.1945 ms.** Exact command start time was not instrumented. Forty-five existing admission/materialization checks pass; four additional checks verify annotation completeness and uniqueness, preserved source/business identities, the superseded-versus-winning revision distinction, and selection of the original FIX-01 event identities when replaying full FIX-02 history at the earlier knowledge cutoff. This is local admission/selection evidence, not execution of GoogleSQL or a report refresh.

| Fingerprint | SHA-256 |
|---|---|
| Current FIX-01 `expected.json`, including annotations | `6d897f8b1c8d7e92c8a3e3a69d8b6c53ce2df0f9a39b0ca10f85b86059328223` |
| Current FIX-02 `expected.json`, including annotations | `b855a4d8ef008b25d1552a493ed54acb17ead5c39f1a8015f4e7ba635b9a67ff` |
| Unchanged FIX-01 source package | `d770f164353581d3c890d5bba4ca47b6ebef38142dbb36988c1a2807970a9c6f` |
| Unchanged FIX-02 source package | `7233ba96d4b491bbecb6c83fd292940e66a27706d63aaa014f0959d23f0f4c20` |
| Unchanged FIX-01 manifest bytes | `f4555f5d520e10fa9eab0d2e4a1255c44f686138d22d4f6c0ec9fd7477b8a133` |
| Unchanged FIX-02 manifest bytes | `bb84ae8b731789e8ba779d336c6bb3d710e43d44d15f48ea0fc2de2134ab7876` |
| Unchanged `sql/fix01-transform.sql` | `22152ebc8fd883f5185ee31305a5a7339250611957b6e8dcb441470715b104bb` |

The original oracle bytes are retained in [FIX-01-v1.0.json](../../fixtures/po/oracle-history/FIX-01-v1.0.json) and [FIX-02-v1.0.json](../../fixtures/po/oracle-history/FIX-02-v1.0.json). Reconstruction removed only the newly added `event_states` block, then required an exact byte-hash match to the fingerprints already recorded in [the first local evidence](phase-6-local-validation.md) **before writing either history file**. Matches: FIX-01 `66a2d2229d82cbdf65c3ff7d377bc56ed8d5e23631c79079c18ddd065a279992`; FIX-02 `f7b31ee5a7c7977e4c285ebd63374f691ffeff8f370a6ca17ec30c119055ab15`. This preserves the old oracle revision without claiming it originally contained the new annotations.

## Executed cloud cases and retained failure

The [controlled-stop evidence](fix02-controlled-stop.json) retains the first attempt and its independent job/inventory inspection. The [recovery/replay evidence](fix02-recovery-and-replay.json) retains all three attempts, published rows, child jobs, final inventory and source fingerprints. All times below are **2026-09-23 UTC**; all attempts count against the **September 22 Pacific quota day**. Target remains `astra-po-lab-20260921 / us-east4`, using the scoped keyless runtime. FIX-02 batch: `fix02_d2076920fb226875340c87881dc043ed685f586187d5f5c70095c1a9a9d4b52a`.

| Attempt / actual time | Observed result | Query billed bytes |
|---|---|---:|
| `153c9b8cf6224b80be2e6f9041bcce85`, 02:44:53.038–02:45:05.566 | Candidate and retained FIX-01 reconciliation **PASS**; intended `CONTROLLED_STOP_BEFORE_PUBLICATION` reached, publication **Not Run**. Final local ledger replacement failed with **EPERM**, so the recorded attempt remains **FAIL**, not relabeled a clean controlled-stop exit | 83,886,080 / **80 MiB** |
| `239c9a6163484258bc62ccef50179c9c`, 02:48:19.324–02:48:32.696 | **PUBLISHED_AND_RECONCILED / PASS**. Both original load jobs were reused; FIX-02 published and reconciled, and retained FIX-01 passed again | 146,800,640 / **140 MiB** |
| `0c3890eac1454d668ccbcb0a3a494091`, 02:49:33.618–02:49:38.306 | **VERIFIED_NO_OP / PASS**. No load or publication job submitted; FIX-02 and retained FIX-01 reconciled | 62,914,560 / **60 MiB** |

The first command used `node scripts/run-pipeline.mjs --execute --input .lab/fixtures/FIX-02 --stop-before-publish`; the resume and no-op used the same command without the stop flag. At **02:47:12.547Z**, all five recorded first-attempt cloud jobs were inspected as DONE without errors before any resume. Serving inventory remained **10 snapshot rows / 10 event-evidence rows / one manifest**: only the prior FIX-01 batch was published. Its independent reconciliation still gave **48 remaining / $144**, while FIX-02's candidate had already passed. No publication job existed for the stopped attempt.

The EPERM failure affected local atomic journal replacement after the intended cloud stop. Its underlying filesystem cause was not established. The bounded repair retries the **same atomic rename** for EPERM/EBUSY/EACCES at 50/100/200/400 ms, at most **750 ms total delay**. It never deletes the destination or falls back to direct overwrite; a persistent failure preserves the previous journal and complete temporary candidate. **Five local repair tests passed** in [ledger.test.mjs](../../test/pipeline/ledger.test.mjs), covering successful replacement, transient recovery and bounded/permanent-failure preservation. This repair did not retry cloud jobs or reset attempt reservations. The recovery evidence pins repaired `src/pipeline/ledger.mjs` to `b9cf3640b17a875572042c712b7c0ffc1d2a05f5280f2827957770c7f93f3aa1` and records the other executed code/oracle hashes.

Recovery reused both retained load IDs with their original **10 line / 12 event-version** outputs. Publication committed at **02:48:24.403Z** with ten FIX-02 snapshot rows, twelve evidence rows and one READY/PASS manifest. Retained rows confirm **L08 received3 / remaining6 / $36**, **L09 received2 / remaining2 / $16**, and E10/1 superseded while E10/2 and E11/1 contribute. Independent reconciliation passed at line, event and scope levels: **48 remaining / four overdue lines / 18 overdue units / $140**. FIX-01 kept its own original batch and **$144** answer. The third attempt's job list contains only estimates and the two verification reads, demonstrating a same-input no-op without duplicated loads or publication.

**QA-06: Pass for the approved stop-after-candidate/before-publication boundary**, with the unexpected local persistence defect separately retained and repaired. This proves recovery of that bounded scenario and preserved access to the prior batch; no interruption was injected inside the publication transaction. QA-03/04 have observed subsequent cumulative input, correction and no-op subchecks; their retained-history delta and duplicate-arrival coverage remains incomplete. This does not close all FIX cases or Gate 6. FIX-02 Desktop refresh is **Not Run**; this record makes no new report-host claim.

## Usage, inventory and remaining authority

The three attempts consumed **293,601,280 query billed bytes (280 MiB)**. With earlier pipeline/Desktop observations, cumulative query usage is **367,001,600 bytes (350 MiB)**. At the verified $6.25/TiB rate, the **gross cumulative query estimate is $0.002086**; actual invoice cost remains unknown, and this is not a complete storage/connector cost total. The publication parent's 30 MiB and its ASSERT child's same 30 MiB are one charge and are not double counted; the remaining publication child statements report zero billed bytes.

Final metadata inventory: `po_work.raw_lines` **20** rows; `raw_event_versions` **22**; `po_serving.po_line_snapshot` **20**; `event_evidence` **22**; `batch_manifest` **2**. These include separate immutable FIX-01/FIX-02 batches, not extra business results from the no-op. Expirations remain unchanged: raw **2026-09-29T02:26:29.341Z**, serving/absolute backstop **2026-10-06T02:26:29.341Z**. Cleanup obligations continue.

**All three permitted cloud attempts for this quota day are consumed**, including the EPERM attempt and no-op. Full 2 GiB reservations per attempt remain in the ledger. No further workload is authorized within that daily attempt allowance; continue only permitted local work until the next eligible session and fresh envelope/readiness checks.

## Remaining scope and contract gap

**Retained-history ingestion is not established by cumulative FIX-02.** SRC rule 6 requires each incoming delta to be unioned with retained accepted versions before semantic validation. Current literal packages carry their own complete histories. The two-event delta E10/2 + E11/1 therefore still needs a tested retained-history merge, prior line/history lookup, cross-package immutable-key/conflicting-revision checks and explicit parent/input provenance. Missing or expired history must stop admission rather than invent neutral state. Keep this gap open when reporting QA-03/04; do not call a cumulative rebuild proof of delta ingestion.

FIX-03 invalid-source rejection with observed last-good preservation, and duplicate-arrival behavior, remain incomplete beyond local checks. FIX-04 still needs executed KPI results for both local-midnight sides, receipt void ($184), promise void ($174), and future-effective event before/after cutoff ($144/$134). FIX-05 still needs empty/closed-only, invalid/mixed-batch, exact 24-hour/24-hour-plus-one-second and invalid-clock results; final filters and buyer tasks remain within the later report phases. The next minimum is these tiny explicit cases and retained-history behavior, not a coverage/stress dataset. The [acceptance matrix](acceptance-matrix.md) owns complete criterion statuses; no synthetic success establishes company benefits.
