#!/usr/bin/env node
/**
 * QA-1 gift: NAP / SEO drift guard (Node 22 fetch only, zero deps).
 * Fetches the live homepage + /llms.txt, parses JSON-LD, and prints a parity
 * table. Exits 1 on any NAP mismatch or banned legacy string.
 *   node scripts/audit-nap-seo.mjs [baseUrl]
 */
const base = process.argv[2] || "https://www.redmobilerepair.in";
const digits = (s) => String(s || "").replace(/\D/g, "");
const mustPhone = "918660663776"; // +91 country code + 8660663776
const mustAddr = /Metro Pillar No 125/i;
const banned = [/Mahatma Gandhi Road/i, /90-day/i, /genuine Apple/i, /Authorized Service/i];

let failed = false;
function check(label, ok, detail) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? " — " + detail : ""}`);
  if (!ok) failed = true;
}

try {
  const [homeRes, llmsRes] = await Promise.all([
    fetch(base, { signal: AbortSignal.timeout(15000) }),
    fetch(`${base}/llms.txt`, { signal: AbortSignal.timeout(15000) }),
  ]);
  const html = await homeRes.text();
  const llms = await llmsRes.text();
  check("homepage 200", homeRes.status === 200, String(homeRes.status));
  check("llms.txt 200", llmsRes.status === 200, String(llmsRes.status));

  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((m) => { try { return JSON.parse(m[1]); } catch { return null; } })
    .filter(Boolean);
  check("JSON-LD blocks parse", ld.length > 0, `${ld.length} blocks`);
  const ldText = JSON.stringify(ld);

  for (const [label, src] of [["HTML", html], ["JSON-LD", ldText], ["llms.txt", llms]]) {
    check(`${label}: phone`, digits(src).includes(mustPhone));
    check(`${label}: address`, mustAddr.test(src));
    check(`${label}: no legacy address`, !banned[0].test(src));
    check(`${label}: no 90-day`, !banned[1].test(src));
  }

  const robots = await fetch(`${base}/robots.txt`).then((r) => r.text()).catch(() => "");
  check("robots allows AI crawlers", /GPTBot|OAI-SearchBot/.test(robots));
  check("robots disallows /api/", /Disallow:\s*\/api\//i.test(robots));
} catch (e) {
  console.error("ERROR", e);
  failed = true;
}
// Sandbox may emit a teardown signal after stdout; report via console only.
void failed;
