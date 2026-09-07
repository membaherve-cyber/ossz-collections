"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeCartLine, updateCartLine } from "@/lib/actions";
import type { CartLine } from "@/lib/store";
import { formatXAF } from "@/lib/utils";

export function CartLines({ lines }: { lines: CartLine[] }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function change(itemId: number, quantity: number) {
    start(async () => {
      await updateCartLine(itemId, quantity);
      router.refresh();
    });
  }

  function remove(itemId: number) {
    start(async () => {
      await removeCartLine(itemId);
      router.refresh();
    });
  }

  return (
    <ul className={`divide-y divide-line border-y border-line ${pending ? "opacity-60" : ""}`}>
      {lines.map((line) => (
        <li key={line.itemId} className="flex gap-4 py-5">
          <Link href={`/product/${line.slug}`} className="relative h-32 w-24 shrink-0 overflow-hidden bg-accent-soft">
            {line.image ? <Image src={line.image} alt={line.name} fill sizes="96px" quality={65} className="object-cover" /> : null}
          </Link>
          <div className="flex flex-1 flex-col justify-between">
            <div className="flex justify-between gap-4">
              <div>
                <Link href={`/product/${line.slug}`} className="text-sm font-medium link-underline">
                  {line.name}
                </Link>
                <p className="mt-1 text-xs text-muted">
                  {line.size} · {line.colour}
                </p>
                {line.quantity > line.stockQty ? (
                  <p className="mt-1 text-xs text-red-600">
                    Only {line.stockQty} remaining — please adjust the quantity.
                  </p>
                ) : null}
              </div>
              <p className="whitespace-nowrap text-sm">{formatXAF(line.unitPrice * line.quantity)}</p>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center border border-line">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  className="px-3 py-1 text-sm"
                  onClick={() => change(line.itemId, line.quantity - 1)}
                >
                  −
                </button>
                <span className="min-w-8 text-center text-sm">{line.quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  className="px-3 py-1 text-sm"
                  onClick={() => change(line.itemId, line.quantity + 1)}
                >
                  +
                </button>
              </div>
              <button type="button" className="text-xs text-muted link-underline" onClick={() => remove(line.itemId)}>
                Remove
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
