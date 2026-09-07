import Image from "next/image";
import Link from "next/link";
import type { ProductCardData } from "@/lib/store";
import { formatXAF } from "@/lib/utils";
import { t, type Locale } from "@/lib/i18n-pages";
import { BuyNowButton } from "@/components/buy-now-button";

/** List-view row (§6.2 grid/list toggle). Server-rendered like the card. */
export function ProductListRow({
  product,
  locale = "en",
}: {
  product: ProductCardData;
  locale?: Locale;
}) {
  return (
    <article className="group flex gap-5 border-b border-line py-5">
      <Link href={`/product/${product.slug}`} className="photo-frame photo-frame-sm relative block h-40 w-32 shrink-0 zoom-parent">
        {product.image ? (
          <Image src={product.image} alt={product.imageAlt || product.name} fill sizes="128px" quality={55} className="object-cover" />
        ) : null}
        {!product.inStock ? (
          <span className="absolute left-2 top-2 bg-paper/95 px-1.5 py-0.5 text-[0.58rem] tracking-[0.14em] uppercase">
            {t(locale, "buy.soldOut")}
          </span>
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-base font-medium leading-snug">{product.name}</h3>
          </Link>
          <p className="mt-1 text-xs text-muted">
            {product.collectionName ?? product.categoryName ?? "OSSZ"}
          </p>
          <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-relaxed text-ink-soft">
            {product.description}
          </p>
          <p className="mt-2 text-xs text-muted">
            {product.sizes.join(" · ")}
            {product.colours.length ? ` — ${product.colours.join(", ")}` : ""}
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="text-sm">{formatXAF(product.basePrice)}</p>
          <div className="w-40">
            <BuyNowButton slug={product.slug} locale={locale} inStock={product.inStock} />
          </div>
        </div>
      </div>
    </article>
  );
}
