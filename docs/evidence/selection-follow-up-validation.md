# Selection follow-up validation

Run: HDG-20260920-01. Results recorded **2026-09-21T03:23:47Z** (2026-09-20 America/Chicago). Scope: opportunity-cost addendum, selection scorecard and Gate 3/charter/estimate v1.1 under DEC-SCOPE-001. **Gate 3 remains Awaiting Decision.** This is document/calculation evidence, not architecture approval or a platform test.

Historical submission record: the subsequent actual Gate 3 approval is recorded in DEC-G3-001. Gate/charter links in the fingerprint table now point to preserved submitted bytes; the original check outcomes and hashes are unchanged.

| Check | Observed result |
|---|---|
| Preserve previous submission | Pass: Gate 3, charter, prioritization and experiment estimate v1.0 copied byte-for-byte before revision. All ten fingerprints in the original evidence record match their preserved targets; links for revised files now point to archives |
| Reproduce unchanged approved-model calculation | Pass: `node scripts/calculate-prioritization.mjs --check` matches retained results; inputs, script, scores, 16 weight perturbations, two full scenarios, three redundancy cases, three profiles, 26 one-criterion cases and adverse/overlap calculations unchanged |
| Pairwise opportunity-cost arithmetic | Pass: separate agent decimal calculations and root checks against retained results reconcile gross/cost/residual deltas. OPP-02 minus 01: +$7,200 benefit, +$3,800 first-year cost, +$3,400 residual. OPP-04 minus 02: +$10,800, about +$15,333, about −$4,533. These are fictional company comparisons |
| GCP allowance comparison | Pass for arithmetic: $2–12 of $30 is 7–40% rounded; $8–33 is 27–110%. High-end remainder is $18 or −$3 before other charges/reserve. Approximately $30 is not an exact verified remaining balance, credit or enforced cap |
| Independent agent review of addendum, scorecard, estimate, charter and Gate 3 | One wording correction: replaced a categorical allowance ceiling with approximate planning guidance and later verification of exact limits. No remaining contradiction found in scope, learning claims, cost exclusions or approval boundaries. This is agent review, not human acceptance |
| Documentation structure | Pass: `node scripts/validate-docs.mjs` checks 39 Markdown files, links/tables/encoding/fences, nine gates/release placement, twelve candidates/disjoint buckets, weights and current gate reference. Intermediate agent checks encountered links to documents still being prepared; final integrated check passes |
| Tracked whitespace | `git diff --check` returned no errors; normal LF/CRLF notices only. New Markdown is also covered by the structural checker |
| Scope and constraints | Existing GCP/~$30 is user-reported; report publication excluded; standing Pro subscription excluded rather than left as unknown cost; GCP focus explicit. No cloud query, account mutation, report publication, product implementation or architecture was performed |

Two delegated agents contributed the scorecard/arithmetic and critical experimental-tradeoff review; root prepared the addendum, integrated the current records and reran checks. The scorecard deliberately adds an unweighted experimental comparison rather than inventing new approved weights. OPP-01 and OPP-02 remain tied on estimated GCP cost; superior experimental learning is not established for either.

Google's official BigQuery cost-control and Cloud Billing budget documentation was consulted for the addendum's future cost-control requirements. Direct citations are retained there. No new provider price quote, configured cost control or verified GCP usage is asserted.

## Current submission fingerprints

These SHA-256 values identify uncommitted review artifacts, not an approved baseline. [Original v1.0 evidence](prioritization-validation.md) retains prior submission hashes and check results.

| Artifact | SHA-256 |
|---|---|
| [Opportunity-cost addendum v1.0](../portfolio/opportunity-cost-addendum.md) | `2D3297C26C3DD4F75F7FE2121DD49F96AC16437775375C651C8798B9C75FF818` |
| [Selection scorecard v1.0](../portfolio/selection-scorecard.md) | `CFAA95CFB95F75C204ECC988924778298AF98EEF8A885716683ED96EFEDC8FFE` |
| [Gate 3 package v1.1](../gates/gate-3-package-v1.1-submitted.md) | `F30CD7292E864C801996B6205AC57D91B146872BDEE08B5E805CD0BD5187448D` |
| [Draft charter v1.1](../project-charter-v1.1-submitted.md) | `933247735BCB4DE9AC2DD3353BCA3F8F066101DE68B61247F6F151964B0FF957` |
| [Prioritization narrative v1.1](../portfolio/prioritization.md) | `DEA5B6F8107FBC89D5F7BA91D25EA7403888BC391D4E410B850E1D474AB51DD2` |
| [Single-person estimate v1.1](../portfolio/experiment-delivery-estimate.md) | `21C92D6560275D120F2C42972BA1BC86B76609EBB894CB0CA3873BA395F632DC` |
