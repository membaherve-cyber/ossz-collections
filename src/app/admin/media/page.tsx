import Image from "next/image";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { addMediaAction, deleteMediaAction } from "@/lib/admin-actions";
import { ActionForm } from "@/components/action-form";

import { guardPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function MediaLibrary() {
  await guardPage("catalogue");
  const rows = await db.select().from(media).orderBy(desc(media.createdAt));
  return (
    <div>
      <h1 className="display text-3xl">Media library</h1>
      <p className="mt-2 text-sm text-ink-soft">
        One searchable place for every photo. Add a photo here, then copy its link into a product,
        collection or journal entry.
      </p>

      <ActionForm action={addMediaAction} submitLabel="Add photo" className="card mt-6 grid gap-4 p-6 sm:grid-cols-3">
        <div className="sm:col-span-3"><label className="label" htmlFor="url">Photo link (https://…)</label><input id="url" name="url" required className="field" /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="altText">Describe the photo (for accessibility)</label><input id="altText" name="altText" className="field" /></div>
        <div><label className="label" htmlFor="tags">Tags</label><input id="tags" name="tags" className="field" placeholder="campaign, silk" /></div>
      </ActionForm>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {rows.map((item) => (
          <figure key={item.id} className="card overflow-hidden">
            <div className="relative aspect-square">
              <Image src={item.url} alt={item.altText} fill sizes="25vw" quality={65} className="object-cover" />
            </div>
            <figcaption className="space-y-1 p-3 text-xs">
              <p className="truncate text-muted">{item.tags || "untagged"}</p>
              <input readOnly value={item.url} className="field px-2 py-1 text-[0.65rem]" aria-label="Photo link" />
              <form action={deleteMediaAction}>
                <input type="hidden" name="id" value={item.id} />
                <button className="text-red-600 link-underline">Remove</button>
              </form>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
