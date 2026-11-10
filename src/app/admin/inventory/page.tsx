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
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">Logistics</span>
          <h1 className="display text-3xl font-medium tracking-tight text-ink mt-0.5">Stock Counts</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Manage granular physical inventory quantities by size, variant, and colour SKU.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {low.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs text-amber-800 font-medium">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              {low.length} variant{low.length === 1 ? "" : "s"} below safety threshold
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs text-emerald-800 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              All variant stock healthy
            </span>
          )}
        </div>
      </div>

      <div className="card rounded-2xl border border-line bg-paper shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="bg-canvas/50 border-b border-line/60">
              <tr className="text-muted uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3.5 px-4">Piece</th>
                <th className="py-3.5 px-4">Size</th>
                <th className="py-3.5 px-4">Colour</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Unit Price</th>
                <th className="py-3.5 px-4 text-right">Available Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/40">
              {rows.map(({ variant, product }) => {
                const isLow = variant.stockQty <= variant.lowStockThreshold;
                const isOut = variant.stockQty === 0;
                return (
                  <tr
                    key={variant.id}
                    className={`transition-colors ${
                      isOut
                        ? "bg-red-50/40 hover:bg-red-50/60"
                        : isLow
                          ? "bg-amber-50/40 hover:bg-amber-50/60"
                          : "hover:bg-canvas/40"
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-ink">
                      {product.name}
                    </td>
                    <td className="py-3 px-4 text-ink-soft">{variant.size}</td>
                    <td className="py-3 px-4 text-ink-soft">{variant.colour}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-muted">{variant.sku}</td>
                    <td className="py-3 px-4 font-medium text-ink">
                      {formatXAF(variant.priceOverride ?? product.basePrice)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <form action={updateStockAction} className="inline-flex items-center gap-2 justify-end">
                        <input type="hidden" name="variantId" value={variant.id} />
                        <input
                          name="stockQty"
                          type="number"
                          min={0}
                          defaultValue={variant.stockQty}
                          className="field rounded-lg w-20 px-2 py-1 text-xs text-center font-semibold"
                          aria-label={`Stock for ${product.name} ${variant.size} ${variant.colour}`}
                        />
                        <button className="btn btn-secondary btn-sm rounded-lg px-2.5 py-1 text-xs border-line hover:border-ink">
                          Save
                        </button>
                        {isOut ? (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                            Out
                          </span>
                        ) : isLow ? (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            Low
                          </span>
                        ) : null}
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">
            No variants found in inventory database.
          </div>
        ) : null}
      </div>
    </div>
  );
}
