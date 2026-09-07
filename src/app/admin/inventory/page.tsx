import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { productVariants, products } from "@/db/schema";
import { updateStockAction } from "@/lib/admin-actions";
import { formatXAF } from "@/lib/utils";

import { guardPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  await guardPage("orders");
  const rows = await db
    .select({ variant: productVariants, product: products })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .orderBy(asc(products.name), asc(productVariants.id));

  const low = rows.filter((r) => r.variant.stockQty <= r.variant.lowStockThreshold);

  return (
    <div>
      <h1 className="display text-3xl">Stock counts</h1>
      <p className="mt-2 text-sm text-ink-soft">
        One count per size and colour, adjusted by hand. {low.length} line{low.length === 1 ? "" : "s"} need attention.
      </p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-[0.12em] text-muted">
              <th className="py-3">Piece</th><th>Size</th><th>Colour</th><th>SKU</th><th>Price</th><th>In stock</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ variant, product }) => {
              const isLow = variant.stockQty <= variant.lowStockThreshold;
              return (
                <tr key={variant.id} className={`border-b border-line/60 ${isLow ? "bg-amber-50/60" : ""}`}>
                  <td className="py-2">{product.name}</td>
                  <td>{variant.size}</td>
                  <td>{variant.colour}</td>
                  <td className="text-xs text-muted">{variant.sku}</td>
                  <td>{formatXAF(variant.priceOverride ?? product.basePrice)}</td>
                  <td>
                    <form action={updateStockAction} className="flex items-center gap-2">
                      <input type="hidden" name="variantId" value={variant.id} />
                      <input
                        name="stockQty"
                        type="number"
                        min={0}
                        defaultValue={variant.stockQty}
                        className="field w-20 px-2 py-1 text-sm"
                        aria-label={`Stock for ${product.name} ${variant.size} ${variant.colour}`}
                      />
                      <button className="btn btn-ghost btn-sm">Save</button>
                      {isLow ? <span className="text-xs text-amber-700">low</span> : null}
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
