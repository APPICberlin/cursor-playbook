## Cursor Playbook — Tailoring & Rollout

Follow these steps to adapt this template to a new repository and local conventions.

### 1) Files to copy verbatim
- `.cursor/rules/` (all files)
- `.github/workflows/ci.yml` and `.github/workflows/pr-guardian.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `docs/AGENTS/*`
- `playwright-screenshots.mjs`

Optional: `cloudbuild.yaml`, `CODEOWNERS` (if you use GCP and protected reviews).

### 2) Customize variables and owners
- CODEOWNERS: replace `@your-org/cpo` with the actual CPO GitHub handle(s).
- Cloud Build: set `_REGION`, `_SERVICE_NAME`, and secrets mapping; create triggers for main/staging.
- CI matrix: set your Node version, include/exclude typecheck or e2e as needed.

### 3) Branch protection (GitHub)
- Default: Protect `main` and require status checks `ci` and `pr-guardian`; dismiss stale approvals; enforce linear history; no force-push.
- Zero Actions mode (PO must request): Disable GitHub Actions to spend 0 minutes. Do not require status checks. Enforce local `prepush` (lint → typecheck → build → smoke) and screenshot hygiene instead. PO flips Draft → Ready only after local smoke is green and inline evidence is present.

### 4) Tickets & batches
- Create `docs/tickets/` and a `docs/TICKETS_P0.md` file following your domain.
- Enforce WIP via the PR-guardian (title requires ticket id; limit 2 concurrent PRs per Batch via label + query).

### 5) Prompts
- Pin `docs/AGENTS/CPO.md` for the orchestrator; have background agents load `.cursor/rules/` automatically.
- Update `docs/AGENTS/Repo Agent Prompt.md` if your tracker differs (e.g., GitHub issues vs in-repo markdown).

### 6) Screenshots artifacts
- Keep `playwright-screenshots.mjs` and run it in CI to attach a `screenshots` artifact to each PR.

### 7) Local development
- Add npm scripts:
  - `"lint": "eslint ."`
  - `"typecheck": "tsc -p tsconfig.json --noEmit"`
  - `"test": "vitest run"` or your test runner
  - `"e2e": "playwright test"` (optional)
- In Zero Actions mode, `prepush` is mandatory and substitutes CI smoke.

### 8) Definition of Ready/Done
- Copy the DoR/DoD from rules into your `docs/README.md` and PR template to keep humans and agents aligned.

### 9) Rollout checklist
- Open a dummy PR named `T-000 — Playbook guardrails validation`.
- Verify: title pattern check, labels/milestone, CI passes, screenshots artifact present.
- Confirm WIP limit: open two PRs labeled with the current Batch; ensure the third is blocked by `pr-guardian`.

### 10) Maintenance
- Treat `.cursor/rules/**` and `docs/DECISIONS/**` as controlled assets (CODEOWNERS + reviews required).


