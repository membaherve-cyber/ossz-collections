import Link from "next/link";
import Image from "next/image";
import { asc, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, collections, productImages, productVariants, products } from "@/db/schema";
import { deleteProductAction, saveProductAction } from "@/lib/admin-actions";
import { ActionForm } from "@/components/action-form";
import { formatXAF } from "@/lib/utils";
import { guardPage } from "@/lib/guard";
import { ProductGalleryUploader } from "@/components/admin/product-gallery-uploader";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  await guardPage("catalogue");
  const [rows, cats, cols, images, stock] = await Promise.all([
    db.select().from(products).orderBy(desc(products.createdAt)),
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
    db.select().from(collections),
    db.select().from(productImages).orderBy(asc(productImages.sortOrder)),
    db
      .select({ productId: productVariants.productId, total: sql<number>`sum(${productVariants.stockQty})` })
      .from(productVariants)
      .groupBy(productVariants.productId),
  ]);

  return (
    <div className="space-y-8">
      <header className="border-b border-line pb-6">
        <p className="eyebrow">Catalogue Management</p>
        <h1 className="display text-3xl mt-1">Products & Pieces</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Upload products, manage galleries, sizes, prices, and stock inventory.
        </p>
      </header>

      {/* Add New Product Accordion Card */}
      <details className="card rounded-2xl p-6 bg-paper border border-line shadow-xs group" open={rows.length === 0}>
        <summary className="cursor-pointer text-sm font-semibold flex items-center justify-between text-ink hover:text-accent select-none">
          <span className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold">
              +
            </span>
            Add a New Piece to Catalogue
          </span>
          <span className="text-xs text-muted font-normal">Click to toggle form</span>
        </summary>

        <ActionForm action={saveProductAction} submitLabel="Publish this piece" className="mt-6 grid gap-5 sm:grid-cols-2 pt-4 border-t border-line">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="name">Name of the piece</label>
            <input id="name" name="name" required className="field" placeholder="Mbanga Silk Gown" />
          </div>
          <div>
            <label className="label" htmlFor="basePrice">Price in FCFA</label>
            <input id="basePrice" name="basePrice" type="number" min={0} required className="field" placeholder="185000" />
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
            <textarea id="description" name="description" rows={2} className="field" placeholder="Floor-length evening gown cut from double silk satin…" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="details">Fabric & fit details</label>
            <textarea id="details" name="details" rows={2} className="field" placeholder="100% Silk satin, bias-cut drape, French seams…" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="careInstructions">Care instructions</label>
            <input id="careInstructions" name="careInstructions" className="field" placeholder="Dry clean only. Cool iron on reverse." />
          </div>
          <div>
            <label className="label" htmlFor="sizes">Sizes (comma separated)</label>
            <input id="sizes" name="sizes" defaultValue="XS, S, M, L" className="field" />
          </div>
          <div>
            <label className="label" htmlFor="colours">Colours (comma separated)</label>
            <input id="colours" name="colours" defaultValue="Obsidian, Ivory" className="field" />
          </div>

          {/* Functional ImageKit Uploader Component */}
          <ProductGalleryUploader name="photos" label="Product Photos & Gallery" />

          <div className="sm:col-span-2 flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input type="checkbox" name="isPublished" defaultChecked className="rounded border-line" /> Visible on live storefront
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input type="checkbox" name="isFeatured" className="rounded border-line" /> Feature on the homepage
            </label>
          </div>
        </ActionForm>
      </details>

      {/* Products Table */}
      <div className="card rounded-2xl overflow-hidden bg-paper border border-line shadow-xs">
        <div className="p-4 border-b border-line bg-canvas/30 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            All Products ({rows.length})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm divide-y divide-line/60">
            <thead>
              <tr className="bg-canvas/20 text-left text-xs uppercase tracking-wider text-muted">
                <th className="py-3 px-4">Photo</th>
                <th className="px-4">Name</th>
                <th className="px-4">Price</th>
                <th className="px-4">Stock</th>
                <th className="px-4">Status</th>
                <th className="px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/40">
              {rows.map((product) => {
                const image = images.find((i) => i.productId === product.id);
                const totalStock = stock.find((s) => s.productId === product.id)?.total ?? 0;
                return (
                  <tr key={product.id} className="hover:bg-canvas/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md border border-line bg-canvas">
                        {image?.url ? (
                          <Image
                            src={image.url}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                            unoptimized={image.url.startsWith("http")}
                          />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 font-medium text-ink">
                      <Link href={`/admin/products/${product.id}`} className="hover:text-accent hover:underline">
                        {product.name}
                      </Link>
                      <span className="block text-xs font-mono text-muted">/{product.slug}</span>
                    </td>
                    <td className="px-4 text-ink font-mono">{formatXAF(product.basePrice)}</td>
                    <td className="px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        totalStock > 0 ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
                      }`}>
                        {totalStock} in stock
                      </span>
                    </td>
                    <td className="px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold ${
                        product.isPublished ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-gray-100 text-gray-600"
                      }`}>
                        {product.isPublished ? "Live" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/admin/products/${product.id}`} className="btn btn-secondary btn-sm !py-1 !px-2.5 text-xs">
                          Edit
                        </Link>
                        <form action={deleteProductAction}>
                          <input type="hidden" name="id" value={product.id} />
                          <button
                            type="submit"
                            className="text-xs text-red-600 hover:text-red-800 hover:underline"
                            onClick={(e) => {
                              if (!confirm(`Are you sure you want to delete ${product.name}?`)) e.preventDefault();
                            }}
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
