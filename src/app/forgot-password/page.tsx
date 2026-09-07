import type { Metadata } from "next";
import { RequestResetForm } from "@/components/reset-forms";

export const metadata: Metadata = { title: "Forgotten password" };

export default function ForgotPasswordPage() {
  return (
    <div className="wrap max-w-md py-20">
      <p className="eyebrow">Account</p>
      <h1 className="display mt-2 text-4xl">Forgotten your password?</h1>
      <p className="mt-3 text-sm text-ink-soft">
        Enter the email address on your account and we will send you a link to set a new password.
        The link is valid for one hour.
      </p>
      <div className="mt-8"><RequestResetForm /></div>
    </div>
  );
}
