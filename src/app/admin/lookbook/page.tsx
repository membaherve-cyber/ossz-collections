import Image from "next/image";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { lookbookItems } from "@/db/schema";
import { deleteLookAction, saveLookAction } from "@/lib/admin-actions";
import { ActionForm } from "@/components/action-form";

import { guardPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function AdminLookbook() {
  await guardPage("catalogue");
  const looks = await db.select().from(lookbookItems).orderBy(asc(lookbookItems.sortOrder));
  return (
    <div>
      <h1 className="display text-3xl">Lookbook</h1>
      <p className="mt-2 text-sm text-ink-soft">Editorial photos, optionally linked to the piece being worn.</p>

      <ActionForm action={saveLookAction} submitLabel="Add look" className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
        <div><label className="label" htmlFor="title">Title</label><input id="title" name="title" className="field" placeholder="Look 07" /></div>
        <div><label className="label" htmlFor="sortOrder">Order</label><input id="sortOrder" name="sortOrder" type="number" defaultValue={looks.length} className="field" /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="imageUrl">Photo link</label><input id="imageUrl" name="imageUrl" required className="field" /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="caption">Caption</label><input id="caption" name="caption" className="field" /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="productSlug">Links to product (page name)</label><input id="productSlug" name="productSlug" className="field" placeholder="mbanga-silk-gown" /></div>
      </ActionForm>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {looks.map((look) => (
          <figure key={look.id} className="card overflow-hidden">
            <div className="relative aspect-[3/4]">
              <Image src={look.imageUrl} alt={look.title} fill sizes="25vw" quality={65} className="object-cover" />
            </div>
            <figcaption className="p-3 text-xs">
              <p>{look.title}</p>
              <p className="text-muted">{look.caption}</p>
              <form action={deleteLookAction} className="mt-2">
                <input type="hidden" name="id" value={look.id} />
                <button className="text-red-600 link-underline">Remove</button>
              </form>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
