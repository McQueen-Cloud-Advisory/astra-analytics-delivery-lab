# Phase 3 validation

Run: HDG-20260920-01. Scope: Gate 2 approval recording, Phase 3 comparison, source/solo-effort assessment, and Gate 3 v1.0 with draft charter v1.0. Results recorded against **2026-09-21T01:32:50Z**; checks occurred earlier in this turn. This is local/document evidence, not Gate 3 approval or platform/host validation.

Historical record: the subsequent selection follow-up revised four submitted documents to v1.1. Their v1.0 bytes are preserved at the archive links in the fingerprint table below; original outcomes/hashes remain unchanged. See [follow-up validation](selection-follow-up-validation.md) for current revisions and the cost clarification.

## Checks and observed results

| ID | Procedure | Result / limit |
|---|---|---|
| PRIOR-01 | Preserve original Gate 2 bytes and compare historical fingerprints | Pass: submitted package matches the Phase 2 retained hash; original triage, portfolio, master prompt and submitted Gate 1 framework also match. No approved weight/anchor change |
| PRIOR-02 | Bind actual approval and clarification to package/version | Pass for source review: Gate 2 record revision 1.1 and DEC-G2-001 contain the user's faithful approval, unchanged dispositions/premises, one-human constraint and public/synthetic-data implications |
| PRIOR-03 | `node scripts/calculate-prioritization.mjs --check` | Pass: deterministic retained results match. Script asserts approved survivors/weights/SCN baselines, anchor boundaries, normalization and valid scores. Checks cover 16 weight perturbations, 2 full-weight scenarios, 3 redundancy cases, 3 estimate profiles, 26 one-criterion cases, adverse economics and overlapping uncertainty |
| PRIOR-04 | Root review of script, inputs, score anchors and economics | Pass for internal consistency: gross value remains separate from partial ownership cost; excluded cost additions remain unknown; actual lab feasibility is not replaced by a neutral score. No observed benefit, savings or ROI established |
| PRIOR-05 | Official public-source descriptions and selected schema review | [Data-feasibility record](../portfolio/data-feasibility.md) retains exact links, inspected coverage, public/synthetic distinction, attribution duties and limits. No dataset downloaded, restored or profiled; suitable public alternatives may exist beyond this bounded review |
| PRIOR-06 | Separate agent review of draft charter, Gate 3 and single-person forecast | Pass for document review: human-hour totals sum, one person holds all actual roles, proposed local Power BI endpoint is explicit, conditions close at the appropriate gates, and independent synthetic expected results are required. Agent review is not independent human acceptance |
| PRIOR-07 | `node scripts/validate-docs.mjs` | Pass: 32 Markdown files, local links/tables/encoding/fences, nine gates and release order, twelve portfolio records/disjoint buckets, weights and current gate reference. Does not authenticate human approval or validate platforms |
| PRIOR-08 | `git diff --check` and scope review | No tracked whitespace errors; Git emitted normal line-ending conversion notices. New files also pass the documentation checker. No existing Power BI artifact was edited, no product generator/report/backend was built, and no resource, release or remote repository mutation was performed |

Three delegated workstreams covered reproducible comparison, public/synthetic data feasibility, and one-human effort/selection critique. The data reviewer then reviewed the integrated charter/estimate/gate package. The primary agent recorded approval, integrated the recommendation and independently ran the local checks.

## Recoveries and remaining uncertainty

The first calculation invocation used an incorrectly guessed Gate 2 snapshot filename and failed with ENOENT; correcting the source reference to the actual preserved snapshot resolved it. An inspection command failed on quoting and was replaced with a direct PowerShell read. An integrated patch was rejected because it combined delete/add operations on the same state path; it made no changes and was replaced with an update patch. An early documentation check found the still-pending evidence-record link; creating this record resolved it. These were agent recoveries with no human technical correction, not source/platform test failures.

GCP billing/IAM, supported delivery tooling, Power BI host execution/connection/refresh and required entitlements remain unresolved. No cloud query, CI run, dataset import, platform deployment or report render is claimed. Actual human time, agent runtime/cost and total incremental cash remain unknown. Planning allowances are estimates. Gate 3 is Awaiting Decision; architecture has not started.

## Retained local output

```text
Base: OPP-01 4.0; OPP-02 3.9; OPP-04 3.3
Practical tie within 0.2: OPP-01, OPP-02
Checks passed: 16 weight perturbations; 2 full-weight scenarios; 3 redundancy cases; 3 estimate profiles; 26 one-criterion cases; adverse case and uncertainty overlap.
Stored calculation evidence matches.
PASS: 32 Markdown files: local links, table structure, encoding, code fences
PASS: Nine ordered gates and release step placement
PASS: Twelve distinct portfolio detail records
PASS: Comparison/detail consistency and disjoint 3/4/3/2 portfolio buckets
PASS: Framework weight completeness and normalization
PASS: Current state has an existing gate record
Local structural validation passed. Human approvals and platform behavior require separate evidence.
```

## Submitted artifact fingerprints

SHA-256 identifies uncommitted bytes, not a commit or approval. These hashes bind the Gate 3 submission and its inputs; later approval appends an actual decision while preserving the submission.

| Artifact | SHA-256 |
|---|---|
| [Original Gate 2 package v1.0](../gates/gate-2-package-v1.0-submitted.md) | `C9FB7CA53C53BB54551F826E87EC646DA03BF93D084BF801E8BCFE135871E52A` |
| [Gate 2 approved decision record revision 1.1](../gates/gate-2-triage-review.md) | `92BFFF1F4EECDC8887CE3421D52A406E76F32839D0CA4E9462F76667979D5126` |
| [Gate 3 package v1.0](../gates/gate-3-package-v1.0-submitted.md) | `08287415A0CA6AAB9C65546977E57BB80FED85E226B473CA2AA99BBBB1028688` |
| [Draft charter v1.0](../project-charter-v1.0-submitted.md) | `EC71C5C8CA29D3DF991514A777EE30E0852D176B0D3A47F47322C8E30084EE32` |
| [Prioritization v1.0](../portfolio/prioritization-v1.0-submitted.md) | `7CB883665943A2AA1F093692C8F631FA3870F52577EC9BDFD8FC32117C671FAE` |
| [Machine-readable inputs](../portfolio/prioritization-inputs.json) | `7BDA7DD01878642A4162A82556A0DB341BA8F3B2E3FBAF4F16B7B9D3B34B4374` |
| [Calculation script](../../scripts/calculate-prioritization.mjs) | `3FEAFCAF0F5314C568CE156672CF35A3E723C8F12EEF452CE5188FF77F7988E5` |
| [Retained calculations](prioritization-results.json) | `259350B5973F2931FE5603B810E511B5D72C3CF8B7662ECE390E58923076E219` |
| [Data-feasibility v1.0](../portfolio/data-feasibility.md) | `9365374F4931D054D04D7E9357600E3941DF62FD0FF56AB40BD5B3AF1984A786` |
| [Single-person estimate v1.0](../portfolio/experiment-delivery-estimate-v1.0-submitted.md) | `3E5D394451EBAD14F5EA1F390F99A64B92510CB822BA9AD9FC5E7071E9584558` |

Historical master/framework/portfolio hashes also remain in the [preparation manifest](preparation-manifest.json); triage's hash remains in [Phase 2 evidence](triage-validation.md). Their content was preserved rather than rewriting past pending statuses as if approvals had already existed.
