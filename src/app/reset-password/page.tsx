import type { Metadata } from "next";
import Link from "next/link";
import { CompleteResetForm } from "@/components/reset-forms";

export const metadata: Metadata = { title: "Set a new password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  return (
    <div className="wrap max-w-md py-20">
      <p className="eyebrow">Account</p>
      <h1 className="display mt-2 text-4xl">Set a new password</h1>
      {token ? (
        <>
          <p className="mt-3 text-sm text-ink-soft">Please choose a password of at least 6 characters.</p>
          <div className="mt-8"><CompleteResetForm token={token} /></div>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm text-ink-soft">That link is incomplete or has expired.</p>
          <Link href="/forgot-password" className="btn btn-primary mt-6">Request a new link</Link>
        </>
      )}
    </div>
  );
}
