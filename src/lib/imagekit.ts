import ImageKit from "imagekit";
import { saveUpload } from "@/lib/media-storage";

export type ImageKitFolder =
  | "products"
  | "lookbook"
  | "collections"
  | "journal"
  | "homepage-blocks";

export type ImageUploadResult = {
  url: string;
  fileId?: string;
  name: string;
  storage: "imagekit" | "local";
};

let imagekitClient: ImageKit | null = null;

function getImageKit(): ImageKit | null {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY?.trim();
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY?.trim();
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT?.trim();

  if (!publicKey || !privateKey || !urlEndpoint) {
    return null;
  }

  if (!imagekitClient) {
    imagekitClient = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });
  }

  return imagekitClient;
}

/**
 * Uploads an image to ImageKit if configured; falls back cleanly to local uploads
 * so that administrators can continue working during setup or offline tests.
 */
export async function uploadImage(
  buffer: Buffer,
  originalFileName: string,
  folderType: ImageKitFolder,
): Promise<ImageUploadResult> {
  const ik = getImageKit();

  if (ik) {
    const folderPath = `/ossz/${folderType}/`;
    const cleanName = originalFileName.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
    const uniqueFileName = `${Date.now()}-${cleanName}`;

    const uploadResponse = await ik.upload({
      file: buffer,
      fileName: uniqueFileName,
      folder: folderPath,
      useUniqueFileName: true,
      tags: ["ossz", folderType],
    });

    return {
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      name: uploadResponse.name,
      storage: "imagekit",
    };
  }

  // Graceful local fallback when ImageKit credentials are not yet configured
  const stored = await saveUpload("images", originalFileName, buffer);
  return {
    url: stored.url,
    name: originalFileName,
    storage: "local",
  };
}

/**
 * Safely deletes an asset from ImageKit by fileId if configured.
 */
export async function deleteImage(fileId: string): Promise<boolean> {
  const ik = getImageKit();
  if (!ik || !fileId) return false;

  try {
    await ik.deleteFile(fileId);
    return true;
  } catch (err) {
    console.error("[ossz] ImageKit deletion error:", err);
    return false;
  }
}
