import { getSettings } from "@/lib/store";
import { Concierge } from "@/components/concierge";
import { getLocale } from "@/lib/locale-server";
import { waLink } from "@/lib/utils";

export async function ConciergeMount() {
  const [settings, locale] = await Promise.all([getSettings(), getLocale()]);
  const fr = locale === "fr";
  const greeting = fr
    ? "Bonjour ! Je suis le Concierge OSSZ. Comment puis-je vous aider ?"
    : settings.concierge_greeting || "Hello! I am the OSSZ Concierge. How may I help you today?";
  const waMessage = fr
    ? "Bonjour OSSZ Collections, j'aimerais obtenir de l'aide s'il vous plaît."
    : "Hello OSSZ Collections, I would like some assistance please.";
  return (
    <Concierge
      locale={locale}
      greeting={greeting}
      whatsappUrl={waLink(settings.whatsapp_number, waMessage)}
      whatsappNumber={settings.whatsapp_number}
    />
  );
}
