import Link from "next/link";
import type { Metadata } from "next";
import { lookupOrder } from "@/lib/actions";
import { StatusPill } from "@/components/ui";
import { formatXAF, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Track an order" };

export default async function OrderLookupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const number = typeof params.number === "string" ? params.number : "";
  const contact = typeof params.contact === "string" ? params.contact : "";
  const result = number && contact ? await lookupOrder(number, contact) : null;

  return (
    <div className="wrap max-w-2xl py-16">
      <p className="eyebrow">Order tracking</p>
      <h1 className="display mt-2 text-4xl">Where is my order?</h1>
      <p className="mt-3 text-sm text-ink-soft">
        Enter your order number with the email or phone number you used at checkout. No account required.
      </p>

      <form className="card mt-8 space-y-4 p-6" method="get">
        <div>
          <label className="label" htmlFor="number">Order number</label>
          <input id="number" name="number" defaultValue={number} placeholder="OSZ-XXXXXX" className="field" required />
        </div>
        <div>
          <label className="label" htmlFor="contact">Email or phone</label>
          <input id="contact" name="contact" defaultValue={contact} className="field" required />
        </div>
        <button className="btn btn-primary w-full">Find my order</button>
      </form>

      {number && contact && !result ? (
        <p className="mt-6 text-sm text-red-600">
          We could not match those details. Please check them, or ask the concierge for help.
        </p>
      ) : null}

      {result ? (
        <div className="card mt-8 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="display text-2xl">{result.order.orderNumber}</p>
              <p className="text-xs text-muted">Placed {formatDate(result.order.createdAt)}</p>
            </div>
            <StatusPill status={result.order.status} />
          </div>
          <ul className="mt-5 space-y-2 text-sm text-ink-soft">
            {result.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>{item.quantity} × {item.productName} <span className="text-muted">({item.variantLabel})</span></span>
                <span>{formatXAF(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-line pt-3 text-sm">Total {formatXAF(result.order.total)}</p>
          <Link href={`/order/${result.order.orderNumber}`} className="btn btn-secondary btn-sm mt-5">
            Full order details
          </Link>
        </div>
      ) : null}
    </div>
  );
}
