# Repository working instructions

This repository runs a human-governed analytics experiment. Read the [master prompt](prompts/astra-analytics-delivery-master-prompt.md) for its governing rules and [project state](docs/project-state.md) for the current position.

- Follow the user's current task. Reviewing or editing this repository does not start or resume the experiment. Execute the experiment only when instructed to begin or continue it.
- On an authorized start/resume, read the state, relevant gate decisions, and evidence before acting. Gate records carry the actual human decisions; state is only an index.
- Work autonomously within established approvals. Do not repeat requests for approvals whose scope still applies, self-approve gates, infer approval from silence, or proceed beyond the current gate.
- Distinguish scenario assumptions, estimates, observed results, and unvalidated business benefits. Never report missing tests or generated Power BI files as verified behavior.
- Preserve user changes and existing `powerbi-files/` artifacts. Do not expose credentials, local settings, caches, or sensitive data in Git or evidence.
- Keep records concise and linked. Use [templates](docs/templates/README.md); create downstream records when their phase begins, not as apparently completed placeholders.
- When a manager decision is required, present at most three options and identify the recommended option among them. This preference applies prospectively; do not rewrite previously approved decisions.
- Validate documentation changes with `node scripts/validate-docs.mjs`. This is a local structural check, not evidence of platform tests or CI execution.

See [README](README.md) for startup, resume, and repository navigation. This file routes to the master prompt rather than duplicating its approval rules.
