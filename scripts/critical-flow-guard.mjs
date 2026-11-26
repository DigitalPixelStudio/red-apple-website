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
for (const invariant of ["DESKTOP_TABLET_NON_HERO_FIT", "profile.startsWith('desktop-')", "profile.startsWith('tablet-')", "id !== 'canvas-hero'", "MODEL_CAMERA_ZOOM_BOOST", "const layoutFit = isLargeScreen && isLowerStage && isMacbook ? 0.86 : 1;", "const machineZoom = isLargeScreen ? 1.05 : 0.86;", "const machine90LZoom = isLargeScreen ? 0.98 : 0.80;", "const isTbk90L = id === 'canvas-tbk-90l';", "const isComponentArchitecture = id === 'canvas-internals';", "const isEstimateTablet = id === 'canvas-estimate-ipad';", "const isPickupModel = id === 'canvas-pickup-iphone';", "(isComponentArchitecture || isEstimateTablet || isPickupModel) ? 1.04", "PERFORMANCE_DEFAULT_MOTION_OFF"]) {
  if (!modelSource.includes(invariant)) failures.push(`public/final-site.js missing desktop/tablet model-fit invariant: ${invariant}`);
}
const webglPath = "public/final-site.js";
try {
  const webgl = await readFile(new URL(`../${webglPath}`, import.meta.url), "utf8");
  for (const marker of ["SCROLL_RENDER_PAUSE", "pauseWebGLDuringPageScroll", "SCROLL_RESUME_DELAY_MS = 160", "scrollResumeTimer || visibleSlots.size === 0", "MODEL_CAMERA_ZOOM_BOOST", "PERFORMANCE_DEFAULT_MOTION_OFF", "POINTER_DRAG_ONLY_NO_LAYOUT_READS"]) {
    if (!webgl.includes(marker)) failures.push(`${webglPath}: ${marker}`);
  }
  if (webgl.includes("getScrollMotionScale") || webgl.includes("box.getBoundingClientRect()")) {
    failures.push(`${webglPath}: obsolete scroll-render or pointer-sheen work remains`);
  }
} catch {
  failures.push(`MISSING ${webglPath}`);
}
const stylePath = "src/app/final-site.css";
try {
  const styles = await readFile(new URL(`../${stylePath}`, import.meta.url), "utf8");
  for (const marker of ["raHeadingPulseFinal", "raBrandColourFinal", "brand-name-flow", "prefers-reduced-motion", "SCROLL / GPU STABILITY", "BACKGROUND MOTION CLEANUP", "TEXT SCROLL JITTER FIX", "html[data-motion=\"off\"] #ambient-particles", "html[data-motion=\"off\"] .ra-motion-text.ra-motion-visible", "html[data-motion=\"off\"] .stage-3d-box::before", "filter: none !important;"]) {
    if (!styles.includes(marker)) failures.push(`${stylePath}: ${marker}`);
  }
  for (const removedMotion of ["@keyframes faiColorFlow", "animation: faiHeadingBreath 5.2s ease-in-out infinite !important;", "animation: raHeadingPulseFinal 5.2s cubic-bezier(.42,0,.58,1) infinite !important;"]) {
    if (styles.includes(removedMotion)) failures.push(`${stylePath}: expensive text-motion restore remains: ${removedMotion}`);
  }
} catch {
  failures.push(`MISSING ${stylePath}`);
}

const globalStylePath = "src/app/globals.css";
try {
  const globalStyles = await readFile(new URL(`../${globalStylePath}`, import.meta.url), "utf8");
  for (const marker of ["FINAL MOTION BUDGET", "FINAL TEXT SCROLL-JITTER FIX — all motion modes", "font-variation-settings: normal !important;", "background-position: 0 50% !important;", "color: #111113 !important;", "color: #dc2626 !important;", "#ambient-particles { display: none !important; }", "Keep native UI feedback transitions available for touch/click response."]) {
    if (!globalStyles.includes(marker)) failures.push(`${globalStylePath}: ${marker}`);
  }
  const motionOffRule = globalStyles.match(/html\\[data-motion="off"\\] \\*,[\\s\\S]*?\\{([\\s\\S]*?)\\}/);
  if (motionOffRule?.[1].includes("transition: none")) failures.push(`${globalStylePath}: global motion-off rule still disables touch feedback transitions`);
} catch {
  failures.push(`MISSING ${globalStylePath}`);
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
const htmlPath = "src/lib/final-site-html.ts";
try {
  const html = await readFile(new URL(`../${htmlPath}`, import.meta.url), "utf8");
  for (const marker of ["Glass Restoration And Repair Support", "TBK-958 Cold UV Laser", "#ZeroPasswordPolicy", "Get a Glass-restoration Quote", "ra-glass-capabilities", "AirPods Pro &amp; Charging Case", "Mobile Repairs", "Halasuru · Bengaluru"]) {
    if (!html.includes(marker)) failures.push(`${htmlPath}: missing ${marker}`);
  }
  for (const removed of ['id="repair-capabilities"', "#Halasuru"]) {
    if (html.includes(removed)) failures.push(`${htmlPath}: obsolete glass section item remains: ${removed}`);
  }
} catch {
  failures.push(`MISSING ${htmlPath}`);
}
if (failures.length) {
  console.error("[critical-flow-guard] Build blocked; critical invariants are missing:");
  failures.forEach((failure) => console.error(" - " + failure));
  process.exit(1);
}
console.log("[critical-flow-guard] AI, repair-status CRM, health, lead-capture, model framing and glass-support invariants verified.");
