import { db } from "@/db";
import { collections } from "@/db/schema";
import { saveCollectionAction } from "@/lib/admin-actions";
import { ActionForm } from "@/components/action-form";
import { ImageUploadControl } from "@/components/admin/image-upload-control";
import { guardPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function AdminCollections() {
  await guardPage("catalogue");
  const rows = await db.select().from(collections);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">Catalogue</span>
          <h1 className="display text-3xl font-medium tracking-tight text-ink mt-0.5">Collections</h1>
          <p className="mt-1 text-sm text-ink-soft">Group pieces into a curated season or theme with high-resolution imagery.</p>
        </div>
      </div>

      <details className="group rounded-2xl border border-line bg-paper p-6 shadow-xs transition-all hover:border-accent/30">
        <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-ink select-none">
          <span className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent font-semibold">+</span>
            <span>Create new collection</span>
          </span>
          <span className="text-xs text-muted group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <ActionForm action={saveCollectionAction} submitLabel="Create collection" className="mt-6 grid gap-5 sm:grid-cols-2 pt-4 border-t border-line/60">
          <div>
            <label className="label" htmlFor="name">Collection name</label>
            <input id="name" name="name" required className="field rounded-xl" placeholder="e.g. Resort '26" />
          </div>
          <div>
            <label className="label" htmlFor="season">Season label</label>
            <input id="season" name="season" className="field rounded-xl" placeholder="e.g. Season 05 / Capsule" />
          </div>
          <div className="sm:col-span-2">
            <ImageUploadControl id="coverImage" name="coverImage" folder="collections" label="Cover photo" helpText="Upload via ImageKit or paste an existing image URL." />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={3} className="field rounded-xl" placeholder="A brief artistic or editorial statement about this collection..." />
          </div>
          <div className="sm:col-span-2 flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
              <input type="checkbox" name="isPublished" defaultChecked className="h-4 w-4 rounded border-line text-accent focus:ring-accent" />
              <span>Visible on store</span>
            </label>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
              <input type="checkbox" name="isFeatured" className="h-4 w-4 rounded border-line text-accent focus:ring-accent" />
              <span>Featured on homepage</span>
            </label>
          </div>
        </ActionForm>
      </details>

      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Active Collections ({rows.length})</h2>
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-paper/40 p-12 text-center text-sm text-muted">
            No collections created yet. Click "+ Create new collection" above to publish your first season.
          </div>
        ) : null}
        {rows.map((collection) => (
          <details key={collection.id} className="group rounded-2xl border border-line bg-paper p-5 shadow-xs transition-all hover:border-accent/30">
            <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-ink select-none">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-line bg-accent-soft/30 flex items-center justify-center text-xs text-muted">
                  {collection.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={collection.coverImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span>OSSZ</span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-ink flex items-center gap-2">
                    {collection.name}
                    {collection.season ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-paper border border-line text-ink-soft">{collection.season}</span>
                    ) : null}
                  </div>
                  <div className="text-xs text-muted flex items-center gap-2 mt-0.5">
                    <span>/{collection.slug}</span>
                    <span>•</span>
                    <span className={collection.isPublished ? "text-emerald-700 font-medium" : "text-amber-700"}>
                      {collection.isPublished ? "Live" : "Draft / Hidden"}
                    </span>
                    {collection.isFeatured ? (
                      <>
                        <span>•</span>
                        <span className="text-accent font-medium">★ Featured</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted group-open:rotate-180 transition-transform">▼</span>
            </summary>

            <ActionForm action={saveCollectionAction} submitLabel="Save changes" className="mt-5 grid gap-5 sm:grid-cols-2 pt-4 border-t border-line/60">
              <input type="hidden" name="id" value={collection.id} />
              <input type="hidden" name="slug" value={collection.slug} />
              <div>
                <label className="label" htmlFor={`n${collection.id}`}>Collection name</label>
                <input id={`n${collection.id}`} name="name" defaultValue={collection.name} required className="field rounded-xl" />
              </div>
              <div>
                <label className="label" htmlFor={`s${collection.id}`}>Season label</label>
                <input id={`s${collection.id}`} name="season" defaultValue={collection.season ?? ""} className="field rounded-xl" />
              </div>
              <div className="sm:col-span-2">
                <ImageUploadControl
                  id={`c${collection.id}`}
                  name="coverImage"
                  defaultValue={collection.coverImage}
                  folder="collections"
                  label="Cover photo"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor={`d${collection.id}`}>Description</label>
                <textarea id={`d${collection.id}`} name="description" rows={3} defaultValue={collection.description ?? ""} className="field rounded-xl" />
              </div>
              <div className="sm:col-span-2 flex flex-wrap items-center gap-6 pt-1">
                <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                  <input type="checkbox" name="isPublished" defaultChecked={Boolean(collection.isPublished)} className="h-4 w-4 rounded border-line text-accent focus:ring-accent" />
                  <span>Visible on store</span>
                </label>
                <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                  <input type="checkbox" name="isFeatured" defaultChecked={Boolean(collection.isFeatured)} className="h-4 w-4 rounded border-line text-accent focus:ring-accent" />
                  <span>Featured on homepage</span>
                </label>
              </div>
            </ActionForm>
          </details>
        ))}
      </div>
    </div>
  );
}
