# Project Onboarding — Product Owner and Agents

Use this for backend-only or full-stack repos. Skip frontend-only items if not applicable.

## Roles
- Product Owner (PO): orchestrates tickets, priorities, and flips PRs to Ready.
- Background Agents: implement tickets; run local QA before pushing.

## Local-first QA (zero/minimal CI)
- Run `npm run prepush` before every push:
  - Lint → Typecheck → Build → Playwright Smoke (chromium)
  - Frontend: optional local preview; screenshots saved under `screens/` and named `TICKETID-*.png`.
- Draft PRs: 0 minutes. Ready PRs: fast smoke only; full e2e optional.

### Zero Actions (explicit opt-in by PO)
- If the PO asks to run with zero GitHub Actions to save minutes, disable Actions for the repo.
- Enforcement shifts entirely to local gates:
  - `npm run prepush` must pass on every push (lint → typecheck → build → smoke).
  - PO flips Draft → Ready only after the author pastes evidence (screenshots named `TICKETID-*`) and confirms smoke is green locally.
  - Guardian checks are performed by `scripts/screenshot-hygiene.mjs` locally; CI guardian is skipped.

## Repo bootstrap (PO)
- Copy from template:
  - `.cursor/rules/`
  - `.github/workflows/` → keep `ci.yml`, `open-draft-pr.yml`; disable `screenshots.yml` for backend-only
  - `docs/AGENTS/` (PO and Repo Agent prompts)
  - `docs/TICKETS.md`, `docs/TICKETS_P0.md`, `docs/TICKETS_BACKLOG.md`
  - `docs/ENVIRONMENT.md`, `docs/ARCHITECTURE.md`, `docs/UI_GUIDELINES.md`, `docs/LEARNING_LOG.md`, `docs/ONBOARDING.md`
- Protect `main`: require `ci` status; optionally enable `pr-guardian`.

## Tickets workflow
- Author tasks using `docs/TICKETS.md` scaffold.
- Plan execution in `docs/TICKETS_P0.md` with:
  - Batches: cohesive areas/epics
  - Stints: timeboxed windows where multiple agents run synchronously
- Maintain long-horizon planning in `docs/TICKETS_BACKLOG.md` by Phases/Epics; reference tickets by title.

## Environment
- Provide `.env.example` (no secrets). Document variables in `docs/ENVIRONMENT.md`.

## Architecture
- Document modules, boundaries, contracts, and data flow in `docs/ARCHITECTURE.md`.

## UI/Console Guidelines
- Frontend: tokens, components, accessibility (keyboard, labels, focus), screenshots policy.
- Backend/CLI: flags, help, exit codes, structured logging, error taxonomy, JSON output shape.

## Learning Log
- Use `docs/LEARNING_LOG.md` (date, context, root cause, fix, prevention rule/test).

