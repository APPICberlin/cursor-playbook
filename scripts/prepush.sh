#!/usr/bin/env bash
set -euo pipefail

echo "[prepush] Structure guardian"
node scripts/structure-guardian.mjs

echo "[prepush] Screenshot hygiene"
node scripts/screenshot-hygiene.mjs || true

echo "[prepush] Lint"
npm run lint --silent

echo "[prepush] Typecheck"
npx tsc --noEmit --pretty false

echo "[prepush] Build"
npm run build --silent || true

echo "[prepush] Smoke (Chromium)"
npx playwright test tests/e2e/smoke.spec.ts --project=chromium --reporter=line

# Visual QA (optional but recommended): if a preview script exists, start it and run checks
if npm pkg get scripts.preview >/dev/null 2>&1; then
  echo "[prepush] Local preview & visual QA"
  PORT=${PORT:-4174}
  (npm run preview --silent -- --host 127.0.0.1 --port "$PORT" &) >/dev/null 2>&1
  PREVIEW_PID=$!
  trap 'kill $PREVIEW_PID >/dev/null 2>&1 || true' EXIT
  npx wait-on --timeout 90000 "http://127.0.0.1:$PORT" || true

  # Non-blocking gallery for human review, if script present
  if [ -f playwright-screenshots.mjs ]; then
    VITE_PREVIEW_URL="http://127.0.0.1:$PORT" node playwright-screenshots.mjs || true
  fi

  echo "[prepush] Visual layout checks (blocking)"
  npx playwright test tests/e2e/visual.spec.ts --project=chromium --reporter=list || {
    echo "[prepush] Visual QA failed. Fix layout issues before pushing.";
    exit 1;
  }
else
  echo "[prepush] Skipping local preview: no npm 'preview' script."
fi

echo "[prepush] Done — ready to push"


