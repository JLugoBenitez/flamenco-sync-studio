#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[dev-stop] Stopping Vite dev server if running..."
if [[ -f .pids/vite.pid ]]; then
  VITE_PID="$(cat .pids/vite.pid || echo '')"
  if [[ -n "$VITE_PID" ]] && ps -p "$VITE_PID" >/dev/null 2>&1; then
    kill "$VITE_PID" || true
    echo "[dev-stop] Killed Vite (pid $VITE_PID)"
  fi
  rm -f .pids/vite.pid
fi

echo "[dev-stop] Stopping Docker services..."
docker compose down

echo "[dev-stop] Done."



