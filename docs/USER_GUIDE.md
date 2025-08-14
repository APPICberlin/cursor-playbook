# Human User Guide — Cursor Playbook (Founder/PO Friendly)

This is a copy/paste guide to ship fast with local QA and minimal/zero GitHub Actions.

## 1) One-time setup (10 minutes)

- Install Node 20 and GitHub CLI (gh).
- Authenticate: `gh auth login`
- Clone and install:

```
git clone <your-repo-url>
cd <repo>
npm ci
npx playwright install --with-deps chromium
```

## 2) Daily: local QA before any push

Run once per ticket cycle:

```
npm run prepush
```

What it does: structure check → screenshot hygiene → lint → typecheck → build → Playwright smoke (Chromium).

Screenshots policy:
- Name UI screenshots `TICKETID-*.png` and paste them inline in the PR body.
- Never commit `screens/debug-*`.

## 3) Branching and PRs

- Branch name: `feat/<ticket-id>-<short-slug>`
- Create PR using the template; keep Draft until local QA is green.
- If Actions are enabled, flip to Ready to run smoke in CI. If using Zero Actions, keep CI disabled and rely on local QA.

## 4) Zero Actions mode (save minutes)

- Ask the PO to run in “Zero Actions” mode for this repo.
- Disable Actions in GitHub: Settings → Actions → Disable. Local `prepush` becomes the gate.

## 5) Integration branch (one command, local)

Create a single PR that merges several feature branches (“trains”) with conflict policy baked in.

Prepare variables (example):

```
export BASE=main
export SLUG=dm-qa-merge
export BRANCHES=feat/train-dm-1-tokens,feat/train-dm-2-toggle,feat/train-dm-3-component-pass,qa/run-local-smoke
```

Run the integrator:

```
node scripts/integrate.mjs --base=$BASE --slug=$SLUG --branches=$BRANCHES
```

What happens: creates `integ/$SLUG` from `$BASE`, merges branches in order, drops artifacts (`qa/**`, `test-results/**`, `screens/**`), restores base configs, runs lint/typecheck/build, pushes, and opens a PR with required sections (Acceptance Criteria, Screenshots, QA Checklist).

Paste 2–3 representative screenshots inline in the PR body (frontend only).

Advanced knobs (optional):

```
node scripts/integrate.mjs \
  --base=main \
  --slug=$SLUG \
  --branches=$BRANCHES \
  --drop=qa/**,test-results/**,screens/** \
  --restore=package.json,playwright.config.ts,.github/workflows/ci.yml,.gitignore
```

## 6) Standard project structures and language

- Declare the flavor: see `project.flavor.json`.
- Follow `docs/ARCHITECTURE.md` for folder layout (Next.js, Redwood, or Node).
- TypeScript is required for app code; `.js` allowed only for configs and `scripts/**`.
- Archive obsolete files in `ARCHIVE/` (never import from there). See `docs/ARCHIVE_POLICY.md`.

## 7) Troubleshooting

- Playwright not found: `npx playwright install --with-deps chromium`
- Structure guardian fails: align folders with `project.flavor.json` and `docs/ARCHITECTURE.md`.
- Guardian fails due to screenshots: rename to `TICKETID-*.png` and reference inline in PR body.
- Remote push rejected: `git fetch origin --prune && git pull --rebase origin main`

## 8) Handy copy/paste snippets

Start a ticket:
```
git checkout -b feat/<TICKET_ID>-<slug>
# ... implement ...
npm run prepush
git push -u origin HEAD
```

Open a PR via CLI (optional if not auto-draft):
```
gh pr create --title "<TICKET_ID> — <Short title>" --body-file .github/PULL_REQUEST_TEMPLATE.md --draft
```

Run smoke locally only:
```
npm run smoke
```

Remove debug screenshots and enforce hygiene:
```
node scripts/screenshot-hygiene.mjs || true
```

## 9) AI prompt snippets (paste into Cursor)

CPO — Integration PR
```
Create a single integration branch from `main` and merge these trains in order: <branches>.
Use our conflict policy: keep docs, drop qa/** test-results/** screens/**, restore base configs.
Run npm ci, lint, typecheck, build. Push branch and open a PR titled `Integration: <slug>` with sections
for Acceptance Criteria, Screenshots (inline), and QA Checklist. Return only the PR URL.
```

Repo Agent — Ticket QA
```
Load the current ticket. Run `npm run prepush`. If smoke fails, fix waits and selectors; ensure no error boundary.
Name screenshots `TICKETID-*.png` and paste them inline in the PR body. Keep Draft until green.
```
