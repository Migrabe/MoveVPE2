#!/usr/bin/env bash
set -euo pipefail
export CI=true
export DEBIAN_FRONTEND=noninteractive
export NPM_CONFIG_YES=true

echo "[project1-local] Installing dependencies"
npm ci

echo "[project1-local] Logic and JSON contract checks"
npm run test:nbp-json

echo "[project1-local] Security baseline"
npm audit --omit=dev --audit-level=high

echo "[project1-local] Ensuring Playwright browsers are installed"
if command -v sudo >/dev/null 2>&1 && sudo -n true >/dev/null 2>&1; then
  npx --yes playwright install --with-deps chromium firefox webkit
else
  npx --yes playwright install chromium firefox webkit
fi

echo "[project1-local] E2E smoke (fresh)"
npm run test:e2e:smoke:fresh

echo "[project1-local] E2E full (fresh)"
npm run test:e2e:fresh

echo "[project1-local] Render health"
curl -fsS https://vpe-master-wide.onrender.com/health

echo
echo "[project1-local] Full check completed successfully"
