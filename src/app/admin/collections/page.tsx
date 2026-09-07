import { db } from "@/db";
import { collections } from "@/db/schema";
import { saveCollectionAction } from "@/lib/admin-actions";
import { ActionForm } from "@/components/action-form";

import { guardPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function AdminCollections() {
  await guardPage("catalogue");
  const rows = await db.select().from(collections);
  return (
    <div>
      <h1 className="display text-3xl">Collections</h1>
      <p className="mt-2 text-sm text-ink-soft">Group pieces into a season or a theme, with a cover photo.</p>

      <details className="card mt-6 p-6">
        <summary className="cursor-pointer text-sm font-medium">+ New collection</summary>
        <ActionForm action={saveCollectionAction} submitLabel="Create collection" className="mt-5 grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="name">Name</label><input id="name" name="name" required className="field" /></div>
          <div><label className="label" htmlFor="season">Season label</label><input id="season" name="season" className="field" placeholder="Season 05" /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="coverImage">Cover photo link</label><input id="coverImage" name="coverImage" className="field" /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="description">Description</label><textarea id="description" name="description" rows={2} className="field" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPublished" defaultChecked /> Visible</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isFeatured" /> Featured</label>
        </ActionForm>
      </details>

      <div className="mt-8 space-y-4">
        {rows.map((collection) => (
          <details key={collection.id} className="card p-5">
            <summary className="cursor-pointer text-sm font-medium">
              {collection.name} <span className="text-xs text-muted">/{collection.slug} · {collection.isPublished ? "live" : "hidden"}</span>
            </summary>
            <ActionForm action={saveCollectionAction} submitLabel="Save" className="mt-4 grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={collection.id} />
              <input type="hidden" name="slug" value={collection.slug} />
              <div><label className="label" htmlFor={`n${collection.id}`}>Name</label><input id={`n${collection.id}`} name="name" defaultValue={collection.name} className="field" /></div>
              <div><label className="label" htmlFor={`s${collection.id}`}>Season</label><input id={`s${collection.id}`} name="season" defaultValue={collection.season} className="field" /></div>
              <div className="sm:col-span-2"><label className="label" htmlFor={`c${collection.id}`}>Cover photo link</label><input id={`c${collection.id}`} name="coverImage" defaultValue={collection.coverImage} className="field" /></div>
              <div className="sm:col-span-2"><label className="label" htmlFor={`d${collection.id}`}>Description</label><textarea id={`d${collection.id}`} name="description" rows={2} defaultValue={collection.description} className="field" /></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPublished" defaultChecked={collection.isPublished} /> Visible</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isFeatured" defaultChecked={collection.isFeatured} /> Featured</label>
            </ActionForm>
          </details>
        ))}
      </div>
    </div>
  );
}
