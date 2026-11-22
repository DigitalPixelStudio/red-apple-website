#!/usr/bin/env bash
# DevOps-1 gift: pre-deploy gate. Exits non-zero if anything looks unhealthy.
set -euo pipefail
cd "$(dirname "$0")/.."
echo "== predeploy $(date -u +%FT%TZ) =="
git describe --tags --always 2>/dev/null || true

echo "--- node syntax"; node --check public/final-site.js && echo PASS
echo "--- typescript"; npx tsc --noEmit && echo PASS
echo "--- build"; NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS=--max-old-space-size=4096 npm run build >/tmp/predeploy-build.log 2>&1 || true
grep -q "Compiled successfully" /tmp/predeploy-build.log && echo PASS || { tail -20 /tmp/predeploy-build.log; exit 1; }
test -f .next/BUILD_ID && echo "PASS: BUILD_ID present" || { echo "FAIL: BUILD_ID"; exit 1; }
echo "--- nap/seo audit"; node scripts/audit-nap-seo.mjs >/tmp/nap.txt 2>&1 || true
grep -aq '^FAIL' /tmp/nap.txt && { cat /tmp/nap.txt; exit 1; } || echo PASS

# --- noindex/strike gate (blocking) ---------------------------------------
# Runs BEFORE deploy against the CURRENTLY DEPLOYED live site: a noindex
# regression on production must block the ship. Both scanners default to
# https://www.redmobilerepair.in (live); we pin it explicitly for clarity.
LIVE_URL="https://www.redmobilerepair.in"
echo "--- noindex/strike gate (blocking) [live: $LIVE_URL]"
python3 scripts/audit/seo_strike_scanner.py --base-url "$LIVE_URL" >/tmp/seo-strike.txt 2>&1 || {
  echo "FAIL: seo_strike_scanner.py (live noindex/strike regression)"
  tail -30 /tmp/seo-strike.txt
  exit 1
}
python3 scripts/audit/verify_v8_live.py --base-url "$LIVE_URL" >/tmp/verify-v8-live.txt 2>&1 || {
  echo "FAIL: verify_v8_live.py (live 200/noindex regression)"
  tail -20 /tmp/verify-v8-live.txt
  exit 1
}
echo "--- noindex/strike gate (blocking) --- PASS"

echo "ALL CHECKS PASSED — safe to deploy"
