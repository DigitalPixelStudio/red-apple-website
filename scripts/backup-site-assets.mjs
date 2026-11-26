import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outArg = process.argv.find((arg) => arg.startsWith("--output="))?.slice(9);
const output = path.resolve(root, outArg || path.join("backups", "site-assets", stamp));

const files = [
  "public/final-site.js", // procedural Three.js scene/model source
  "src/lib/final-site-html.ts",
  "src/app/final-site.css",
  "src/app/globals.css",
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/lib/site.ts",
  "src/lib/pricing.ts",
  "src/lib/glass-pricing.ts",
  "src/lib/knowledge-base.ts",
  "src/app/api/concierge/route.ts",
  "src/app/api/crm-status/route.ts",
  "src/app/api/health/route.ts",
  "scripts/critical-flow-guard.mjs",
  "package.json",
  "README.md",
];
const directories = ["public/images", "public/models"];

async function exists(p) {
  try { await readFile(p); return true; } catch { return false; }
}
async function hashFile(file) {
  const bytes = await readFile(file);
  return createHash("sha256").update(bytes).digest("hex");
}
async function collect(dir, base = dir) {
  const found = [];
  let entries;
  try { entries = await readdir(path.join(root, dir), { withFileTypes: true }); }
  catch { return found; }
  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue;
    const rel = path.posix.join(dir.replaceAll(path.sep, "/"), entry.name);
    if (entry.isDirectory()) found.push(...await collect(rel, base));
    else if (entry.isFile()) found.push(rel);
  }
  return found;
}

await mkdir(output, { recursive: true });
const selected = new Set(files);
for (const dir of directories) {
  for (const file of await collect(dir)) selected.add(file);
}
// Include root-level public raster/vector assets, icons and manifests.
for (const entry of await readdir(path.join(root, "public"), { withFileTypes: true })) {
  if (entry.isFile() && /\.(?:png|jpe?g|webp|avif|svg|ico|webmanifest|json)$/i.test(entry.name)) {
    selected.add(path.posix.join("public", entry.name));
  }
}

const manifest = {
  schemaVersion: 1,
  createdAt: new Date().toISOString(),
  project: "Red Apple Mobile Repair",
  repository: "DigitalPixelStudio/red-apple-website",
  branch: process.env.GITHUB_REF_NAME || null,
  commit: process.env.GITHUB_SHA || null,
  purpose: "Website source, procedural 3D model source, public images and approved public content/data backup.",
  excluded: [
    ".env files and secrets",
    "Supabase database rows, customer PII, repair tickets and invoices",
    "Gemini/API credentials, access tokens and private keys",
    "node_modules, .next build output and deployment caches"
  ],
  files: []
};

for (const rel of [...selected].sort()) {
  const source = path.join(root, rel);
  try {
    const stat = await import("node:fs/promises").then(({ stat }) => stat(source));
    if (!stat.isFile()) continue;
    const destination = path.join(output, rel);
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(source, destination);
    manifest.files.push({ path: rel.replaceAll(path.sep, "/"), bytes: stat.size, sha256: await hashFile(source) });
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}
await writeFile(path.join(output, "BACKUP-MANIFEST.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(`[site-backup] Saved ${manifest.files.length} files to ${path.relative(root, output)}`);
console.log("[site-backup] Includes procedural 3D source, public images, site content and protected route source.");
console.log("[site-backup] Does NOT export customer/CRM database records or secrets.");
