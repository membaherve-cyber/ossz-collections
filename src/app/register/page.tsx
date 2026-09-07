import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Create an account" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/account";
  return (
    <div className="wrap max-w-md py-20">
      <p className="eyebrow">Join us</p>
      <h1 className="display mt-2 text-4xl">Create an account</h1>
      <p className="mt-3 text-sm text-ink-soft">
        Saved addresses, one-tap repeat checkout, a wishlist and your appointment history.
      </p>
      <div className="mt-8">
        <RegisterForm next={next} />
      </div>
    </div>
  );
}
