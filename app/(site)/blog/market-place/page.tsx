import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin, Play, ShoppingBag, Users, Store } from "lucide-react";
import { SITE } from "@/shared/data/agriminds";
import MarketPlaceGallery from "@/shared/components/blog/marketPlaceGallery";
import Breadcrumbs from "@/shared/components/seo/breadcrumbs";
import { JsonLd, articleJsonLd } from "@/shared/components/seo/jsonLd";
import RelatedContent from "@/shared/components/seo/relatedContent";

export const metadata: Metadata = {
  title: `Market Place — ${SITE.name}`,
  description: "A look back at AgriMinds’ October 2026 marketplace in Vizag, where 23 agri-focused enterprises met more than 1,500 customers.",
  alternates: { canonical: "/blog/market-place" },
};

const STATS = [
  { value: "1,500+", label: "people attended", icon: Users },
  { value: "23", label: "participating enterprises", icon: Store },
  { value: "2 days", label: "of discovery and connection", icon: CalendarDays },
];

export default function MarketPlacePage() {
  return (
    <article>
      <section className="mx-auto max-w-6xl px-5 pt-24 pb-12 sm:px-8 sm:pt-32">
        <JsonLd data={articleJsonLd({ headline: "Market Place: good food, stronger communities", description: "A look back at AgriMinds’ October 2026 marketplace in Vizag, where 23 agri-focused enterprises met more than 1,500 customers.", image: "https://agriminds.in/brand/market-place-event.jpeg", datePublished: "2026-10-04", url: "https://agriminds.in/blog/market-place" })} />
        <Breadcrumbs items={[{ name: "Blog", href: "/blog" }, { name: "Market Place" }]} />
        <Link href="/blog" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Back to Blog</Link>
        <p className="mb-4 text-sm text-foreground-muted">Published 4 October 2026 · AgriMinds Ecosystem Foundation · Vizag</p>
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Event story · Visakhapatnam</p>
            <h1 className="font-display mt-4 max-w-3xl text-4xl leading-tight font-semibold tracking-tight text-foreground-heading sm:text-6xl">Market Place: good food, stronger communities</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground-body">On 2 and 3 October 2026, AgriMinds brought FPOs, farmers, and agri-focused enterprises together with customers for a lively, curated marketplace in Vizag.</p>
          </div>
          <div className="rounded-3xl bg-deep p-6 text-deep-foreground sm:p-8">
            <div className="flex items-start gap-4"><CalendarDays className="mt-1 h-5 w-5 text-accent" /><div><p className="font-semibold">2–3 October 2026</p><p className="mt-1 text-sm text-deep-muted">1:00 PM – 8:00 PM</p></div></div>
            <div className="mt-6 flex items-start gap-4"><MapPin className="mt-1 h-5 w-5 text-accent" /><div><p className="font-semibold">The Deck, RTIH</p><p className="mt-1 text-sm text-deep-muted">5th Floor, RTIH, VMRDA · Siripuram, Vizag</p></div></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface-card shadow-[0_20px_60px_rgba(20,32,26,0.1)]">
          <Image src="/brand/market-place-event.jpeg" alt="Market Place event poster featuring AgriMinds and participating partners" width={853} height={1280} className="mx-auto max-h-[720px] w-full object-cover object-top sm:w-3/4 lg:w-1/2" priority />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-3">
          {STATS.map(({ value, label, icon: Icon }) => <div key={label} className="rounded-2xl border border-border bg-surface-card p-6"><Icon className="h-5 w-5 text-accent" /><p className="font-display mt-5 text-3xl font-semibold text-foreground-heading">{value}</p><p className="mt-1 text-sm text-foreground-muted">{label}</p></div>)}
        </div>
        <div className="mx-auto mt-16 max-w-3xl space-y-6 text-lg leading-relaxed text-foreground-body">
          <p>Market Place was created as a direct bridge between the people growing and making food and the people looking to discover it. Across the two-day event, visitors could meet the makers, taste and shop from their stalls, and support enterprises rooted in local communities.</p>
          <p>The 23 participating enterprises showcased a wide range of products, from spices and millet products to oils, pickles, snacks, grocery staples, natural wellness products, and rural handicrafts. Each purchase helped make the work of farmer groups, FPOs, and emerging food startups more visible and more accessible.</p>
          <div className="rounded-3xl border border-accent/30 bg-accent-soft p-7 text-base text-accent-foreground"><ShoppingBag className="h-6 w-6 text-accent" /><p className="mt-4 font-display text-2xl font-semibold">Discover. Taste. Connect. Make an impact.</p><p className="mt-3 leading-relaxed">That was the spirit of Market Place—and the reason more than 1,500 people came together to support a stronger, more connected agri-food ecosystem.</p></div>
        </div>
      </section>

      <MarketPlaceGallery />

      <RelatedContent items={[{ eyebrow: "Chapter", title: "Explore the Vizag chapter", href: "/chapters/vizag", description: "Meet the founding chapter and follow its local ecosystem work." }, { eyebrow: "Story", title: "Our Launch Event", href: "/blog/launch-event", description: "See where the AgriMinds movement began in Vizag." }, { eyebrow: "Video", title: "Watch AgriMinds videos", href: "/videos", description: "Watch event coverage and stories from the community." }]} />

      <section className="bg-deep">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div><p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Watch the event</p><h2 className="font-display mt-3 text-2xl font-semibold text-deep-foreground sm:text-3xl">See Market Place in action</h2></div>
          <Link href="/videos" className="inline-flex items-center gap-3 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover"><Play className="h-4 w-4 fill-current" /> Watch the video</Link>
        </div>
      </section>
    </article>
  );
}
