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
echo "--- nap/seo audit"; node scripts/audit-nap-seo.mjs || { echo "FAIL: NAP/SEO audit"; exit 1; }
echo "ALL CHECKS PASSED — safe to deploy"
