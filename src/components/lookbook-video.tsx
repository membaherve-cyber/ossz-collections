"use client";

import { useRef } from "react";

/**
 * Lookbook video tile — plays a muted loop inline, unmutes on hover, and
 * opens a fullscreen lightbox (with sound + native controls) when clicked.
 */
export function LookbookVideo({
  src,
  poster,
  title,
  caption,
  durationSeconds,
  className = "",
  autoPlay = true,
}: {
  src: string;
  poster?: string | null;
  title?: string;
  caption?: string;
  durationSeconds?: number | null;
  className?: string;
  autoPlay?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  function openLightbox() {
    dialogRef.current?.showModal();
  }

  function closeLightbox() {
    dialogRef.current?.close();
    videoRef.current?.play().catch(() => {});
  }

  return (
    <>
      <figure
        className={`group relative cursor-pointer overflow-hidden ${className}`}
        onClick={openLightbox}
        onMouseEnter={() => {
          const v = videoRef.current;
          if (v) {
            v.muted = false;
            v.volume = 0.6;
          }
        }}
        onMouseLeave={() => {
          const v = videoRef.current;
          if (v) v.muted = true;
        }}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster ?? undefined}
          className="h-full w-full object-cover"
          style={{ aspectRatio: "3 / 4" }}
          autoPlay={autoPlay}
          muted
          loop
          playsInline
          preload="metadata"
        />
        <span className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-white">
          <svg width="9" height="10" viewBox="0 0 9 10" fill="currentColor" aria-hidden>
            <path d="M0 0l9 5-9 5z" />
          </svg>
          Video{typeof durationSeconds === "number" ? ` · ${durationSeconds}s` : ""}
        </span>
        {title || caption ? (
          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
            {title ? <span className="block text-sm font-medium">{title}</span> : null}
            {caption ? <span className="block text-xs opacity-80">{caption}</span> : null}
          </figcaption>
        ) : null}
      </figure>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeLightbox();
        }}
        className="fixed inset-0 h-full max-h-full w-full max-w-full bg-black/90 p-4 backdrop:backdrop-blur-sm open:grid open:place-items-center"
      >
        <div className="relative flex max-h-full w-full max-w-4xl flex-col items-center" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close video"
            className="absolute -top-9 right-0 text-2xl leading-none text-white/80 transition hover:text-white"
          >
            ✕
          </button>
          <video
            src={src}
            poster={poster ?? undefined}
            className="max-h-[85vh] w-auto max-w-full bg-black"
            controls
            autoPlay
            playsInline
          />
          {title ? <p className="mt-3 text-center text-sm text-white/90">{title}</p> : null}
        </div>
      </dialog>
    </>
  );
}
