import type { ProductCardData } from "@/lib/store";
import { getLocale } from "@/lib/locale-server";
import { ProductCard } from "@/components/product-card";
import { ProductListRow } from "@/components/product-list-row";

/**
 * Server wrapper so every grid gets locale, payment settings and sign-in state
 * without each page repeating the lookups. All three helpers are request-cached.
 */
export async function ProductGrid({
  products,
  columns = "lg:grid-cols-4",
  priorityCount = 0,
  view = "grid",
}: {
  products: ProductCardData[];
  columns?: string;
  priorityCount?: number;
  view?: "grid" | "list";
}) {
  const locale = await getLocale();

  if (view === "list") {
    return (
      <div className="border-t border-line">
        {products.map((product) => (
          <ProductListRow key={product.id} product={product} locale={locale} />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 gap-x-5 gap-y-10 ${columns}`}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < priorityCount}
          locale={locale}
        />
      ))}
    </div>
  );
}
