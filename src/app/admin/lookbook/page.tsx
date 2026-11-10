import Image from "next/image";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { lookbookItems } from "@/db/schema";
import { deleteLookAction, saveLookAction } from "@/lib/admin-actions";
import { ActionForm } from "@/components/action-form";
import { LookbookMediaUploader } from "@/components/lookbook-media-uploader";
import { guardPage } from "@/lib/guard";
import { ImageUploadControl } from "@/components/admin/image-upload-control";

export const dynamic = "force-dynamic";

export default async function AdminLookbook() {
  await guardPage("catalogue");
  const looks = await db.select().from(lookbookItems).orderBy(asc(lookbookItems.sortOrder));

  return (
    <div className="space-y-8">
      <header className="border-b border-line pb-6">
        <p className="eyebrow">Content & Campaign</p>
        <h1 className="display text-3xl mt-1">Lookbook & Editorial Media</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Editorial photos and videos linked to pieces. Videos support direct MP4/WebM uploads or external platform links (YouTube, Vimeo, MP4).
        </p>
      </header>

      {/* Video Compression Tool */}
      <LookbookMediaUploader />

      {/* Add Look Form */}
      <div className="card rounded-2xl p-6 bg-paper border border-line shadow-xs">
        <h2 className="display text-xl mb-1">Add Lookbook Item</h2>
        <p className="text-xs text-muted mb-4">Upload an editorial photo or attach a video link.</p>

        <ActionForm action={saveLookAction} submitLabel="Save to Lookbook" className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="title">Title</label>
            <input id="title" name="title" className="field" placeholder="Look 08 &middot; Akwa Evening" />
          </div>

          <div>
            <label className="label" htmlFor="sortOrder">Display Order</label>
            <input id="sortOrder" name="sortOrder" type="number" defaultValue={looks.length} className="field" />
          </div>

          {/* Direct Computer ImageKit Upload Control */}
          <div className="sm:col-span-2">
            <ImageUploadControl
              name="imageUrl"
              label="Editorial Photo or Video File"
              folder="lookbook"
              helpText="Upload a photo from your computer, or paste a direct video link below."
            />
          </div>

          <div>
            <label className="label" htmlFor="mediaType">Media Type</label>
            <select id="mediaType" name="mediaType" className="field">
              <option value="image">Still Photography (Image)</option>
              <option value="video">Motion / Video</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="videoUrl">Optional External Video URL (YouTube / Vimeo / MP4)</label>
            <input
              id="videoUrl"
              name="videoUrl"
              className="field"
              placeholder="https://www.youtube.com/watch?v=… or https://…/video.mp4"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="caption">Editorial Caption</label>
            <input id="caption" name="caption" className="field" placeholder="Tailored in Douala &middot; Season 04" />
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="productSlug">Linked Product Slug (optional)</label>
            <input id="productSlug" name="productSlug" className="field" placeholder="ivoire-occasion-gown" />
          </div>
        </ActionForm>
      </div>

      {/* Looks Grid */}
      <div className="space-y-4">
        <h2 className="display text-xl">Current Looks ({looks.length})</h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {looks.map((look) => (
            <figure key={look.id} className="card rounded-xl overflow-hidden border border-line bg-paper shadow-2xs group">
              {look.mediaType === "video" ? (
                <div className="relative aspect-[3/4] bg-black">
                  <video
                    src={look.videoUrl ?? look.imageUrl}
                    poster={look.posterUrl ?? undefined}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white font-medium">
                    Video
                  </span>
                </div>
              ) : (
                <div className="relative aspect-[3/4] bg-canvas">
                  <Image
                    src={look.imageUrl}
                    alt={look.title}
                    fill
                    sizes="25vw"
                    quality={65}
                    className="object-cover"
                    unoptimized={look.imageUrl.startsWith("http")}
                  />
                </div>
              )}
              <figcaption className="p-3.5 text-xs">
                <p className="font-medium text-ink truncate">{look.title || "(Untitled Look)"}</p>
                <p className="text-muted text-[11px] truncate mt-0.5">{look.caption || "No caption"}</p>
                {look.productSlug ? (
                  <p className="text-[10px] text-accent mt-1 font-mono truncate">Linked: /{look.productSlug}</p>
                ) : null}
                <div className="mt-3 pt-2 border-t border-line flex items-center justify-between">
                  <span className="text-[10px] text-muted font-mono">Order #{look.sortOrder}</span>
                  <form action={deleteLookAction}>
                    <input type="hidden" name="id" value={look.id} />
                    <button
                      type="submit"
                      className="text-red-600 hover:text-red-800 text-xs hover:underline"
                      onClick={(e) => {
                        if (!confirm(`Delete ${look.title || "this look"}?`)) e.preventDefault();
                      }}
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
