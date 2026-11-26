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
const modelSource = await readFile(new URL("../public/final-site.js", import.meta.url), "utf8");
for (const invariant of ["DESKTOP_TABLET_NON_HERO_FIT", "profile.startsWith('desktop-')", "profile.startsWith('tablet-')", "id !== 'canvas-hero'", "MODEL_CAMERA_ZOOM_BOOST", "id === 'canvas-macbook' ? 1.08 : 1.04", "PERFORMANCE_DEFAULT_MOTION_OFF"]) {
  if (!modelSource.includes(invariant)) failures.push(`public/final-site.js missing desktop/tablet model-fit invariant: ${invariant}`);
}
const webglPath = "public/final-site.js";
try {
  const webgl = await readFile(new URL(`../${webglPath}`, import.meta.url), "utf8");
  for (const marker of ["SCROLL_SETTLE_AUTO_ORBIT", "getScrollMotionScale(now)", "notePageScroll", "MODEL_CAMERA_ZOOM_BOOST", "PERFORMANCE_DEFAULT_MOTION_OFF"]) {
    if (!webgl.includes(marker)) failures.push(`${webglPath}: ${marker}`);
  }
} catch {
  failures.push(`MISSING ${webglPath}`);
}
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
