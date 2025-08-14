# Cursor Playbook Template

This folder contains a portable setup to orchestrate 2–4 Cursor agents with a CPO orchestrator, enforce ticket discipline, and gate delivery via CI. Copy its contents to the root of a new project and tailor via the included guide.

Contents:
- `.cursor/rules/` — Agent rules (global, workflow, batch execution)
- `docs/AGENTS/` — Prompts for CPO, Background Agent, and Repo Agent
- `.github/workflows/` — `ci.yml` (Ready-only smoke) and `pr-guardian.yml` (metadata + screenshot hygiene)
- `.github/PULL_REQUEST_TEMPLATE.md` — Standard PR checklist
- `CODEOWNERS` — Require CPO approval on sensitive paths
- `cloudbuild.yaml` — Example GCP Cloud Build → Cloud Run pipeline
- `scripts/screenshot-hygiene.mjs` — bans `screens/debug-*`; used locally and in CI
- `CURSOR_PLAYBOOK_GUIDE.md` — How to tailor and roll out
- `docs/ARCHITECTURE.md` — Standard structures and language policy
- `docs/ARCHIVE_POLICY.md` — How to archive obsolete files safely

Quick start (for a fresh repo):
1) Copy everything in `templates/cursor-playbook/*` to your repo root, preserving file paths (folders starting with a dot must be kept).
2) Search/replace placeholders:
   - `<PROJECT_NAME>` → your project
   - `_SERVICE_NAME`/`_REGION` in `cloudbuild.yaml`
   - CODEOWNERS GitHub handles
3) Choose CI mode:
   - Default: keep Actions enabled and run Ready-only smoke (`ci`) plus guardian.
   - Zero Actions: disable GitHub Actions entirely to spend 0 minutes. In this mode, the Product Owner (PO) must explicitly request “Zero Actions” and enforce local gates only. Agents must run `npm run prepush` (lint → typecheck → build → smoke) before pushing; PRs are flipped Ready only after local smoke passes and screenshots are embedded.
4) If CI is enabled, push a test PR to verify guardrails. The smoke job should run and pass.

Standardization policy
- Declare `project.flavor.json` with `framework` (`nextjs`|`redwood`|`node`) and `language` (`ts`).
- Use the conventional directories from `docs/ARCHITECTURE.md` for your flavor.
- Archive obsolete code into `ARCHIVE/` and never import from it; see `docs/ARCHIVE_POLICY.md`.
- `prepush` runs a structure and screenshot hygiene guardian before smoke tests.

Tailoring guide is in `CURSOR_PLAYBOOK_GUIDE.md`.
