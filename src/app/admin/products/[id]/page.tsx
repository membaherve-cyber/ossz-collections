import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { categories, collections, productImages, productVariants, products } from "@/db/schema";
import { saveProductAction, updateStockAction } from "@/lib/admin-actions";
import { ActionForm } from "@/components/action-form";

import { guardPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await guardPage("catalogue");
  const { id } = await params;
  const product = (await db.select().from(products).where(eq(products.id, Number(id))).limit(1))[0];
  if (!product) notFound();
  const [cats, cols, images, variants] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
    db.select().from(collections),
    db.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(asc(productImages.sortOrder)),
    db.select().from(productVariants).where(eq(productVariants.productId, product.id)),
  ]);

  return (
    <div>
      <h1 className="display mt-3 text-3xl">{product.name}</h1>
      <Link href={`/product/${product.slug}`} className="text-xs text-accent link-underline">Preview on the live site →</Link>

      <ActionForm action={saveProductAction} submitLabel="Save changes" className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
        <input type="hidden" name="id" value={product.id} />
        <input type="hidden" name="slug" value={product.slug} />
        <div className="sm:col-span-2">
          <label className="label" htmlFor="name">Name</label>
          <input id="name" name="name" defaultValue={product.name} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="basePrice">Price in FCFA</label>
          <input id="basePrice" name="basePrice" type="number" defaultValue={product.basePrice} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="categoryId">Category</label>
          <select id="categoryId" name="categoryId" defaultValue={product.categoryId ?? ""} className="field">
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="collectionId">Collection</label>
          <select id="collectionId" name="collectionId" defaultValue={product.collectionId ?? ""} className="field">
            <option value="">None</option>
            {cols.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="seoTitle">Page title (SEO)</label>
          <input id="seoTitle" name="seoTitle" defaultValue={product.seoTitle} className="field" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="description">Short description</label>
          <textarea id="description" name="description" rows={2} defaultValue={product.description} className="field" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="details">Fabric & fit details</label>
          <textarea id="details" name="details" rows={2} defaultValue={product.details} className="field" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="careInstructions">Care</label>
          <input id="careInstructions" name="careInstructions" defaultValue={product.careInstructions} className="field" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="seoDescription">Share description (SEO)</label>
          <input id="seoDescription" name="seoDescription" defaultValue={product.seoDescription} className="field" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="photos">Photos — one link per line (leave blank to keep current)</label>
          <textarea id="photos" name="photos" rows={3} defaultValue={images.map((i) => i.url).join("\n")} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="sizes">Add sizes</label>
          <input id="sizes" name="sizes" className="field" placeholder="XL" />
        </div>
        <div>
          <label className="label" htmlFor="colours">Add colours</label>
          <input id="colours" name="colours" className="field" placeholder="Palm" />
        </div>
        <input type="hidden" name="initialStock" value={0} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPublished" defaultChecked={product.isPublished} /> Visible on the site</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isFeatured" defaultChecked={product.isFeatured} /> Feature on the homepage</label>
      </ActionForm>

      <h2 className="display mt-10 text-2xl">Stock by variant</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {variants.map((v) => (
          <form key={v.id} action={updateStockAction} className="card flex items-center justify-between gap-3 p-3 text-sm">
            <span>{v.size} · {v.colour}</span>
            <span className="flex items-center gap-2">
              <input type="hidden" name="variantId" value={v.id} />
              <input name="stockQty" type="number" min={0} defaultValue={v.stockQty} className="field w-20 px-2 py-1" aria-label={`Stock ${v.size} ${v.colour}`} />
              <button className="btn btn-ghost btn-sm">Save</button>
            </span>
          </form>
        ))}
      </div>
    </div>
  );
}
