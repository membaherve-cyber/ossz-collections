import Image from "next/image";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { homeBlocks } from "@/db/schema";
import { deleteHomeBlockAction, saveHomeBlockAction } from "@/lib/admin-actions";
import { ActionForm } from "@/components/action-form";

import { guardPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function HomepageBuilder() {
  await guardPage("catalogue");
  const blocks = await db.select().from(homeBlocks).orderBy(asc(homeBlocks.sortOrder));
  return (
    <div>
      <h1 className="display text-3xl">Homepage blocks</h1>
      <p className="mt-2 text-sm text-ink-soft">
        The homepage is built from blocks. Change the wording or photo, set the order, and save —
        the live site updates immediately.
      </p>

      <details className="card mt-6 p-6">
        <summary className="cursor-pointer text-sm font-medium">+ Add a block</summary>
        <ActionForm action={saveHomeBlockAction} submitLabel="Add block" className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="type">Block type</label>
            <select id="type" name="type" className="field">
              <option value="hero">Hero (full-width top banner)</option>
              <option value="banner">Split banner</option>
              <option value="quote">Small invitation card</option>
            </select>
          </div>
          <div><label className="label" htmlFor="sortOrder">Order</label><input id="sortOrder" name="sortOrder" type="number" defaultValue={blocks.length} className="field" /></div>
          <div><label className="label" htmlFor="eyebrow">Small label above</label><input id="eyebrow" name="eyebrow" className="field" /></div>
          <div><label className="label" htmlFor="heading">Heading</label><input id="heading" name="heading" className="field" /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="body">Text</label><textarea id="body" name="body" rows={2} className="field" /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="imageUrl">Photo link</label><input id="imageUrl" name="imageUrl" className="field" /></div>
          <div><label className="label" htmlFor="ctaLabel">Button text</label><input id="ctaLabel" name="ctaLabel" className="field" /></div>
          <div><label className="label" htmlFor="ctaHref">Button link</label><input id="ctaHref" name="ctaHref" defaultValue="/shop" className="field" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPublished" defaultChecked /> Show on the homepage</label>
        </ActionForm>
      </details>

      <div className="mt-8 space-y-4">
        {blocks.map((block) => (
          <details key={block.id} className="card p-5">
            <summary className="flex cursor-pointer items-center gap-4 text-sm font-medium">
              <span className="relative h-12 w-16 overflow-hidden bg-accent-soft">
                {block.imageUrl ? <Image src={block.imageUrl} alt="" fill sizes="64px" quality={65} className="object-cover" /> : null}
              </span>
              <span>
                {block.heading || "(untitled block)"}
                <span className="block text-xs text-muted">{block.type} · position {block.sortOrder} · {block.isPublished ? "live" : "hidden"}</span>
              </span>
            </summary>
            <ActionForm action={saveHomeBlockAction} submitLabel="Save block" className="mt-4 grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={block.id} />
              <input type="hidden" name="type" value={block.type} />
              <div><label className="label" htmlFor={`e${block.id}`}>Small label</label><input id={`e${block.id}`} name="eyebrow" defaultValue={block.eyebrow} className="field" /></div>
              <div><label className="label" htmlFor={`o${block.id}`}>Order</label><input id={`o${block.id}`} name="sortOrder" type="number" defaultValue={block.sortOrder} className="field" /></div>
              <div className="sm:col-span-2"><label className="label" htmlFor={`h${block.id}`}>Heading</label><input id={`h${block.id}`} name="heading" defaultValue={block.heading} className="field" /></div>
              <div className="sm:col-span-2"><label className="label" htmlFor={`b${block.id}`}>Text</label><textarea id={`b${block.id}`} name="body" rows={2} defaultValue={block.body} className="field" /></div>
              <div className="sm:col-span-2"><label className="label" htmlFor={`i${block.id}`}>Photo link</label><input id={`i${block.id}`} name="imageUrl" defaultValue={block.imageUrl} className="field" /></div>
              <div><label className="label" htmlFor={`cl${block.id}`}>Button text</label><input id={`cl${block.id}`} name="ctaLabel" defaultValue={block.ctaLabel} className="field" /></div>
              <div><label className="label" htmlFor={`ch${block.id}`}>Button link</label><input id={`ch${block.id}`} name="ctaHref" defaultValue={block.ctaHref} className="field" /></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPublished" defaultChecked={block.isPublished} /> Show on the homepage</label>
            </ActionForm>
            <form action={deleteHomeBlockAction} className="mt-3">
              <input type="hidden" name="id" value={block.id} />
              <button className="text-xs text-red-600 link-underline">Remove this block</button>
            </form>
          </details>
        ))}
      </div>
    </div>
  );
}
