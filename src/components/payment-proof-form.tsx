"use client";

import { useRef, useState, useActionState } from "react";
import { finalizeOrderAction, type ActionState } from "@/lib/payment-actions";
import { formatXAF } from "@/lib/utils";

const initial: ActionState = { ok: false, message: "" };

export function PaymentProofForm({
  paymentMethod,
  total,
  customerName,
  orderNumber,
  canSkip,
}: {
  paymentMethod: string;
  total: number;
  customerName: string;
  orderNumber: string;
  canSkip: boolean;
}) {
  const [state, action, pending] = useActionState(finalizeOrderAction, initial);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview locally
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-payment-proof", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setProofUrl(data.url);
      } else {
        setUploadError(data.error || "Upload failed. Please try again.");
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-lg border border-line bg-paper p-6">
      <h2 className="display text-xl mb-2">Upload Proof of Payment</h2>
      <p className="text-sm text-ink-soft mb-6">
        {canSkip
          ? "You can skip this step and pay on delivery."
          : "Upload a screenshot of your payment confirmation so we can verify your order."}
      </p>

      <form action={action}>
        <input type="hidden" name="proofUrl" value={proofUrl} />

        {/* Upload area */}
        <div className="mb-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${preview ? "border-accent bg-accent-soft/20" : "border-line hover:border-ink/40 hover:bg-accent-soft/10"}
              ${uploading ? "opacity-60 pointer-events-none" : ""}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />

            {preview ? (
              <div className="space-y-3">
                <img
                  src={preview}
                  alt="Payment proof preview"
                  className="max-h-64 mx-auto rounded-md object-contain"
                />
                <p className="text-sm text-ink-soft">
                  ✓ Screenshot attached — click to change
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-4xl mb-2">📸</div>
                <p className="text-sm font-medium text-ink">
                  Click to upload a screenshot
                </p>
                <p className="text-xs text-muted">
                  JPG, PNG, or WebP — max 5 MB
                </p>
              </div>
            )}

            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-paper/80 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-ink-soft">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Uploading...
                </div>
              </div>
            )}
          </div>

          {uploadError && (
            <p className="mt-2 text-xs text-red-600">{uploadError}</p>
          )}
        </div>

        {/* Summary reminder */}
        <div className="bg-accent-soft/30 rounded-md p-4 mb-6 text-sm">
          <p className="text-ink-soft">
            <span className="font-medium text-ink">{customerName}</span>
            {orderNumber && (
              <> — Order <span className="font-mono font-medium text-ink">{orderNumber}</span></>
            )}
          </p>
          <p className="text-ink-soft mt-1">
            Total: <span className="font-semibold">{formatXAF(total)}</span>
          </p>
        </div>

        {/* Submit buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {canSkip ? (
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={pending}
            >
              {pending ? "Confirming..." : "Confirm Without Proof"}
            </button>
          ) : null}
          <button
            type="submit"
            className={`btn flex-1 ${canSkip ? "btn-outline" : "btn-primary"}`}
            disabled={pending || (!proofUrl && !canSkip)}
          >
            {pending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Placing your order...
              </span>
            ) : (
              "✓ Place Order"
            )}
          </button>
        </div>

        {!canSkip && !proofUrl && (
          <p className="mt-3 text-xs text-muted text-center">
            Please upload your payment screenshot before confirming.
          </p>
        )}

        {state.message && !state.ok && (
          <p className="mt-3 text-xs text-red-600 text-center">{state.message}</p>
        )}
      </form>
    </div>
  );
}
