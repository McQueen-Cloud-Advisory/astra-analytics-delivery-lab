# Minimal Desktop proof validation

Record **EV-P6-DESKTOP-001**, v1.0, recorded 2026-09-23 UTC (2026-09-22 America/Chicago). Run **HDG-20260920-01 / OPP-02**. Authority: [Gate 5 / DEC-G5-001](../gates/gate-5-data-design.md). **QA-07 minimal proof: Pass**, based on the manager's host confirmation, Desktop-saved source and the scoped cloud observation below. This is the first integration proof, not final report acceptance or approval of Gate 6.

## Human host result

The manager reported: **“There were no issues when when using the PBIP file either time.”** After the agent asked for confirmation of both refreshes, the expected values and save/reopen, the manager confirmed: **“Re-auth done and yes, the those values match.”** This confirms both refreshes showed **48 remaining units, $144.00 overdue value and 10 lines**, including the save/reopen check in the [host procedure](../operations/desktop-proof-steps.md).

The proof remains bound to `fix01_5f624cd96d7420ac70f1d04569c97efa81697391353f6d455d5ec1dd1445c2cc`, with synthetic source as-of **2026-09-21 12:00:00Z**. The manager performed the host actions; Astra did not directly observe the rendered Desktop window. Exact refresh, rendering and reopen times were not retained. File-save and cloud-job times below do not substitute for those measurements.

## Saved source and local validation

Read-only inspection found Desktop-saved metadata, with report-definition writes at approximately **2026-09-23T00:21:56Z** and PBIP/model-definition writes at approximately **02:30:00Z**. All ten JSON files have changed byte hashes from the retained [original schema-validation record](../../powerbi/opp02-proof/metadata-validation.json). Nine match the original after JSON formatting normalization; the remaining report definition adds `settings.useEnhancedTooltips: false`. No visual field or model reference changed.

Desktop added TMDL lineage and navigation/result annotations, model data-access options and a tooling annotation, and omitted the redundant `ref expression pBatchId` entry. The actual expression remains. Import mode, explicit lab billing project, ADBC `Implementation="2.0"`, Storage API, the two same-batch predicates, manifest guard, measures and three visual bindings remain intact. These saved changes and the manager's result support installed-host deserialization and source save/reopen compatibility. The original fingerprints are historical evidence and were not rewritten to imply the current bytes received the earlier schema check.

The [local validator](../../powerbi/opp02-proof/validate-metadata.mjs) now reads exactly **14 named source files: ten JSON-format files and four TMDL files**. It does not enumerate the project tree. It rejects redirected source paths before reading them and accepts Desktop's BOM, CRLF, spacing and omitted redundant expression reference. No `.pbi`, caches, settings, credentials or user binaries were read; no report/model source was rewritten.

| Executed local check | Result and scope |
|---|---|
| `node powerbi/opp02-proof/validate-metadata.mjs` | **Pass**: 14 allowlisted source files, three visual bindings and declared Import/batch/manifest/freshness guards |
| `node --test test/powerbi/metadata.test.mjs` | **Pass: four tests, zero failures/skips**. Checks private-file exclusion, Desktop serialization without rewriting, rejection of broken bindings/wrong billing target, and a redirected folder that must be rejected before private content is read |

These are static source checks, not a new JSON schema run or execution of the TMDL, M or DAX engines. The [earlier local validation](phase-6-local-validation.md) retains its original implementation-suite results and fingerprints.

## Independent cloud observation

The sanitized [read-only cloud evidence](desktop-cloud-observation-2026-09-23.json), observed **2026-09-23T02:35:33.487Z** after the manager reauthenticated, records **18 new non-runtime query jobs**, all `DONE` without a job error, in **`astra-po-lab-20260921` / `us-east4`**. Each query includes the ready batch and reads the manifest or snapshot. These jobs support actual source access in the expected scope; they are not a one-to-one count of Desktop refreshes.

The new jobs total **20 MiB billed bytes**, attributable to the first observed session on 2026-09-22 UTC. Jobs on the current Pacific quota date, 2026-09-22, report **zero billed bytes** and cache hits. These are job byte observations, not an invoice or a claim that all project costs are zero. The observation itself submitted no query.

The named inventory remains **two datasets and five tables**: raw lines/events **10/10**, serving snapshot/evidence **10/10**, and manifest **1**. No additional named ADBC dataset/table was observed. Managed anonymous query-cache destinations are present in job metadata and excluded from the named-dataset inventory; their presence is not hidden or mistaken for a new user-provisioned dataset.

## Acceptance limits

The combined evidence closes the minimal QA-07 open/import/render, repeat-refresh and save/reopen proof for this fixture. Displayed totals are manager-confirmed, not independently screen-captured; no account identifier or precise human effort measurement is retained. Query records establish scope and execution, not visual rendering time or every line-level business calculation.

Broader corrections/replay/recovery, all KPI boundaries, filters, event drilldown, buyer tasks and final report design still require their own implementation and acceptance evidence. Security checks and CI remain separately tracked; this proof does not close them. The data is synthetic and provides no evidence of realized company benefit. Full criteria remain in the [acceptance plan](../qa/acceptance-plan.md).
