import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { categories, collections, productImages, productVariants, products } from "@/db/schema";
import { saveProductAction, updateStockAction } from "@/lib/admin-actions";
import { ActionForm } from "@/components/action-form";
import { guardPage } from "@/lib/guard";
import { ProductGalleryUploader } from "@/components/admin/product-gallery-uploader";

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
    <div className="space-y-10">
      <header className="border-b border-line pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="eyebrow">Catalogue &middot; Edit Piece</p>
            <h1 className="display mt-1 text-3xl">{product.name}</h1>
            <p className="text-xs font-mono text-muted mt-0.5">Slug: /{product.slug}</p>
          </div>
          <Link
            href={`/product/${product.slug}`}
            target="_blank"
            className="btn btn-secondary btn-sm self-start"
          >
            Preview on Live Site &rarr;
          </Link>
        </div>
      </header>

      {/* Product Edit Form */}
      <div className="card rounded-2xl p-6 bg-paper border border-line shadow-xs">
        <h2 className="display text-xl mb-4">Product Details</h2>

        <ActionForm action={saveProductAction} submitLabel="Save changes" className="grid gap-5 sm:grid-cols-2">
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="slug" value={product.slug} />

          <div className="sm:col-span-2">
            <label className="label" htmlFor="name">Name of Piece</label>
            <input id="name" name="name" defaultValue={product.name} required className="field" />
          </div>

          <div>
            <label className="label" htmlFor="basePrice">Price in FCFA</label>
            <input id="basePrice" name="basePrice" type="number" defaultValue={product.basePrice} required className="field" />
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
            <label className="label" htmlFor="seoTitle">Page Title (SEO)</label>
            <input id="seoTitle" name="seoTitle" defaultValue={product.seoTitle} className="field" />
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="description">Short Description</label>
            <textarea id="description" name="description" rows={2} defaultValue={product.description} className="field" />
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="details">Fabric & Fit Details</label>
            <textarea id="details" name="details" rows={2} defaultValue={product.details} className="field" />
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="careInstructions">Care Instructions</label>
            <input id="careInstructions" name="careInstructions" defaultValue={product.careInstructions} className="field" />
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="seoDescription">Social Share Description (SEO)</label>
            <input id="seoDescription" name="seoDescription" defaultValue={product.seoDescription} className="field" />
          </div>

          {/* Product Gallery with direct ImageKit upload */}
          <ProductGalleryUploader
            name="photos"
            label="Product Photos & Gallery"
            initialPhotos={images.map((i) => i.url)}
          />

          <div>
            <label className="label" htmlFor="sizes">Add Additional Sizes</label>
            <input id="sizes" name="sizes" className="field" placeholder="e.g. XL, XXL" />
          </div>

          <div>
            <label className="label" htmlFor="colours">Add Additional Colours</label>
            <input id="colours" name="colours" className="field" placeholder="e.g. Midnight Blue" />
          </div>

          <input type="hidden" name="initialStock" value={0} />

          <div className="sm:col-span-2 flex flex-wrap gap-6 pt-2 border-t border-line">
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input type="checkbox" name="isPublished" defaultChecked={product.isPublished} className="rounded border-line" /> Visible on live storefront
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input type="checkbox" name="isFeatured" defaultChecked={product.isFeatured} className="rounded border-line" /> Feature on the homepage
            </label>
          </div>
        </ActionForm>
      </div>

      {/* Stock Inventory by Variant */}
      <section className="card rounded-2xl p-6 bg-paper border border-line shadow-xs">
        <h2 className="display text-xl mb-1">Stock Counts by Variant</h2>
        <p className="text-xs text-muted mb-4">Update inventory numbers directly per size and color combination.</p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {variants.map((v) => (
            <form key={v.id} action={updateStockAction} className="rounded-xl border border-line bg-canvas/30 flex items-center justify-between p-3.5 text-sm hover:border-accent/40 transition-colors">
              <div>
                <span className="font-medium text-ink block">{v.size} &middot; {v.colour}</span>
                <span className="text-[11px] font-mono text-muted">SKU: {v.sku}</span>
              </div>
              <span className="flex items-center gap-2">
                <input type="hidden" name="variantId" value={v.id} />
                <input
                  name="stockQty"
                  type="number"
                  min={0}
                  defaultValue={v.stockQty}
                  className="field w-20 px-2 py-1 text-center font-mono"
                  aria-label={`Stock ${v.size} ${v.colour}`}
                />
                <button className="btn btn-secondary btn-sm !py-1 !px-2.5 text-xs">Save</button>
              </span>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
