import Link from "next/link";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { wishlists } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { listProducts } from "@/lib/store";
import { ProductGrid } from "@/components/product-grid";
import { EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const rows = await db
    .select({ productId: wishlists.productId })
    .from(wishlists)
    .where(eq(wishlists.userId, user.id));
  const saved = await listProducts({ ids: rows.map((r) => r.productId) });

  return (
    <div>
      <h1 className="display text-3xl">Wishlist</h1>
      {saved.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Nothing saved yet"
            body="Tap the heart on any piece to keep it here — we will tell you if it is running low."
            action={<Link href="/shop" className="btn btn-primary mt-2">Find something you love</Link>}
          />
        </div>
      ) : (
        <div className="mt-8">
          <ProductGrid products={saved} columns="lg:grid-cols-3" />
        </div>
      )}
    </div>
  );
}
