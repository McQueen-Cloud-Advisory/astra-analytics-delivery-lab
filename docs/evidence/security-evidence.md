# Phase 6 security evidence

Run HDG-20260920-01. Current QA-12 security status: **Blocked**; Gate 6 is not ready. This is a sanitized incident/check record, not a clean-security claim.

## SEC-001 — Temporary token exposed in diagnostic output

Observed **2026-09-22 approximately 02:37:59Z**. A one-off post-run diagnostic attempted `getQueryResults` for a service-account-owned query using the setup user's client. BigQuery denied access (HTTP 403) to that job's temporary result dataset. The uncaught Node SDK error included an authorization header in tool output. No token is copied here or into repository evidence. The pipeline itself had already completed successfully using the scoped runtime client.

Root cause of exposure: the ad hoc diagnostic lacked the sanitized outer error handler used by the repository runner. The authorization denial is not a reason to widen roles. A future existing-result read must use the original scoped job identity; errors must emit only a bounded reason code, never an SDK object, request, header or raw credential response.

Immediate response: stopped the diagnostic, notified the manager, disabled further pipeline execution in ignored local readiness, and requested approval to revoke the current gcloud authorization. The manager explicitly chose **“Revoke current gcloud login (Recommended)”**. At **2026-09-22T02:43:12.7747162Z**, `gcloud auth revoke --quiet` with explicit lab project/billing flags returned success; `gcloud auth list` then reported **zero active CLI accounts**. Raw command output was captured and suppressed. No exposed-token reuse probe was made. The manager then reported renewed sign-in. At **02:48:18.909Z**, safe metadata and existing-result reads verified restored CLI/scoped-runtime access; no extra query was submitted. **Containment and access restoration completed; cloud readiness resumed.** Exposure was in conversation tool output; revocation does not erase that record. Do not reproduce it in logs, reports or source control.

This is an agent error. Manager authorization and sign-in to contain it are security/authentication actions caused by that error, not human technical corrections to the analytics design. The successful revocation and safe replacement diagnostic are observed recovery evidence; no claim is made that the earlier conversation output was removed.

## Other controls and pending checks

- Keyless runtime uses explicit dedicated-project billing/quota flags and the scoped service account; shared ADC is not used or altered. Setup Owner is separate and has no runtime fallback. [Controls](cloud-controls.json) and [execution](cloud-proof.json) retain evidence.
- Dataset access is limited to project Owners and the runtime service account; no public grant or new report user is introduced. This does not establish least-privilege access for the manager's existing Owner identity.
- Dependencies are locked at BigQuery 9.1.0 and google-auth-library 11.1.0. Installation reported 48 packages audited / zero vulnerabilities at that time; a later explicit audit did not complete.
- **Explicit npm audit: Blocked.** Sandboxed access failed; automatic approval review rejected escalation because sending the dependency manifest/tree to npm's external advisory service had not been specifically authorized. A request to authorize dependency names/versions to `registry.npmjs.org` is pending. No alternate service or indirect route is used to bypass this rejection.
- [Local secret-pattern inspection](secret-scan.json), 2026-09-22T02:44:04.761Z: **Pass**, 128 tracked/nonignored text candidate files, zero matches for five bounded credential patterns. No file contents were uploaded. This is not an exhaustive scanner or CI execution; it does not erase SEC-001. Actual CI remains Not Run.

On 2026-09-23 UTC, the implemented [bounded source scanner](../../scripts/check-secrets.mjs) and seven regression tests passed. [Current scan](security-scan-2026-09-23.json) checked 156 source files with zero findings/errors; a separate inspection of the exact 143 staged files found no credential-pattern matches or private/original-artifact paths. These checks do not inspect private contents or prove absence of every secret type. The Power BI checker now reads only 14 named source files and has four tests proving private-file exclusions. All `.pbi` contents are ignored. [CI preparation](ci-validation.md) preserves the explicit npm audit as pending and includes no GCP credentials or deployment.
