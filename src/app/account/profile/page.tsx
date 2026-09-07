import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "@/components/account-forms";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <div>
      <h1 className="display text-3xl">Profile & security</h1>
      <p className="mt-2 text-sm text-ink-soft">Your details are private and never shared with third parties.</p>
      <div className="mt-8">
        <ProfileForm fullName={user.fullName} phone={user.phone ?? ""} email={user.email} />
      </div>
    </div>
  );
}
