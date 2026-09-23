# OPP-02 first-slice Power BI proof

Open [opp02-proof.pbip](opp02-proof.pbip) only after the agent binds the published FIX-01 batch and completes the cloud handoff. Follow the [three Desktop proof steps](../../docs/operations/desktop-proof-steps.md).

This separate PBIP/PBIR/TMDL artifact uses Import, explicit lab billing, ADBC 2.0 and a single batch parameter. It is a minimal synthetic proof, not the final report. Existing `powerbi-files/` artifacts are preserved. Desktop open/refresh/render/save/reopen have **not been run**.

Run `node powerbi/opp02-proof/validate-metadata.mjs` from the repository root for local binding/guard checks. [Metadata schema results](metadata-validation.json) retain the executed JSON schema checks; they do not validate TMDL/M/DAX or platform behavior. No credentials or model cache are included.
