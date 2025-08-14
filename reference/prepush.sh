#!/usr/bin/env bash
set -euo pipefail

echo "[prepush] Lint"
npm run lint --silent

echo "[prepush] Typecheck"
npx tsc --noEmit --pretty false

echo "[prepush] Build"
npm run build --silent

echo "[prepush] Local preview & screenshots + visual QA"
PORT=4174
npm run preview --silent -- --host 127.0.0.1 --port $PORT &
PREVIEW_PID=$!
trap 'kill $PREVIEW_PID || true' EXIT
npx wait-on --timeout 60000 http://127.0.0.1:$PORT || true

# Generate gallery screenshots (non-blocking)
VITE_PREVIEW_URL=http://127.0.0.1:$PORT node playwright-screenshots.mjs || true

# Enforce layout guards (blocking)
echo "[prepush] Visual layout checks"
npx playwright test tests/e2e/visual.spec.ts --reporter=list
echo "[prepush] Screens in ./screens (paste 2–3 inline in PR)"


