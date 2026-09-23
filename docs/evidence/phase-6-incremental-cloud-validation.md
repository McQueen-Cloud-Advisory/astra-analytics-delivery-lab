# Phase 6 retained-cloud-history delta validation

Record **EV-P6-INCR-002**, v1.0. Run HDG-20260920-01 / OPP-02. Observed **2026-09-23T23:00:18.405Z–23:00:47.872Z** (September 23 America/Chicago), under [Gate 5 / DEC-G5-001](../gates/gate-5-data-design.md). **Accepted cloud-parent linkage, runtime composition and reconciliation of the existing FIX-02 batch: Pass. New delta-origin publication: Not Run.** Gate 6 remains In Progress.

The [machine-readable result](phase-6-incremental-cloud.json) retains executed code fingerprints, exact package/batch identities, all job IDs, original load metadata, source occurrence provenance and billing observations. It supplements the [earlier local composition proof](phase-6-incremental-local-validation.md) and [cumulative correction/recovery proof](phase-6-correction-validation.md); it does not relabel either historical run as delta ingestion.

## Executed attempt and retained failure

```powershell
node scripts/run-pipeline.mjs --delta fixtures/po/FIX-02-delta --execute
```

| Attempt | Observed result |
|---|---|
| `81672f728f5b42059905f2e261e7cd12`, **22:59:13.468Z–22:59:13.691Z** | **Fail** at `VERIFYING_RESOURCES`, sanitized code `CLOUD_OPERATION_FAILED`, zero recorded jobs. The failed attempt and its 2 GiB reservation remain in the local ledger. |
| `81ae365a061942e4b2b5c79c09c28b07`, **23:00:18.417Z–23:00:47.870Z** ledger interval | **Pass**, `VERIFIED_NO_OP`; four dry-run estimates and four completed read jobs. Its separate 2 GiB reservation also remains. |

The coordinating agent observed that the same scoped runtime metadata read failed within the default execution sandbox and passed with `require_escalated`, without changing login or runtime identity. This comparison points to a local execution-boundary issue; the underlying failure cause was not retained and is not established. The successful pipeline attempt ran outside the sandbox with the same scoped runtime identity. These are **two of the three daily attempts** for the September 23 Pacific quota day; the first failure was not reset or removed.

## What the successful run established

The runtime used `po-pipeline@astra-po-lab-20260921.iam.gserviceaccount.com` against **astra-po-lab-20260921 / us-east4**, verified the existing two-dataset/five-table resource envelope and unchanged expiry, then read FIX-01's published READY/PASS manifest and complete serving evidence. Its original publication timestamp is **2026-09-22T02:36:12.755Z**.

It separately read **all 20 retained physical source occurrences**: ten PO lines and ten event revisions. Exact locators, source facts, package identity and recomputed payload hashes matched pinned FIX-01. Original scoped load jobs were DONE, each with ten output rows; their creation/start/completion times and the retained ingestion timestamps were consistent with the resource lifetime and accepted publication. Reconstructed source bytes matched the pinned file hashes and passed complete-history admission. A caller-provided READY flag was not used as acceptance evidence.

The submitted delta contained **zero lines and two events**, E10 revision 2 and E11 revision 1. Composition with that verified retained history reproduced the existing complete FIX-02 package and deterministic batch identity. The result preserves **22 resolved physical origins**, including both delta locators, plus a separate actual-cloud-parent binding. The ledger saved this provenance before querying the target FIX-02 publication.

| Provenance component | SHA-256 |
|---|---|
| Accepted FIX-01 source package | `d770f164353581d3c890d5bba4ca47b6ebef38142dbb36988c1a2807970a9c6f` |
| Submitted FIX-02 delta package | `d64d01eca11bde0e5df7a50b0797fccaff9bcbf12cc4dde27370928da52ea6ec` |
| Resolved FIX-02 source package | `7233ba96d4b491bbecb6c83fd292940e66a27706d63aaa014f0959d23f0f4c20` |
| Runtime composition plus actual cloud-parent binding | `a9be4798cc0a298936883ff8006a71111b94fd776f99588ab156a9b72b62fb72` |

The pure composition component retains `LOCAL_COMPOSITION_ONLY` and its original local hash. The separate runtime binding, verified at **23:00:46.310Z**, supplies actual cloud acceptance evidence; top-level `parent_history_verification` and `runtime_composition` are both **Pass**.

FIX-02 was already completely published, so the runner verified it against the independent oracle and rechecked retained FIX-01. The result explicitly records `publication_action: EXISTING_BATCH_VERIFIED` and `new_batch_published: false`. **No load, transform execution, new serving publication or Desktop refresh occurred in this attempt.** `publication: Pass` denotes reconciliation of that existing complete publication.

## Cost, retention and limits

| Completed read stage | Actual bytes billed |
|---|---|
| Accepted FIX-01 serving evidence | 30 MiB |
| Retained FIX-01 raw occurrences | 20 MiB |
| Existing FIX-02 reconciliation | 30 MiB |
| Final retained FIX-01 reconciliation | 30 MiB |
| **Total** | **110 MiB / 115,343,360 bytes** |

Each submitted read had a **1 GiB maximum bytes billed**, and the attempt stayed within its **2 GiB** reservation. Bytes billed are observed query usage, not a dollar invoice or realized spend. Original raw expiry remains **2026-09-29T02:26:29.341Z**; the original serving/experiment deadline remains **2026-10-06T02:26:29.341Z**. The run created no datasets or tables and extended no deadline.

Before cloud execution, the local suite passed **160/160 tests**, including **29 delta-specific cases**. Mock tests cover an absent FIX-02 target proceeding to bounded publication, provenance-save failure preventing downstream work, invalid acceptance/load metadata, raw tampering and missing/expired history. Those cases do not establish actual new delta-origin publication or actual cloud fault injection. The actual evidence here closes the narrowly scoped accepted-history linkage and delta-to-existing-batch reconciliation subchecks; broader duplicate-arrival delta acceptance, new delta-origin cloud publication, remaining QA criteria and later gates retain their separate evidence requirements. Full provenance is persisted in the local attempt/result evidence; no new cloud provenance schema was introduced.
