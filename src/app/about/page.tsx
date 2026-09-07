import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "About the house", description: "OSSZ Collections — a contemporary fashion house rooted in Douala, Cameroon." };

export default async function AboutPage() {
  const settings = await getSettings();
  return (
    <div>
      <section className="relative h-[56vh] min-h-[380px] overflow-hidden bg-clay">
        <Image
          src="https://images.pexels.com/photos/35045844/pexels-photo-35045844.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600"
          alt="Inside the OSSZ boutique in Ange Raphael, Douala"
          fill priority sizes="100vw" quality={65} className="object-cover object-top opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
        <div className="wrap relative flex h-full flex-col justify-end pb-12 text-white">
          <p className="eyebrow text-white/70">Our house</p>
          <h1 className="display mt-2 max-w-2xl text-4xl md:text-5xl">Made in Douala, worn everywhere</h1>
        </div>
      </section>

      <div className="wrap grid gap-12 py-16 md:grid-cols-[1.3fr_1fr]">
        <div className="prose-osz max-w-2xl">
          <p className="text-lg leading-relaxed text-ink">
            OSSZ Collections began with one long table, four tailors, and a conviction that clothes
            made close to home are worth more than clothes made anywhere else.
          </p>
          <p>
            We are a contemporary fashion house rooted in Douala. Our work sits where African design
            sensibility meets the discipline of modern luxury tailoring: restrained palettes, honest
            fabric, and finishing you feel rather than see.
          </p>
          <h2>Small runs, on purpose</h2>
          <p>
            A style is cut in a run of twenty, sometimes thirty. When it is finished, it is finished.
            This keeps our atelier honest and our wardrobe personal — you are unlikely to meet
            yourself at a wedding.
          </p>
          <h2>People before pieces</h2>
          <p>
            Every client is welcome to a fitting. Alterations on OSSZ pieces are complimentary within
            thirty days, and our stylists will happily advise by WhatsApp if you cannot come in.
          </p>
          <h2>Where to find us</h2>
          <p>{settings.store_address}. {settings.business_hours}.</p>
        </div>

        <aside className="space-y-4">
          <div className="card p-6">
            <p className="eyebrow">Visit the atelier</p>
            <p className="mt-2 text-sm text-ink-soft">
              Private styling and fitting appointments, forty minutes, by reservation.
            </p>
            <Link href="/appointments" className="btn btn-primary btn-sm mt-4">Book an appointment</Link>
          </div>
          <div className="card p-6">
            <p className="eyebrow">Questions</p>
            <p className="mt-2 text-sm text-ink-soft">
              Delivery, returns, sizing and payment are answered in full in our FAQ.
            </p>
            <Link href="/faq" className="btn btn-secondary btn-sm mt-4">Read the FAQ</Link>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden bg-accent-soft">
            <Image
              src="https://images.pexels.com/photos/8311882/pexels-photo-8311882.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900"
              alt="Garments on hangers in the OSSZ atelier" fill sizes="33vw" quality={65} className="object-cover object-top"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
