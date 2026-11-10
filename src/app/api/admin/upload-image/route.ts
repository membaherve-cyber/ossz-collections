import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, canManageCatalogue } from "@/lib/auth";
import { uploadImage, type ImageKitFolder } from "@/lib/imagekit";

export const runtime = "nodejs";

const MAX_IMAGE_MB = 15;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]);

const VALID_FOLDERS: Set<ImageKitFolder> = new Set([
  "products",
  "lookbook",
  "collections",
  "journal",
  "homepage-blocks",
]);

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canManageCatalogue(user.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid form payload" }, { status: 400 });
  }

  const file = formData.get("file");
  const folderParam = (formData.get("folder") as string) || "products";
  const folder: ImageKitFolder = VALID_FOLDERS.has(folderParam as ImageKitFolder)
    ? (folderParam as ImageKitFolder)
    : "products";

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, error: "Please select an image file" }, { status: 400 });
  }

  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    return NextResponse.json(
      { ok: false, error: `Image exceeds maximum allowed size (${MAX_IMAGE_MB} MB)` },
      { status: 413 },
    );
  }

  if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase()) && !/\.(jpg|jpeg|png|webp|gif|avif|svg)$/i.test(file.name)) {
    return NextResponse.json(
      { ok: false, error: "Unsupported image format. Allowed formats: JPEG, PNG, WebP, AVIF, GIF." },
      { status: 400 },
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await uploadImage(buffer, file.name, folder);

    return NextResponse.json({
      ok: true,
      url: result.url,
      name: result.name,
      fileId: result.fileId,
      storage: result.storage,
    });
  } catch (err: unknown) {
    console.error("[ossz] Image upload failure:", err);
    const message = err instanceof Error ? err.message : "Internal upload error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
