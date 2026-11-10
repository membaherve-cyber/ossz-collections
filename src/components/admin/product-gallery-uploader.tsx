"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ProductGalleryUploaderProps {
  initialPhotos?: string[];
  name?: string;
  label?: string;
}

export function ProductGalleryUploader({
  initialPhotos = [],
  name = "photos",
  label = "Product Photos & Gallery",
}: ProductGalleryUploaderProps) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError("");
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "products");

        const res = await fetch("/api/admin/upload-image", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }
        uploadedUrls.push(data.url);
      }

      setPhotos((prev) => [...prev, ...uploadedUrls]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error.";
      setError(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function setAsPrimary(index: number) {
    if (index === 0) return;
    setPhotos((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      return [item, ...copy];
    });
  }

  return (
    <div className="space-y-3 sm:col-span-2">
      <div className="flex items-center justify-between">
        <label className="label mb-0">{label}</label>
        <span className="text-xs text-muted">
          {photos.length} photo{photos.length !== 1 ? "s" : ""} · First image is cover
        </span>
      </div>

      {/* Hidden textarea that syncs into existing form action */}
      <textarea
        name={name}
        id={name}
        value={photos.join("\n")}
        onChange={(e) => setPhotos(e.target.value.split("\n").filter(Boolean))}
        className="hidden"
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleFiles}
        className="hidden"
      />

      {/* Gallery Grid */}
      <div className="rounded-xl border border-line bg-paper/60 p-4 shadow-xs">
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
            {photos.map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                className={`relative group rounded-lg overflow-hidden border ${
                  idx === 0 ? "border-accent ring-2 ring-accent/20" : "border-line"
                } bg-canvas aspect-[3/4]`}
              >
                <Image
                  src={url}
                  alt={`Product photo ${idx + 1}`}
                  fill
                  sizes="160px"
                  className="object-cover"
                  unoptimized={url.startsWith("http") || url.startsWith("data:")}
                />

                {/* Primary Badge */}
                {idx === 0 ? (
                  <span className="absolute top-1.5 left-1.5 bg-accent text-white text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full shadow-xs">
                    Cover
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAsPrimary(idx)}
                    className="absolute top-1.5 left-1.5 bg-black/60 hover:bg-black text-white text-[9px] font-medium tracking-wider uppercase px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Set Cover
                  </button>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-xs"
                  title="Remove image"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {/* Upload Trigger Area */}
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-line rounded-lg bg-canvas/30 hover:bg-canvas/60 cursor-pointer transition-colors"
        >
          <svg className="h-8 w-8 text-muted/60 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-xs font-medium text-ink">
            {uploading ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                Uploading to ImageKit…
              </span>
            ) : (
              "Upload Product Images from Computer"
            )}
          </p>
          <p className="text-[11px] text-muted mt-0.5">Select single or multiple files (JPEG, PNG, WebP)</p>
        </div>

        {error ? (
          <div className="mt-3 text-xs text-red-600 bg-red-50 p-2.5 rounded border border-red-200">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}
