"use client";

import Image from "next/image";
import { useState } from "react";

type Shot = { id: number; url: string; altText: string };

/**
 * Slide gallery for a single article. Multiple photographs of the same garment
 * are shown as slides rather than a stacked grid, so the shape of the piece
 * reads clearly on a phone.
 */
export function ProductGallery({ images, name }: { images: Shot[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  if (images.length === 0) return null;
  const current = images[Math.min(active, images.length - 1)];

  return (
    <div>
      <div
        className={`photo-frame relative aspect-[3/4] ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
        onClick={() => setZoomed((z) => !z)}
        role="button"
        tabIndex={0}
        aria-label="Zoom image"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setZoomed((z) => !z); }
        }}
      >
        <Image
          key={current.id}
          src={current.url}
          alt={current.altText || name}
          fill
          priority
          fetchPriority="high"
          sizes="(min-width: 1024px) 55vw, 100vw"
          quality={68}
          className={`object-cover object-top fade transition-transform duration-500 ${zoomed ? "scale-[1.9]" : "scale-100"}`}
        />

        {images.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous view"
              onClick={(e) => { e.stopPropagation(); setActive((i) => (i - 1 + images.length) % images.length); setZoomed(false); }}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink shadow transition hover:bg-paper"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next view"
              onClick={(e) => { e.stopPropagation(); setActive((i) => (i + 1) % images.length); setZoomed(false); }}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink shadow transition hover:bg-paper"
            >
              ›
            </button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  aria-label={`View ${i + 1} of ${images.length}`}
                  aria-current={i === active}
                  onClick={(e) => { e.stopPropagation(); setActive(i); }}
                  className={`h-1.5 rounded-full transition-all ${
                    i === active ? "w-6 bg-ink" : "w-1.5 bg-ink/30 hover:bg-ink/60"
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View ${i + 1}`}
              className={`relative aspect-[3/4] overflow-hidden rounded-lg border-2 transition ${
                i === active ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt="" fill sizes="120px" quality={45} className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
