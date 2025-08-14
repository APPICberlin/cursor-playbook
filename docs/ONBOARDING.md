# Project Onboarding — Product Owner and Agents

Use this for backend-only or full-stack repos. Skip frontend-only items if not applicable.

## Roles
- Product Owner (PO): orchestrates tickets, runs onboarding interview, picks CI mode, and flips PRs to Ready. Owns end-to-end quality and speed.
- Developer Agents (DevA): implement tickets; must pass local QA (prepush + visual) before pushing.

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

## CI workflows menu (pick only what you need)

Default is local-only; all below can be disabled to save minutes. During onboarding, the PO should choose which to enable:

- Ready-only Smoke (`.github/workflows/ci.yml`) — fast Playwright smoke on Ready PRs.
- PR Guardian (`.github/workflows/pr-guardian.yml`) — metadata + screenshot hygiene; fails integration PRs missing required sections.
- Auto Draft PR (`.github/workflows/open-draft-pr.yml`) — opens Draft PRs on pushes to `feat/**` or `fix/**`.
- Preview & Screenshots (`.github/workflows/screenshots.yml`) — optional visual artifact job; keep disabled unless needed.

During the onboarding interview, confirm:
- Are CI minutes constrained? If yes, keep Zero Actions and rely on `npm run prepush`.
- If FE app: enable Guardian; optionally enable Smoke on Ready.
- If BE-only: disable screenshots workflow; Guardian still useful.

### Onboarding interview script (PO)
- Project flavor and language: set `project.flavor.json` (nextjs/redwood/node, ts).
- Directory structure: confirm it matches `docs/ARCHITECTURE.md`; archive strays.
- CI mode: Zero Actions now? If not, which workflows to enable (Guardian, Smoke, Draft PRs, Screenshots)?
- Visual QA: confirm `npm run prepush` runs visual checks; define brand alt text and KPI selectors if needed (env vars `VISUAL_BRAND_ALT`, `VISUAL_KPI_COUNT`).
- Tickets: create `docs/TICKETS_P0.md` and first tickets; adopt PR template.
- Protection: set branch protection and CODEOWNERS for `docs/**` and `.cursor/**`.

## Standardization
- Project flavor is declared in `project.flavor.json` (`framework`, `language`).
- Follow `docs/ARCHITECTURE.md` for folder layout. Mixing frameworks (e.g., Next + Redwood) is blocked by the structure guardian.
- Obsolete files are moved to `ARCHIVE/` and never imported; see `docs/ARCHIVE_POLICY.md`.

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

