import Image from "next/image";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { addMediaAction, deleteMediaAction } from "@/lib/admin-actions";
import { ActionForm } from "@/components/action-form";
import { ImageUploadControl } from "@/components/admin/image-upload-control";
import { guardPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function MediaLibrary() {
  await guardPage("catalogue");
  const rows = await db.select().from(media).orderBy(desc(media.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">Assets</span>
          <h1 className="display text-3xl font-medium tracking-tight text-ink mt-0.5">Media Library</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Central visual asset repository. Upload editorial or product images to ImageKit and copy permanent CDN URLs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1 text-xs text-ink-soft shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-accent" />
            {rows.length} Stored Assets
          </span>
        </div>
      </div>

      {/* Add Media Form Card */}
      <div className="card rounded-2xl border border-line bg-paper p-6 shadow-xs">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">+ Upload / Register New Media Asset</p>
        <ActionForm action={addMediaAction} submitLabel="Save to media library" className="grid gap-5 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <ImageUploadControl id="url" name="url" folder="products" label="Asset file / link" helpText="Upload via ImageKit or paste an external image link." required />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="altText">Alt description (accessibility & SEO)</label>
            <input id="altText" name="altText" className="field rounded-xl" placeholder="e.g. Model wearing emerald raw silk robe" />
          </div>
          <div>
            <label className="label" htmlFor="tags">Categorization tags</label>
            <input id="tags" name="tags" className="field rounded-xl" placeholder="lookbook, editorial, silk" />
          </div>
        </ActionForm>
      </div>

      {/* Media Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-ink">Asset Archive ({rows.length})</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((item) => (
            <figure key={item.id} className="card rounded-2xl overflow-hidden border border-line bg-paper shadow-xs group hover:border-accent/40 transition-all">
              <div className="relative aspect-square bg-canvas">
                <Image src={item.url} alt={item.altText || "OSSZ asset"} fill sizes="25vw" quality={65} className="object-cover group-hover:scale-102 transition-transform duration-300" />
              </div>
              <figcaption className="p-3.5 space-y-2 text-xs">
                <p className="truncate text-muted text-[11px] font-medium">{item.tags || "untagged"}</p>
                <input
                  readOnly
                  value={item.url}
                  className="field rounded-lg px-2 py-1 text-[10px] font-mono select-all bg-canvas/70 text-ink-soft cursor-pointer"
                  aria-label="Photo link"
                  onClick={(e) => {
                    (e.target as HTMLInputElement).select();
                  }}
                  title="Click to select and copy URL"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-muted">Click URL to copy</span>
                  <form action={deleteMediaAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="text-red-600 hover:text-red-700 text-xs font-medium"
                      onClick={(e) => {
                        if (!confirm("Are you sure you want to remove this media asset?")) {
                          e.preventDefault();
                        }
                      }}
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </figcaption>
            </figure>
          ))}
          {rows.length === 0 ? (
            <div className="col-span-full card rounded-2xl border border-dashed border-line bg-paper/40 p-12 text-center text-sm text-muted">
              No media assets registered yet. Upload a photo above to populate your library.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
