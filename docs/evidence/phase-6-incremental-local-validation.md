# Phase 6 local retained-history composition

Record **EV-P6-INCR-001**, v1.1. Run HDG-20260920-01 / OPP-02. Historical test observations through **2026-09-23T03:09:29.407Z** / September 22 America/Chicago. **At that observation, local composition passed; cloud accepted-history linkage and delta execution were Not Run.** Work follows snapshot commit `8e9649e`, under [Gate 5 / DEC-G5-001](../gates/gate-5-data-design.md) and [SRC v1.0 rule 6](../data/source-contracts.md). No business definition or independent expected answer changed.

**Subsequent observation, September 23 at 23:00:47.872Z:** [EV-P6-INCR-002](phase-6-incremental-cloud-validation.md) records actual accepted cloud-parent verification and runtime composition, followed by successful reconciliation of the already published FIX-02 batch. It was a verified no-op; new delta-origin cloud publication remains Not Run. The historical local-only findings below are preserved. Gate 6 remains In Progress.

## Partial input and preserved identities

The checked [FIX-02-delta manifest](../../fixtures/po/FIX-02-delta/manifest.json) describes zero PO-line records and exactly two event records: E10 revision 2 corrects L08's receipt to three; E11 revision 1 adds L09's late receipt of two. Both are synthetic. The event file is the exact final 436-byte suffix of cumulative FIX-02, in its original order and LF encoding. The profile remains `FIX-02`; business as-of is `2026-09-21T12:00:00Z` and knowledge cutoff is `2026-09-21T13:00:00Z`.

| Artifact / identity | Actual count / SHA-256 |
|---|---|
| Delta `po_lines.jsonl` | 0 records, 0 bytes; `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| Delta `line_events.jsonl` | 2 records, 436 bytes; `78c3c3073742899b515a2afb3105a6d42ef9413a43df338f04e9da607fc23436` |
| Delta manifest bytes | `4b6c218eed3127527704d82fc838689f4511a4271a6283edff002fe35855d49c` |
| Delta source package | `d64d01eca11bde0e5df7a50b0797fccaff9bcbf12cc4dde27370928da52ea6ec` |
| Complete retained local FIX-01 parent | `d770f164353581d3c890d5bba4ca47b6ebef38142dbb36988c1a2807970a9c6f` |
| Resolved complete FIX-02 package | `7233ba96d4b491bbecb6c83fd292940e66a27706d63aaa014f0959d23f0f4c20` |
| Separate local composition provenance | `a2c9794c661e015ad1ea430510164e9d8e166407839919cdfa65721d303b5c1a` |

An initial local assertion run at **03:04:49.134Z** verified the suffix, empty file, actual manifest counts/hashes and unchanged complete-source/oracle identities. Standalone `readSourcePackage('fixtures/po/FIX-02-delta')` correctly rejected it with **MISSING_LINE**, locator `line_events.jsonl:1`. This is expected rejection of incomplete history, not a failure to parse its manifest. Existing FIX-01/FIX-02 source bytes and `expected.json` files were not changed; their prior fingerprints remain in [correction evidence](phase-6-correction-validation.md).

## Executed local proof

On **Node v24.15.0**, the command below ran from **2026-09-23T03:08:52.5207570Z** to **03:08:52.6621016Z**:

```powershell
node --test test/data/retained-history.test.mjs
```

**Pass: 12 tests, zero failures/skips, exit 0; reported duration 98.03 ms.** The checks prove exact full-FIX-02 bytes/manifest after composition, independent oracle key sets, deterministic immutable inputs, per-occurrence provenance and the continued rejection of standalone delta admission. Fault cases cover missing/substituted parent, stale byte hashes, conflicting revisions, revision gaps, changed event identity, changed immutable lines, missing masters, unreviewed subsets and caller-forged parsed records. Extra physical duplicates survive envelope parsing but fail the exact delta pin; this bounded test does **not** establish acceptance of duplicate-arrival delta packages.

The coordinating agent separately observed the complete local suite on the same Node version from **03:09:28.422Z to 03:09:29.407Z**: **110/110 passed**, zero failures/skips; reported duration **946.0841 ms**. This is local regression evidence, not an executed CI run or additional platform proof. `node scripts/validate-docs.mjs` subsequently passed structural checks for 73 Markdown files; it does not establish these runtime outcomes.

The [composition API](../../src/data/retained-history.mjs) is `composeIncrementalPackage({parent, delta})`, with raw package envelopes obtained through `readPackageEnvelope(directory)`. The envelope reader validates bytes and individual record structure only. Composition revalidates the complete pinned parent, combines physical bytes, applies full-history admission, then requires the reviewed delta and complete-result identities. It returns `{package, source, composition}` without filesystem writes. The separate composition record preserves all **22 physical origins**: ten lines and ten prior event records from FIX-01, plus two delta events. Delta locators 1/2 map to resolved event locators 11/12. Caller flags cannot confer cloud acceptance.

Fingerprint observation at **03:09:06.399Z**:

| Executed local file | SHA-256 |
|---|---|
| `src/data/source-package.mjs` | `4947b6a17c52e98bb9a8c14988ac8504e2f220819a85c026f8f5dffa3d480552` |
| `src/data/retained-history.mjs` | `df655db6dc93e888326f4a52e4ff6243ba532ba40fb2e34f6bfe6a16d1496c6f` |
| `test/data/retained-history.test.mjs` | `c2367792e7bee5d80ba0f1c829b623f827dc9936187cf24a9c09675da8cab24e` |

## Integration boundary at the historical local observation

The provenance explicitly states `LOCAL_COMPOSITION_ONLY`, with `cloud_acceptance_linkage` and `cloud_execution` both **Not Run**. No cloud/authentication call, load, query, publication or report refresh occurred in this check. At this observation, the runner and golden materializer accepted only the implemented complete packages. Matching the already published FIX-02 bytes does not turn that earlier cumulative run into a delta-ingestion test.

Before a cloud delta path can satisfy SRC rule 6, it must verify the actual parent's retained READY/PASS batch and source identity, resolve only that accepted history, retain the submitted-delta/parent/composed provenance, and apply whole-candidate admission before any publication. Raw rows from stopped or rejected candidates are not accepted history. Missing or expired history must fail or require a complete pinned replay source. A local caller-supplied parent and a matching hash alone cannot establish these cloud facts.

At this historical observation, QA-03/04 remained **Not Run overall** in the [acceptance matrix](acceptance-matrix.md), with passing subchecks recorded separately: the narrowly tested local composition subcheck passed, while actual delta admission, accepted-history linkage and duplicate-arrival coverage remained open. The [previous cloud evidence](phase-6-correction-validation.md) governed that exhausted daily attempt allowance and unchanged resource expiry. Later results and their distinct quota day are recorded in [EV-P6-INCR-002](phase-6-incremental-cloud-validation.md); neither this local record nor that subsequent subcheck approves a gate.
