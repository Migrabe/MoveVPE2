#!/usr/bin/env bash
set -euo pipefail
export CI=true
export DEBIAN_FRONTEND=noninteractive
export NPM_CONFIG_YES=true

assert_movevpe2_context() {
  local root
  root="$(pwd)"
  [ -f "$root/package.json" ] || { echo "[project1-local] package.json not found"; exit 1; }
  [ -f "$root/CODEX.md" ] || { echo "[project1-local] CODEX.md not found"; exit 1; }
  [ -f "$root/server.js" ] || { echo "[project1-local] server.js not found"; exit 1; }
  if ! grep -q '"name": "vpe-prompt-builder-v4"' "$root/package.json"; then
    echo "[project1-local] Refusing to run: not MoveVPE2 package"
    exit 1
  fi
  if git -C "$root" rev-parse --git-dir >/dev/null 2>&1; then
    local remote
    remote="$(git -C "$root" remote get-url origin 2>/dev/null || true)"
    if [ -n "$remote" ] && [[ "$remote" != *"Migrabe/MoveVPE2"* ]]; then
      echo "[project1-local] Refusing to run: origin is not Migrabe/MoveVPE2"
      exit 1
    fi
  fi
}

assert_movevpe2_context

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
env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY NO_PROXY=localhost,127.0.0.1 npm run test:e2e:smoke:fresh

echo "[project1-local] E2E full (fresh)"
env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY NO_PROXY=localhost,127.0.0.1 npm run test:e2e:fresh

echo "[project1-local] Render health"
curl -fsS https://vpe-master-wide.onrender.com/health

echo
echo "[project1-local] Full check completed successfully"
