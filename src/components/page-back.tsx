import { getLocale } from "@/lib/locale-server";
import { BackButton } from "@/components/back-button";

/**
 * Renders the back control in a consistent place beneath the header. Hidden on
 * the homepage and inside the back office, both of which have their own
 * navigation and no meaningful "previous page".
 */
export async function PageBack() {
  const locale = await getLocale();
  return (
    <div className="wrap pt-5 print:hidden">
      <BackButton locale={locale} />
    </div>
  );
}
