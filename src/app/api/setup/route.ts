import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { bootstrap } from "@/lib/bootstrap";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Emergency one-click setup for production.
 *
 * It only does real work when the product table is empty, so it is safe to open
 * more than once. This gives a non-technical owner a simple URL to repair a
 * deployment where build-time seeding did not run.
 */
export async function GET() {
  try {
    let before = 0;
    try {
      const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(products);
      before = Number(n);
    } catch {
      // Tables missing — bootstrap will create them.
      before = 0;
    }

    await bootstrap();

    const [{ n: after }] = await db.select({ n: sql<number>`count(*)` }).from(products);
    return NextResponse.json({ ok: true, before, after: Number(after) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error).slice(0, 300) }, { status: 500 });
  }
}
