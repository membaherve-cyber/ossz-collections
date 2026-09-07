import Link from "next/link";
import Image from "next/image";
import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, collections, productImages, productVariants, products } from "@/db/schema";
import { deleteProductAction, saveProductAction } from "@/lib/admin-actions";
import { ActionForm } from "@/components/action-form";
import { formatXAF } from "@/lib/utils";

import { guardPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  await guardPage("catalogue");
  const [rows, cats, cols, images, stock] = await Promise.all([
    db.select().from(products).orderBy(desc(products.createdAt)),
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
    db.select().from(collections),
    db.select().from(productImages).orderBy(asc(productImages.sortOrder)),
    db.select({ productId: productVariants.productId, total: sql<number>`sum(${productVariants.stockQty})` })
      .from(productVariants).groupBy(productVariants.productId),
  ]);

  return (
    <div>
      <h1 className="display text-3xl">Products</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Add a piece with photos, price, sizes and colours. Everything here appears on the live site
        the moment you press save.
      </p>

      <details className="card mt-6 p-6" open={rows.length === 0}>
        <summary className="cursor-pointer text-sm font-medium">+ Add a new piece</summary>
        <ActionForm action={saveProductAction} submitLabel="Publish this piece" className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="name">Name of the piece</label>
            <input id="name" name="name" required className="field" placeholder="Mbanga Silk Gown" />
          </div>
          <div>
            <label className="label" htmlFor="basePrice">Price in FCFA</label>
            <input id="basePrice" name="basePrice" type="number" min={0} required className="field" />
          </div>
          <div>
            <label className="label" htmlFor="initialStock">Starting stock per size</label>
            <input id="initialStock" name="initialStock" type="number" min={0} defaultValue={5} className="field" />
          </div>
          <div>
            <label className="label" htmlFor="categoryId">Category</label>
            <select id="categoryId" name="categoryId" className="field">
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="collectionId">Collection</label>
            <select id="collectionId" name="collectionId" className="field">
              <option value="">None</option>
              {cols.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="description">Short description</label>
            <textarea id="description" name="description" rows={2} className="field" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="details">Fabric & fit details</label>
            <textarea id="details" name="details" rows={2} className="field" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="careInstructions">Care instructions</label>
            <input id="careInstructions" name="careInstructions" className="field" />
          </div>
          <div>
            <label className="label" htmlFor="sizes">Sizes (comma separated)</label>
            <input id="sizes" name="sizes" defaultValue="XS, S, M, L" className="field" />
          </div>
          <div>
            <label className="label" htmlFor="colours">Colours (comma separated)</label>
            <input id="colours" name="colours" defaultValue="Obsidian, Ivory" className="field" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="photos">Photos — one image link per line</label>
            <textarea id="photos" name="photos" rows={3} className="field" placeholder="https://…" />
            <p className="mt-1 text-xs text-muted">Tip: add photos to the media library first, then paste their links here.</p>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPublished" defaultChecked /> Visible on the site</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isFeatured" /> Feature on the homepage</label>
        </ActionForm>
      </details>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase text-muted">
              <th className="py-3">Photo</th><th>Name</th><th>Price</th><th>Stock</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((product) => {
              const image = images.find((i) => i.productId === product.id);
              const total = stock.find((s) => s.productId === product.id);
              return (
                <tr key={product.id} className="border-b border-line/60">
                  <td className="py-2">
                    <div className="relative h-14 w-11 overflow-hidden bg-accent-soft">
                      {image ? <Image src={image.url} alt="" fill sizes="44px" quality={65} className="object-cover" /> : null}
                    </div>
                  </td>
                  <td>
                    <Link href={`/admin/products/${product.id}`} className="link-underline">{product.name}</Link>
                    <span className="block text-xs text-muted">/{product.slug}</span>
                  </td>
                  <td>{formatXAF(product.basePrice)}</td>
                  <td>{Number(total?.total ?? 0)}</td>
                  <td className="text-xs">{product.isPublished ? "Live" : "Draft"}{product.isFeatured ? " · Featured" : ""}</td>
                  <td>
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={product.id} />
                      <button className="text-xs text-red-600 link-underline">Delete</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
