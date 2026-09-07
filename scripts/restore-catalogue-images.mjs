import fs from "node:fs";
import path from "node:path";

/**
 * Restores product images from a text archive.
 *
 * Some no-code download tools skip binary image folders. This script makes the
 * repository self-contained anyway: `scripts/catalogue-images.json` stores the
 * catalogue images as base64 text, and this script recreates `public/catalogue`
 * before every production build.
 */

const archivePath = path.join(process.cwd(), "scripts/catalogue-images.json");
const outDir = path.join(process.cwd(), "public/catalogue");

if (!fs.existsSync(archivePath)) {
  console.warn("[ossz] catalogue image archive not found; skipping image restore");
  process.exit(0);
}

const archive = JSON.parse(fs.readFileSync(archivePath, "utf8"));
fs.mkdirSync(outDir, { recursive: true });

let written = 0;
let kept = 0;

for (const [file, base64] of Object.entries(archive)) {
  const safe = file.replace(/[^A-Za-z0-9_.-]/g, "");
  const target = path.join(outDir, safe);
  const data = Buffer.from(base64, "base64");

  if (fs.existsSync(target) && fs.statSync(target).size === data.length) {
    kept += 1;
    continue;
  }

  fs.writeFileSync(target, data);
  written += 1;
}

console.log(`[ossz] catalogue images ready: ${kept} kept, ${written} restored`);
