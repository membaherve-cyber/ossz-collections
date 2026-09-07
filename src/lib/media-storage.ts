/**
 * Storage helpers for backoffice media uploads.
 *
 * Vercel's serverless filesystem is read-only except for /tmp (which is wiped
 * on cold start), so writes go to local `public/uploads` in dev/self-hosted
 * deployments and fall back to /tmp on Vercel. Both helpers return a public
 * URL, so the upload route stays environment-agnostic.
 */
import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

const PUBLIC_ROOT = path.join(process.cwd(), "public");

/** Vercel marks the deployment dir read-only; /tmp is the writable escape. */
function isReadOnlyFs(): boolean {
  return process.env.VERCEL === "1";
}

export type StoredMedia = {
  /** Path served by the browser, e.g. /uploads/videos/look-abc123.mp4 */
  url: string;
  /** Absolute path on disk (for post-processing like poster extraction). */
  filePath: string;
};

export function safeFileName(original: string): string {
  const ext = path.extname(original).toLowerCase().slice(0, 8) || ".bin";
  const base = path
    .basename(original, path.extname(original))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "media"}-${randomBytes(6).toString("hex")}${ext}`;
}

export async function saveUpload(
  folder: "images" | "videos" | "posters",
  originalName: string,
  data: Buffer,
): Promise<StoredMedia> {
  const fileName = safeFileName(originalName);
  const relDir = path.join("uploads", folder);

  if (isReadOnlyFs()) {
    // /tmp fallback: the file lives until the next cold start. Good enough
    // for a preview; durable hosting needs object storage (see run doc).
    const dir = path.join("/tmp", relDir);
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, data);
    return { url: `/uploads/${folder}/${fileName}`, filePath };
  }

  const dir = path.join(PUBLIC_ROOT, relDir);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, data);
  return { url: `/uploads/${folder}/${fileName}`, filePath };
}
