import Image from "next/image";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { homeBlocks } from "@/db/schema";
import { deleteHomeBlockAction, saveHomeBlockAction } from "@/lib/admin-actions";
import { ActionForm } from "@/components/action-form";
import { ImageUploadControl } from "@/components/admin/image-upload-control";
import { guardPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function HomepageBuilder() {
  await guardPage("catalogue");
  const blocks = await db.select().from(homeBlocks).orderBy(asc(homeBlocks.sortOrder));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">Storefront</span>
          <h1 className="display text-3xl font-medium tracking-tight text-ink mt-0.5">Homepage Blocks</h1>
          <p className="mt-1 text-sm text-ink-soft">
            The homepage is composed from modular story and banner blocks. Update visuals or copy and changes propagate instantly.
          </p>
        </div>
      </div>

      <details className="group rounded-2xl border border-line bg-paper p-6 shadow-xs transition-all hover:border-accent/30">
        <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-ink select-none">
          <span className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent font-semibold">+</span>
            <span>Add new block to homepage</span>
          </span>
          <span className="text-xs text-muted group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <ActionForm action={saveHomeBlockAction} submitLabel="Add block" className="mt-6 grid gap-5 sm:grid-cols-2 pt-4 border-t border-line/60">
          <div>
            <label className="label" htmlFor="type">Block layout type</label>
            <select id="type" name="type" className="field rounded-xl">
              <option value="hero">Hero (full-width top showcase banner)</option>
              <option value="banner">Split editorial banner</option>
              <option value="quote">Intimate invitation / quote card</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="sortOrder">Display order index</label>
            <input id="sortOrder" name="sortOrder" type="number" defaultValue={blocks.length} className="field rounded-xl" />
          </div>
          <div>
            <label className="label" htmlFor="eyebrow">Small eyebrow label</label>
            <input id="eyebrow" name="eyebrow" className="field rounded-xl" placeholder="e.g. New Capsule" />
          </div>
          <div>
            <label className="label" htmlFor="heading">Primary heading</label>
            <input id="heading" name="heading" className="field rounded-xl" placeholder="e.g. Bring Out the Class in You" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="body">Descriptive copy</label>
            <textarea id="body" name="body" rows={2} className="field rounded-xl" placeholder="Editorial paragraph text..." />
          </div>
          <div className="sm:col-span-2">
            <ImageUploadControl id="imageUrl" name="imageUrl" folder="homepage-blocks" label="Block imagery" helpText="Upload via ImageKit or paste an existing link." />
          </div>
          <div>
            <label className="label" htmlFor="ctaLabel">Call-to-action button text</label>
            <input id="ctaLabel" name="ctaLabel" className="field rounded-xl" placeholder="e.g. Explore Collection" />
          </div>
          <div>
            <label className="label" htmlFor="ctaHref">Call-to-action destination</label>
            <input id="ctaHref" name="ctaHref" defaultValue="/shop" className="field rounded-xl" />
          </div>
          <div className="sm:col-span-2 flex items-center gap-3 pt-1">
            <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
              <input type="checkbox" name="isPublished" defaultChecked className="h-4 w-4 rounded border-line text-accent focus:ring-accent" />
              <span>Show on the live storefront</span>
            </label>
          </div>
        </ActionForm>
      </details>

      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Active Homepage Blocks ({blocks.length})</h2>
        {blocks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-paper/40 p-12 text-center text-sm text-muted">
            No homepage blocks yet. Click "+ Add new block to homepage" to configure your first banner.
          </div>
        ) : null}
        {blocks.map((block) => (
          <details key={block.id} className="group rounded-2xl border border-line bg-paper p-5 shadow-xs transition-all hover:border-accent/30">
            <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-ink select-none">
              <div className="flex items-center gap-4">
                <span className="relative h-12 w-20 shrink-0 overflow-hidden rounded-xl border border-line bg-accent-soft/30">
                  {block.imageUrl ? (
                    <Image src={block.imageUrl} alt="" fill sizes="80px" quality={65} className="object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10px] text-muted">No image</span>
                  )}
                </span>
                <div>
                  <div className="font-medium text-ink flex items-center gap-2">
                    {block.heading || "(untitled block)"}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-paper border border-line text-ink-soft uppercase text-[10px] tracking-wide font-medium">
                      {block.type}
                    </span>
                  </div>
                  <div className="text-xs text-muted flex items-center gap-2 mt-0.5">
                    <span>Position #{block.sortOrder}</span>
                    <span>•</span>
                    <span className={block.isPublished ? "text-emerald-700 font-medium" : "text-amber-700"}>
                      {block.isPublished ? "Live" : "Hidden"}
                    </span>
                    {block.eyebrow ? (
                      <>
                        <span>•</span>
                        <span className="italic">“{block.eyebrow}”</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted group-open:rotate-180 transition-transform">▼</span>
            </summary>

            <ActionForm action={saveHomeBlockAction} submitLabel="Save block changes" className="mt-5 grid gap-5 sm:grid-cols-2 pt-4 border-t border-line/60">
              <input type="hidden" name="id" value={block.id} />
              <input type="hidden" name="type" value={block.type} />
              <div>
                <label className="label" htmlFor={`e${block.id}`}>Small eyebrow label</label>
                <input id={`e${block.id}`} name="eyebrow" defaultValue={block.eyebrow ?? ""} className="field rounded-xl" />
              </div>
              <div>
                <label className="label" htmlFor={`o${block.id}`}>Display order index</label>
                <input id={`o${block.id}`} name="sortOrder" type="number" defaultValue={block.sortOrder} className="field rounded-xl" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor={`h${block.id}`}>Primary heading</label>
                <input id={`h${block.id}`} name="heading" defaultValue={block.heading} className="field rounded-xl" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor={`b${block.id}`}>Descriptive copy</label>
                <textarea id={`b${block.id}`} name="body" rows={2} defaultValue={block.body ?? ""} className="field rounded-xl" />
              </div>
              <div className="sm:col-span-2">
                <ImageUploadControl
                  id={`i${block.id}`}
                  name="imageUrl"
                  defaultValue={block.imageUrl}
                  folder="homepage-blocks"
                  label="Block imagery"
                />
              </div>
              <div>
                <label className="label" htmlFor={`cl${block.id}`}>Button text</label>
                <input id={`cl${block.id}`} name="ctaLabel" defaultValue={block.ctaLabel ?? ""} className="field rounded-xl" />
              </div>
              <div>
                <label className="label" htmlFor={`ch${block.id}`}>Button destination</label>
                <input id={`ch${block.id}`} name="ctaHref" defaultValue={block.ctaHref ?? "/shop"} className="field rounded-xl" />
              </div>
              <div className="sm:col-span-2 flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                  <input type="checkbox" name="isPublished" defaultChecked={Boolean(block.isPublished)} className="h-4 w-4 rounded border-line text-accent focus:ring-accent" />
                  <span>Show on the live storefront</span>
                </label>
              </div>
            </ActionForm>
            <div className="mt-4 flex items-center justify-end pt-3 border-t border-line/40">
              <form action={deleteHomeBlockAction}>
                <input type="hidden" name="id" value={block.id} />
                <button
                  type="submit"
                  className="text-xs text-red-600 hover:text-red-700 transition-colors font-medium flex items-center gap-1.5"
                  onClick={(e) => {
                    if (!confirm("Are you sure you want to remove this homepage block?")) {
                      e.preventDefault();
                    }
                  }}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove block permanently
                </button>
              </form>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
