import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { JsonLd, eventJsonLd } from "@/shared/components/seo/jsonLd";
import { VIZAG_NOVEMBER_MEET_PHOTOS } from "@/shared/data/vizagMeet";

const url = "https://agriminds.org/chapters/vizag/meets/agripreneurship-meet-2026-11-14";

export const metadata: Metadata = {
  title: "3rd Agripreneurship Meet in Vizag | AgriMinds",
  description: "Photos and highlights from AgriMinds’ 3rd Agripreneurship Meet at RTIH, Vizag, on distributed renewable energy and startup pitches from HACKAP winners.",
  alternates: { canonical: "/chapters/vizag/meets/agripreneurship-meet-2026-11-14" },
  openGraph: {
    title: "3rd Agripreneurship Meet in Vizag | AgriMinds",
    description: "A Vizag chapter meet on distributed renewable energy and startup pitches from HACKAP winners.",
    url,
    type: "article",
  },
};

export default function ThirdAgripreneurshipMeetPage() {
  return (
    <div className="bg-background">
      <JsonLd data={eventJsonLd({ name: "AgriMinds 3rd Agripreneurship Meet", description: "A Vizag chapter meet on distributed renewable energy and startup pitches from HACKAP winners.", startDate: "2026-11-14T16:00:00+05:30", endDate: "2026-11-14T19:00:00+05:30", location: "RTIH, Vizag", address: "Visakhapatnam, Andhra Pradesh, India", url, image: VIZAG_NOVEMBER_MEET_PHOTOS[0] })} />

      <section className="bg-deep py-16 text-deep-foreground sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Link href="/chapters/vizag" className="inline-flex items-center gap-2 text-sm text-deep-foreground/80 hover:underline"><ArrowLeft className="h-4 w-4" /> Vizag chapter</Link>
          <p className="mt-10 text-xs font-semibold tracking-widest text-accent uppercase">3rd Agripreneurship Meet · Vizag chapter</p>
          <h1 className="font-display mt-4 max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">Building opportunity through renewable energy and new ventures</h1>
          <p className="mt-6 max-w-3xl text-xl leading-relaxed text-deep-foreground/90">The third Vizag chapter meet brought together the AgriMinds ecosystem around distributed renewable energy and startup pitches from HACKAP winners.</p>
          <p className="mt-7 text-sm text-deep-foreground/80"><time dateTime="2026-11-14">14 November 2026</time> · 4–7 PM · RTIH, Vizag · 34 people attended</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-deep-border bg-deep-elevated/70 p-6"><p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Topic 1</p><h2 className="font-display mt-3 text-2xl font-semibold">Opportunity in Distributed Renewable Energy</h2><p className="mt-3 text-sm leading-relaxed text-deep-muted">Exploring practical energy opportunities for communities, farms and enterprises.</p></div>
            <div className="rounded-3xl border border-deep-border bg-deep-elevated/70 p-6"><p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Topic 2</p><h2 className="font-display mt-3 text-2xl font-semibold">Startup Pitches from HACKAP Winners</h2><p className="mt-3 text-sm leading-relaxed text-deep-muted">A platform for emerging founders to share solutions and build connections.</p></div>
          </div>
          <a href="#meet-photos" className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent-hover">View the meet photos <ArrowRight className="h-4 w-4" /></a>
        </div>
      </section>

      <section id="meet-photos" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">Vizag chapter recap</p>
        <h2 className="font-display mt-3 text-3xl font-semibold text-foreground-heading sm:text-5xl">Moments from the 3rd Agripreneurship Meet</h2>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-foreground-body">Photographs from the 14 November 2026 chapter meet at RTIH, Vizag.</p>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {VIZAG_NOVEMBER_MEET_PHOTOS.map((src, index) => (
            <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-surface">
              <Image src={src} alt={`3rd Agripreneurship Meet in Vizag — photo ${index + 1}`} fill sizes="(max-width: 768px) 50vw, 25vw" unoptimized className="object-cover transition duration-300 hover:scale-105" />
            </a>
          ))}
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 px-5 sm:px-8 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">More Vizag chapter meets</p><h2 className="font-display mt-3 text-3xl font-semibold text-foreground-heading">Continue exploring the meet archive</h2></div>
          <Link href="/chapters/vizag/meets/agripreneurship-meet-2026" className="inline-flex items-center gap-2 font-semibold text-primary hover:underline">Read the October recap <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}
