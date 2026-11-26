import { readFile } from "node:fs/promises";

const required = [
  ["src/app/api/concierge/route.ts", [
    "export async function POST", "GEMINI_IMAGE_INPUT_ENABLED", "rateLimit(",
    "localResponse", "KNOWLEDGE_BASE", "IMAGE_MODELS", "inlineData",
    "imageConsent", "image-review-disabled", "image_payload_too_large",
  ]],
  ["src/app/api/crm-status/route.ts", [
    "Schema.safeParse", "rateLimit(", "CRM_SUPABASE_READONLY_KEY",
    '"customers"', '"repairs"', '"invoices"', "Cache-Control",
  ]],
  ["src/app/api/health/route.ts", [
    "concierge: hasGemini", "crm,", "leadStorage",
    "GEMINI_IMAGE_INPUT_ENABLED",
  ]],
  ["src/app/api/lead/route.ts", [
    "Schema.safeParse", "rateLimit(", 'readRows<IdRow>(baseUrl, serviceKey, "leads"',
    "on_conflict=event_id", "WhatsApp",
  ]],
];

const failures = [];
const stylePath = "src/app/final-site.css";
try {
  const styles = await readFile(new URL(`../${stylePath}`, import.meta.url), "utf8");
  for (const marker of ["raHeadingPulseFinal", "raBrandColourFinal", "brand-name-flow", "prefers-reduced-motion"]) {
    if (!styles.includes(marker)) failures.push(`${stylePath}: ${marker}`);
  }
} catch {
  failures.push(`MISSING ${stylePath}`);
}
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
