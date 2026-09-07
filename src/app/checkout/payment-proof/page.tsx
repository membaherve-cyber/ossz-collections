import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PaymentProofForm } from "@/components/payment-proof-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Payment Proof — OSSZ Collections" };

const PENDING_ORDER_COOKIE = "ossz_pending_order";

const PAYMENT_INFO: Record<string, { title: string; instructions: string[]; icon: string }> = {
  mobile_money_mtn: {
    title: "MTN Mobile Money",
    instructions: [
      "Dial *126# on your MTN line",
      "Select 'Pay Bill' or 'Send Money'",
      "Enter the amount shown above",
      "Use your order number as reference",
      "You will receive a confirmation SMS",
      "Take a screenshot of the confirmation and upload below",
    ],
    icon: "📱",
  },
  mobile_money_orange: {
    title: "Orange Money",
    instructions: [
      "Dial #150*1# on your Orange line",
      "Select 'Pay' or 'Transfer'",
      "Enter the amount shown above",
      "Use your order number as reference",
      "You will receive a confirmation SMS",
      "Take a screenshot of the confirmation and upload below",
    ],
    icon: "🟠",
  },
  card: {
    title: "Visa / Mastercard",
    instructions: [
      "Complete the card payment on your banking app or website",
      "Ensure the amount matches your order total",
      "Take a screenshot of the transaction confirmation",
      "Upload the screenshot below",
    ],
    icon: "💳",
  },
  cash_on_delivery: {
    title: "Pay on Delivery",
    instructions: [
      "No online payment needed",
      "Pay cash or mobile money when your order is delivered",
      "You can skip uploading proof and confirm directly",
    ],
    icon: "💰",
  },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PaymentProofPage({ searchParams }: Props) {
  const params = await searchParams;
  const method = typeof params.method === "string" ? params.method : "mobile_money_mtn";
  const total = typeof params.total === "string" ? Number(params.total) : 0;
  const orderNumber = typeof params.order === "string" ? params.order : "";

  const cookieStore = await cookies();
  const raw = cookieStore.get(PENDING_ORDER_COOKIE)?.value;
  if (!raw) {
    redirect("/checkout");
  }

  let pending;
  try {
    pending = JSON.parse(raw);
  } catch {
    redirect("/checkout");
  }

  const info = PAYMENT_INFO[method] ?? PAYMENT_INFO.mobile_money_mtn;

  return (
    <div className="wrap py-12 md:py-16 max-w-2xl mx-auto">
      <header className="text-center mb-10">
        <p className="eyebrow">Step 2 of 2</p>
        <h1 className="display mt-2 text-3xl md:text-4xl">Confirm Your Payment</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Complete the payment using {info.title}, then upload a screenshot of your confirmation below.
        </p>
      </header>

      {/* Order Number Banner */}
      {orderNumber && (
        <div className="rounded-lg border-2 border-accent bg-accent-soft/30 p-5 mb-8 text-center">
          <p className="text-sm text-ink-soft mb-1">Your order number</p>
          <p className="text-2xl font-mono font-bold text-ink tracking-wider">{orderNumber}</p>
          <p className="text-xs text-muted mt-2">Use this as your payment reference</p>
        </div>
      )}

      {/* Payment Details Card */}
      <div className="rounded-lg border border-line bg-paper p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{info.icon}</span>
          <div>
            <h2 className="display text-xl">{info.title}</h2>
            <p className="text-sm text-ink-soft">Follow the steps below to complete your payment</p>
          </div>
        </div>

        {/* Amount to pay */}
        <div className="bg-accent-soft/50 rounded-md p-4 mb-5">
          <p className="text-sm text-ink-soft">Amount to pay</p>
          <p className="text-2xl font-semibold text-ink mt-1">
            {total > 0 ? `${total.toLocaleString()} FCFA` : "Calculating..."}
          </p>
          {orderNumber && (
            <p className="text-xs text-muted mt-1">
              Reference: <span className="font-mono font-medium text-ink">{orderNumber}</span>
            </p>
          )}
        </div>

        {/* Instructions */}
        <ol className="space-y-3">
          {info.instructions.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-ink text-paper text-xs flex items-center justify-center font-medium">
                {i + 1}
              </span>
              <span className="text-ink-soft pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Upload Form */}
      <PaymentProofForm
        paymentMethod={method}
        total={total}
        customerName={pending.customerName}
        orderNumber={orderNumber}
        canSkip={method === "cash_on_delivery"}
      />

      {/* Back link */}
      <p className="mt-6 text-center text-sm text-muted">
        <a href="/checkout" className="text-accent link-underline">← Back to checkout</a>
      </p>
    </div>
  );
}
