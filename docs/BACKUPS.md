# Asset & Site Data Backups

## What the backup script saves
Run:

```bash
npm run backup:site
```

The script creates a timestamped folder under `backups/site-assets/` containing:
- All tracked public image assets under `public/images/`.
- Any optional `public/models/` assets if that directory exists.
- Root-level public image, icon, SVG, web manifest and JSON assets.
- `public/final-site.js`, which contains the procedural Three.js model builders and render source.
- Approved public content/data source files: site catalog, pricing, glass pricing, AI knowledge base, approved HTML, CSS and page source.
- Read-only AI/CRM/health route source for recovery reference.
- A `BACKUP-MANIFEST.json` with byte sizes and SHA-256 checksums.

Optional custom destination:

```bash
node scripts/backup-site-assets.mjs --output=./safe-backups/red-apple
```

## What it deliberately does NOT save
- Live Supabase rows, customer profiles, phone numbers, repair tickets, invoices or lead records.
- Any `.env` file, Gemini key, Supabase service key, webhook secret, access token or private credential.
- `.next`, `node_modules`, Vercel build caches or other generated dependencies.

A website asset/source backup is not a live CRM database backup. A real database backup must be separately approved, encrypted, access-controlled and stored outside the public Git repository.

## Restore
Copy the backed-up source/assets into a clean checkout only after reviewing the manifest and confirming the target branch. Do not restore protected API routes or CSS/3D source over newer approved work without comparing the diff first. Use Git history for code rollback; use the backup for recovering static assets and approved content.
