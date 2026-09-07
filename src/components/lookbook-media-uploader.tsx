"use client";

import { useRef, useState } from "react";

type UploadResult = {
  url: string;
  webmUrl?: string | null;
  posterUrl?: string | null;
  durationSeconds?: number | null;
  mediaType: "video" | "image";
  optimized: boolean;
};

/**
 * Backoffice media uploader for the lookbook.
 *
 * - Videos: POSTs to /api/admin/upload-video, which transcodes to a
 *   web-friendly MP4 (720p cap, faststart), optionally adds a WebM variant,
 *   and grabs a poster frame. Falls back to storing the original if ffmpeg
 *   is unavailable on the host.
 * - Images: stored as-is; Next/Image optimises them on delivery.
 */
export function LookbookMediaUploader() {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [videoBusy, setVideoBusy] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [error, setError] = useState("");
  const [videoResult, setVideoResult] = useState<UploadResult | null>(null);
  const [imageResult, setImageResult] = useState<UploadResult | null>(null);

  async function upload(file: File, kind: "lookbook-video" | "lookbook-image"): Promise<UploadResult> {
    const body = new FormData();
    body.append("file", file);
    body.append("kind", kind);
    const res = await fetch("/api/admin/upload-video", { method: "POST", body });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error ?? `Upload failed (${res.status})`);
    }
    return (await res.json()) as UploadResult;
  }

  async function onVideoPicked(file: File) {
    if (!file) return;
    setVideoBusy(true);
    setError("");
    setVideoResult(null);
    try {
      const result = await upload(file, "lookbook-video");
      setVideoResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Video upload failed");
    } finally {
      setVideoBusy(false);
    }
  }

  async function onImagePicked(file: File) {
    if (!file) return;
    setImageBusy(true);
    setError("");
    setImageResult(null);
    try {
      const result = await upload(file, "lookbook-image");
      setImageResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Image upload failed");
    } finally {
      setImageBusy(false);
    }
  }

  return (
    <div className="card mt-6 p-6">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">Upload media</h2>
      <p className="mt-1 text-xs text-ink-soft">
        Videos are compressed automatically (720p H.264 + poster frame). Max 120&nbsp;MB per video, 15&nbsp;MB per image.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onVideoPicked(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className="btn btn-secondary w-full"
            disabled={videoBusy}
            onClick={() => videoInputRef.current?.click()}
          >
            {videoBusy ? "Optimising video…" : "Upload video"}
          </button>
          {videoResult ? (
            <div className="mt-3 rounded border border-line p-3 text-xs">
              <p className="font-medium">{videoResult.optimized ? "Optimised ✓" : "Stored as-is (ffmpeg unavailable on host)"}</p>
              {videoResult.durationSeconds ? <p className="text-muted mt-1">Duration: {videoResult.durationSeconds}s</p> : null}
              {videoResult.posterUrl ? <p className="text-muted">Poster frame: {videoResult.posterUrl}</p> : null}
              <p className="mt-1 break-all font-mono text-[11px]">{videoResult.url}</p>
              <button
                type="button"
                className="link-underline mt-1 text-accent"
                onClick={() => void navigator.clipboard.writeText(videoResult.url)}
              >
                Copy video link
              </button>
              <video src={videoResult.url} poster={videoResult.posterUrl ?? undefined} muted loop playsInline className="mt-2 max-h-48 w-full object-cover" />
            </div>
          ) : null}
        </div>

        <div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onImagePicked(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className="btn btn-secondary w-full"
            disabled={imageBusy}
            onClick={() => imageInputRef.current?.click()}
          >
            {imageBusy ? "Uploading…" : "Upload photo"}
          </button>
          {imageResult ? (
            <div className="mt-3 rounded border border-line p-3 text-xs">
              <p className="break-all font-mono text-[11px]">{imageResult.url}</p>
              <button
                type="button"
                className="link-underline mt-1 text-accent"
                onClick={() => void navigator.clipboard.writeText(imageResult.url)}
              >
                Copy image link
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageResult.url} alt="" className="mt-2 max-h-48 w-full object-cover" />
            </div>
          ) : null}
        </div>
      </div>

      {error ? <p className="mt-3 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
