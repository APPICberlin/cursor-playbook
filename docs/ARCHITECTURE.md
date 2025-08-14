# Architecture & Project Structure Standards

This playbook enforces a small set of conventional layouts so agents and tools can navigate any repo reliably. Deviations require an ADR.

## Project flavor

Declare the repo flavor in `project.flavor.json`:

```
{"framework":"nextjs","language":"ts"}
```

- framework: `nextjs` | `redwood` | `node`
- language: `ts` (default). JS is allowed only in top-level config and scripts.

## Required layouts

- Next.js (frontend or fullstack SPA)
  - `src/app/**` (preferred, Next 13+) or `pages/**` (legacy)
  - `src/components/**`, `src/lib/**`
  - Tests: `tests/e2e/**`, `tests/unit/**`
- Redwood (fullstack)
  - `web/src/pages/**`, `web/src/components/**`
  - `api/src/services/**`, `api/src/functions/**`
  - Tests: `web/src/**/__tests__/**`, `api/src/**/__tests__/**`
- Node (backend-only)
  - `src/**` with entry `src/index.ts` or `src/app.ts`
  - Tests: `tests/unit/**`, optional `tests/e2e/**`

## Language

- TypeScript is the default and required for app code in all flavors.
- Allowed JS:
  - Configuration files: `*.config.js|cjs|mjs` (build/test tools)
  - Scripts under `scripts/**` (`*.mjs`)
- Any `.js` inside `src/**`, `web/src/**`, or `api/src/**` must be justified by ADR.

## Archival policy

- Do not leave obsolete code in-place. Move into `ARCHIVE/` and reference it from the PR description if needed.
- Never import from `ARCHIVE/`.
- The `structure-guardian` blocks common stray directories and mixed-framework layouts (e.g., both `web/` and `src/app/`).

## Where things live

- UI tokens/guidelines: `docs/UI_GUIDELINES.md`
- Environment and secrets: `docs/ENVIRONMENT.md` and `.env.example` (no secrets)
- Decisions: `docs/DECISIONS/*` (ADR series)
- Learning log: `docs/LEARNING_LOG.md`


