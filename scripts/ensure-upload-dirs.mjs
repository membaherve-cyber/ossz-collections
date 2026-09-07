import fs from "node:fs";
import path from "node:path";

/**
 * Creates the uploads directories the backoffice media tools write into.
 *
 * Next.js builds run before any upload exists, so this script makes sure the
 * folders are present before every build and dev start. On Vercel the
 * filesystem is read-only except /tmp — src/lib/media-storage.ts handles that
 * fallback at runtime; this script only guarantees the local layout.
 */

const roots = [
  path.join(process.cwd(), "public", "uploads", "images"),
  path.join(process.cwd(), "public", "uploads", "videos"),
  path.join(process.cwd(), "public", "uploads", "posters"),
];

for (const root of roots) {
  fs.mkdirSync(root, { recursive: true });
}

console.log("[ossz] upload directories ready");
