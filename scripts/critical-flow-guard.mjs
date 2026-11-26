import { readFile } from "node:fs/promises";

const required = [
  ["src/app/api/concierge/route.ts", [
    ["streaming AI handler", /export async function POST\\(/],
    ["Gemini image-input deployment gate", /GEMINI_IMAGE_INPUT_ENABLED/],
    ["AI rate limiting", /rateLimit\\(/],
    ["local knowledge fallback", /localResponse/],
    ["RAG knowledge source", /KNOWLEDGE_BASE/],
  ]],
  ["src/app/api/crm-status/route.ts", [
    ["validated repair lookup", /Schema\\.safeParse/],
    ["repair lookup rate limiting", /rateLimit\\(/],
    ["read-only CRM credential path", /CRM_SUPABASE_READONLY_KEY/],
    ["customer/repair/invoice lookup", /"customers"/],
    ["no-store repair response", /Cache-Control.*no-store/],
  ]],
  ["src/app/api/health/route.ts", [
    ["AI health indicator", /concierge: hasGemini/],
    ["CRM health indicator", /crm,/],
    ["lead storage health indicator", /leadStorage/],
    ["image privacy flag", /GEMINI_IMAGE_INPUT_ENABLED/],
  ]],
  ["src/app/api/lead/route.ts", [
    ["validated lead schema", /Schema\\.safeParse/],
    ["lead rate limiting", /rateLimit\\(/],
    ["primary CRM lead persistence", /rest\\/v1\\/leads/],
    ["idempotent website lead ledger", /on_conflict=event_id/],
    ["fail-open customer handoff", /WhatsApp/],
  ]],
];

let failures = 0;
for (const [path, checks] of required) {
  let source = "";
  try { source = await readFile(new URL(`../${path}`, import.meta.url), "utf8"); }
  catch { console.error(`[critical-flow-guard] MISSING ${path}`); failures++; continue; }
  for (const [label, pattern] of checks) {
    if (!pattern.test(source)) {
      console.error(`[critical-flow-guard] FAIL ${path}: ${label}`);
      failures++;
    }
  }
}
if (failures) {
  console.error(`[critical-flow-guard] Build blocked: ${failures} critical AI/CRM invariant(s) missing.`);
  process.exit(1);
}
console.log("[critical-flow-guard] AI, repair-status CRM, health and lead-capture invariants verified.");
