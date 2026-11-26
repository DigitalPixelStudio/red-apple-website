import { readFile } from "node:fs/promises";

const required = [
  ["src/app/api/concierge/route.ts", [
    "export async function POST", "GEMINI_IMAGE_INPUT_ENABLED", "rateLimit(",
    "localResponse", "KNOWLEDGE_BASE",
  ]],
  ["src/app/api/crm-status/route.ts", [
    "Schema.safeParse", "rateLimit(", "CRM_SUPABASE_READONLY_KEY",
    '"customers"', "Cache-Control",
  ]],
  ["src/app/api/health/route.ts", [
    "concierge: hasGemini", "crm,", "leadStorage",
    "GEMINI_IMAGE_INPUT_ENABLED",
  ]],
  ["src/app/api/lead/route.ts", [
    "Schema.safeParse", "rateLimit(", "rest/v1/leads",
    "on_conflict=event_id", "WhatsApp",
  ]],
];

const failures = [];
for (const [path, markers] of required) {
  let source = "";
  try { source = await readFile(new URL(`../${path}`, import.meta.url), "utf8"); }
  catch { failures.push(`MISSING ${path}`); continue; }
  for (const marker of markers) {
    if (!source.includes(marker)) failures.push(`${path}: ${marker}`);
  }
}
if (failures.length) {
  console.error("[critical-flow-guard] Build blocked; critical AI/CRM invariants are missing:");
  failures.forEach((failure) => console.error(" - " + failure));
  process.exit(1);
}
console.log("[critical-flow-guard] AI, repair-status CRM, health and lead-capture invariants verified.");
