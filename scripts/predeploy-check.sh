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

# --- EMERGENCY NOINDEX MAINTENANCE OVERRIDE (noindex ONLY) -------------------
# ALLOW_NOINDEX_MAINTENANCE=1 is an emergency escape hatch for PLANNED maintenance.
# It bypasses ONLY the live noindex assertions:
#   - seo_strike_scanner.py check (i)  -> --skip-noindex
#   - verify_v13_ssr.py      check (4) -> --skip-noindex
# and skips the redundant legacy verify_v8_live.py (its HTTP-200 coverage is
# retained by the ALWAYS-BLOCKING verify_v13_ssr.py gate below).
# NEVER skipped: every SEO strike check, every SSR check (200 / rating parity /
# banned strings / title pipes), the next.config.ts shield, and the v13 3D
# device-lock source gate. Do NOT use this to mask an accidental deindex; remove
# the env var before the next normal ship.
NOINDEX_SKIP_FLAGS=""
if [[ "${ALLOW_NOINDEX_MAINTENANCE:-0}" == "1" ]]; then
  echo ""
  echo "########################################################################"
  echo "# !!! EMERGENCY OVERRIDE: ALLOW_NOINDEX_MAINTENANCE=1                    #"
  echo "# !!! ONLY the live noindex assertion is bypassed.                        #"
  echo "# !!! ALL strike / SSR / 200 / source gates remain BLOCKING.              #"
  echo "# !!! Planned maintenance only — unset this var before the next ship.     #"
  echo "########################################################################"
  echo ""
  NOINDEX_SKIP_FLAGS="--skip-noindex"
fi

# --- noindex/strike gate (blocking) -----------------------------------------
# Runs BEFORE deploy against the CURRENTLY DEPLOYED live site: a noindex
# regression on production must block the ship. The scanners default to
# https://www.redmobilerepair.in (live); we pin it explicitly for clarity.
LIVE_URL="https://www.redmobilerepair.in"
echo "--- noindex/strike gate (blocking) [live: $LIVE_URL]"
python3 scripts/audit/seo_strike_scanner.py --base-url "$LIVE_URL" $NOINDEX_SKIP_FLAGS >/tmp/seo-strike.txt 2>&1 || {
  echo "FAIL: seo_strike_scanner.py (live noindex/strike regression)"
  tail -30 /tmp/seo-strike.txt
  exit 1
}
if [[ "${ALLOW_NOINDEX_MAINTENANCE:-0}" == "1" ]]; then
  echo "PASS (override): verify_v8_live.py skipped — noindex-only bypass; HTTP-200 enforced by v13 SSR gate"
else
  python3 scripts/audit/verify_v8_live.py --base-url "$LIVE_URL" >/tmp/verify-v8-live.txt 2>&1 || {
    echo "FAIL: verify_v8_live.py (live 200/noindex regression)"
    tail -20 /tmp/verify-v8-live.txt
    exit 1
  }
fi
echo "--- noindex/strike gate (blocking) --- PASS"

# --- v13 LIVE SSR/strike gate (blocking — NEVER skippable) -------------------
# Ten public routes, Googlebot UA: 200, rating parity, no banned legacy strings,
# no noindex (unless the noindex-only emergency override above is active), one
# <title> pipe. Strike/SSR assertions here are ALWAYS enforced.
echo "--- v13 SSR/strike gate (blocking) [live: $LIVE_URL]"
python3 scripts/audit/verify_v13_ssr.py --base-url "$LIVE_URL" $NOINDEX_SKIP_FLAGS >/tmp/verify-v13-ssr.txt 2>&1 || {
  echo "FAIL: verify_v13_ssr.py (live SSR/strike regression)"
  tail -30 /tmp/verify-v13-ssr.txt
  exit 1
}
echo "--- v13 SSR/strike gate --- PASS"

# --- v16 SMOOTHNESS / ZLE source gate (blocking — NEVER skippable) -----------
# Static, read-only guard for Faisu's zero-jitter baseline: no active
# transform/opacity keyframes on large full-width ambient elements, no
# filter/blur keyframes, no infinite animation on heading/ticker/cap/glass-band/
# tag, >=10 ZLE-V16 markers, and no orange-glass residue. Mobile motion untouched.
echo "--- v16 smoothness/ZLE source gate (blocking)"
python3 scripts/audit/smoothness_guard.py >/tmp/smoothness.txt 2>&1 || {
  echo "FAIL: smoothness_guard.py (ZLE-V16 smoothness regression)"
  tail -40 /tmp/smoothness.txt
  exit 1
}
echo "--- v16 smoothness/ZLE source gate --- PASS"

# --- v13 DEVICE-LOCK source gate (blocking — NEVER skippable) ----------------
# Static, read-only guard for Faisu's hard 3D device-lock rules (v17 desktop
# fills: TBK 0.74-0.76, AirPods 0.65-0.67, internals 0.86 desktop / 0.88 mobile;
# MacBook FROZEN at 0.90 with NO device override; all other models frozen and
# MOBILE otherwise frozen, 768 fill selection, one-time normalization, shared
# renderer). Filename kept as v13_lock_guard.py so the gate command stays stable.
echo "--- v13 device-lock source gate (v17 spec, blocking)"
python3 scripts/audit/v13_lock_guard.py >/tmp/v13-lock.txt 2>&1 || {
  echo "FAIL: v13_lock_guard.py (v17 device-locked 3D fill drift)"
  tail -40 /tmp/v13-lock.txt
  exit 1
}
echo "--- v13 device-lock source gate --- PASS"

echo "ALL CHECKS PASSED — safe to deploy"
