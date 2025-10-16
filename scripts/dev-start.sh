#!/usr/bin/env bash
set -euo pipefail

# Resolve project root as the parent of this script directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[dev-start] Project root: $ROOT_DIR"

echo "[dev-start] Bringing up Docker services (database, auth, rest, kong, etc.)..."
docker compose up -d

REST_HEALTH_URL="http://localhost:3001/"
KONG_REST_URL="http://localhost:8000/rest/v1/"

echo "[dev-start] Waiting for PostgREST at $REST_HEALTH_URL ..."
for i in {1..60}; do
  if curl -sf "$REST_HEALTH_URL" >/dev/null; then
    echo "[dev-start] PostgREST is up."
    break
  fi
  if [[ "$i" -eq 60 ]]; then
    echo "[dev-start] ERROR: PostgREST did not become ready in time." >&2
    exit 1
  fi
  sleep 1
done

echo "[dev-start] Checking Kong route $KONG_REST_URL ..."
curl -s -o /dev/null -w "[dev-start] Kong REST status: %{http_code}\n" "$KONG_REST_URL" || true

mkdir -p .dev-logs .pids

VITE_URL="http://localhost:8080/"
if curl -sf "$VITE_URL" >/dev/null; then
  echo "[dev-start] Vite dev server already running at $VITE_URL"
else
  echo "[dev-start] Starting Vite dev server on port 8080..."
  nohup npm run dev > .dev-logs/vite.out 2>&1 &
  VITE_PID=$!
  echo "$VITE_PID" > .pids/vite.pid

  # Wait briefly for Vite to boot
  for i in {1..30}; do
    if curl -sf "$VITE_URL" >/dev/null; then
      echo "[dev-start] Vite is up at $VITE_URL (pid $VITE_PID)"
      break
    fi
    sleep 1
  done
fi

echo "[dev-start] All set."
echo "- App:    $VITE_URL"
echo "- REST:   $KONG_REST_URL (via Kong)"
echo "- REST*:  $REST_HEALTH_URL (direct)"
echo "[dev-start] Logs: $(realpath .dev-logs)/vite.out"



