"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ImageUploadControlProps {
  id?: string;
  name: string;
  defaultValue?: string | null;
  folder?: "products" | "lookbook" | "collections" | "journal" | "homepage-blocks";
  label?: string;
  required?: boolean;
  helpText?: string;
}

export function ImageUploadControl({
  id,
  name,
  defaultValue = "",
  folder = "products",
  label = "Image",
  required = false,
  helpText,
}: ImageUploadControlProps) {
  const [currentUrl, setCurrentUrl] = useState<string>(defaultValue || "");
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [storageType, setStorageType] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to upload image.");
      }

      setCurrentUrl(data.url);
      setStorageType(data.storage === "imagekit" ? "ImageKit" : "Local Storage");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setError(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleRemove() {
    setCurrentUrl("");
    setStorageType("");
    setError("");
  }

  const inputId = id || name;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="label mb-0">
          {label} {required ? <span className="text-accent">*</span> : null}
        </label>
        {storageType ? (
          <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full bg-accent-soft text-accent font-medium">
            {storageType}
          </span>
        ) : null}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Hidden form input that submits with the existing form */}
      <input type="hidden" id={inputId} name={name} value={currentUrl} required={required && !currentUrl} />

      {/* Image Preview / Upload Card */}
      <div className="rounded-xl border border-line bg-paper/60 p-4 transition-all hover:border-accent/40 shadow-xs">
        {currentUrl ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-line bg-canvas">
              <Image
                src={currentUrl}
                alt={label}
                fill
                sizes="96px"
                className="object-cover"
                unoptimized={currentUrl.startsWith("data:") || currentUrl.startsWith("http")}
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-xs font-mono text-ink-soft truncate" title={currentUrl}>
                {currentUrl}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary btn-sm !py-1 !px-3 text-xs"
                >
                  {uploading ? "Uploading…" : "Replace Image"}
                </button>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={handleRemove}
                  className="btn btn-ghost btn-sm !py-1 !px-3 text-xs text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed border-line rounded-lg bg-canvas/30 hover:bg-canvas/60 transition-colors">
            <svg
              className="h-10 w-10 text-muted/60 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs font-medium text-ink mb-1">Upload from computer</p>
            <p className="text-[11px] text-muted mb-3">JPEG, PNG, WebP or AVIF up to 15MB</p>
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary btn-sm !py-1.5 !px-4 text-xs shadow-xs"
            >
              {uploading ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Uploading to ImageKit…
                </span>
              ) : (
                "Choose Image"
              )}
            </button>
          </div>
        )}

        {/* Error message */}
        {error ? (
          <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
            {error}
          </div>
        ) : null}
      </div>

      {helpText ? <p className="text-xs text-muted">{helpText}</p> : null}
    </div>
  );
}
