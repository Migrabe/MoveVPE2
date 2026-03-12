#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   bash project1-anywhere.sh
#   bash project1-anywhere.sh /path/to/MoveVPE2
#   MOVEVPE2_ROOT=/path/to/MoveVPE2 bash project1-anywhere.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_REPO="/mnt/c/Users/TOT/Documents/MoveVPE2"
TARGET_ROOT="${1:-${MOVEVPE2_ROOT:-}}"

is_repo_root() {
  local d="${1:-}"
  [ -n "$d" ] || return 1
  [ -f "$d/package.json" ] || return 1
  [ -f "$d/scripts/project1-full-check.sh" ] || return 1
  [ -f "$d/CODEX.md" ] || return 1
  [ -f "$d/server.js" ] || return 1
  grep -q '"check:full"' "$d/package.json" 2>/dev/null || return 1
  grep -q '"name": "vpe-prompt-builder-v4"' "$d/package.json" 2>/dev/null || return 1
  if git -C "$d" rev-parse --git-dir >/dev/null 2>&1; then
    local remote
    remote="$(git -C "$d" remote get-url origin 2>/dev/null || true)"
    if [ -n "$remote" ] && [[ "$remote" != *"Migrabe/MoveVPE2"* ]]; then
      return 1
    fi
  fi
  return 0
}

if [ -z "$TARGET_ROOT" ]; then
  # If this script is called from inside the repo, prefer git root.
  if git_root="$(git -C "$PWD" rev-parse --show-toplevel 2>/dev/null)"; then
    if is_repo_root "$git_root"; then
      TARGET_ROOT="$git_root"
    fi
  fi
fi

if [ -z "$TARGET_ROOT" ] && is_repo_root "$(cd "$SCRIPT_DIR/.." && pwd)"; then
  TARGET_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
fi

if [ -z "$TARGET_ROOT" ] && is_repo_root "$DEFAULT_REPO"; then
  TARGET_ROOT="$DEFAULT_REPO"
fi

if ! is_repo_root "$TARGET_ROOT"; then
  echo "Cannot find valid MoveVPE2 root."
  echo "This launcher is restricted to Migrabe/MoveVPE2 only."
  echo "Pass explicit project path if needed: bash project1-anywhere.sh /path/to/MoveVPE2"
  exit 1
fi

echo "[project1-anywhere] repo: $TARGET_ROOT"
cd "$TARGET_ROOT"
exec npm run check:full
