import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";
import Breadcrumbs from "@/shared/components/seo/breadcrumbs";
import { JsonLd, eventJsonLd } from "@/shared/components/seo/jsonLd";

export const metadata: Metadata = {
  title: "AgriMinds AgriTech Summit 2026",
  description: "Join the AgriMinds AgriTech Summit 2026 at YVS Murthy Auditorium, Andhra University, Vizag. Connect with innovators, farmers, FPOs, start-ups, investors, and agri-food partners.",
  alternates: { canonical: "/Agritech-summit-2026" },
  openGraph: { title: "AgriMinds AgriTech Summit 2026", description: "A gathering for the future of agriculture, food, and agri-innovation in Vizag.", type: "website", url: "https://agriminds.org/Agritech-summit-2026" },
};

export default function AgriTechSummitPage() {
  return (
    <main className="bg-background">
      <JsonLd data={eventJsonLd({ name: "AgriMinds AgriTech Summit 2026", description: "A two-day summit and hackathon bringing together innovators, farmers, FPOs, start-ups, investors, and agri-food partners in Vizag.", startDate: "2026-10-30", endDate: "2026-10-31", location: "YVS Murthy Auditorium", address: "Andhra University, Visakhapatnam, Andhra Pradesh", url: "https://agriminds.org/Agritech-summit-2026", eventStatus: "https://schema.org/EventScheduled" })} />
      <section className="bg-deep py-20 text-deep-foreground sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Breadcrumbs items={[{ name: "AgriTech Summit 2026" }]} />
          <div className="mt-12 grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">AgriMinds · AgriTech Summit 2026</p>
            <h1 className="font-display mt-6 text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">AgriMinds AgriTech Summit 2026</h1>
            <p className="mt-7 max-w-3xl text-lg leading-relaxed text-deep-foreground/85 sm:text-xl">AgriMinds is bringing together innovators, farmers, FPOs, start-ups, investors, institutions, and agri-food partners to connect ideas with the people and partnerships that can create real impact.</p>
            <div className="mt-9 flex flex-wrap gap-3 text-sm font-semibold"><span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-accent-foreground"><CalendarDays className="h-4 w-4" /> 30–31 October 2026</span><span className="inline-flex items-center gap-2 rounded-full border border-deep-border px-4 py-2 text-deep-foreground/85"><MapPin className="h-4 w-4" /> YVS Murthy Auditorium, Andhra University, Vizag</span></div>
            <a href="https://luma.com/9yvksvpc" target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground transition hover:bg-accent-hover">Register for the Summit <ArrowRight className="h-4 w-4" /></a>
            </div>
            <div className="grid gap-5">
              <Link href="/Agritech-summit-2026/hackathon" className="rounded-3xl border border-deep-border bg-deep-elevated/70 p-6 transition hover:-translate-y-1 hover:border-accent sm:p-7"><p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Day 1 · 30 October</p><h2 className="font-display mt-3 text-3xl font-semibold">Hackathon</h2><p className="mt-3 text-sm leading-relaxed text-deep-muted">Students and start-ups work on practical agricultural challenges across the value chain.</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent">View problem statements <ArrowRight className="h-4 w-4" /></span></Link>
              <a href="https://luma.com/9yvksvpc" target="_blank" rel="noopener noreferrer" className="rounded-3xl border border-accent/60 bg-accent p-6 text-accent-foreground transition hover:-translate-y-1 hover:bg-accent-hover sm:p-7"><p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-foreground/70">Day 2 · 31 October</p><h2 className="font-display mt-3 text-3xl font-semibold">Summit</h2><p className="mt-3 text-sm leading-relaxed text-accent-foreground/80">Connect with farmers, FPOs, innovators, investors, institutions, and agri-food partners.</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">Register on Luma <ArrowRight className="h-4 w-4" /></span></a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid gap-6 md:grid-cols-3">
          <article className="rounded-3xl border border-border bg-surface-card p-7"><CalendarDays className="h-6 w-6 text-accent" /><h2 className="font-display mt-5 text-2xl font-semibold text-foreground-heading">When</h2><p className="mt-3 leading-relaxed text-foreground-body">30 October 2026. Registration details and programme timings will be announced through AgriMinds updates.</p></article>
          <article className="rounded-3xl border border-border bg-surface-card p-7"><MapPin className="h-6 w-6 text-accent" /><h2 className="font-display mt-5 text-2xl font-semibold text-foreground-heading">Where</h2><p className="mt-3 leading-relaxed text-foreground-body">YVS Murthy Auditorium, Andhra University, Visakhapatnam, Andhra Pradesh.</p></article>
          <article className="rounded-3xl border border-border bg-surface-card p-7"><Users className="h-6 w-6 text-accent" /><h2 className="font-display mt-5 text-2xl font-semibold text-foreground-heading">Who should attend</h2><p className="mt-3 leading-relaxed text-foreground-body">Farmers, FPOs, agripreneurs, founders, students, investors, mentors, institutions, and industry partners.</p></article>
        </div>
      </section>

      <section className="bg-surface px-5 py-16 sm:px-8 sm:py-24"><div className="mx-auto max-w-5xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">About the summit</p><h2 className="font-display mt-4 max-w-3xl text-3xl font-semibold text-foreground-heading sm:text-5xl">Connect. Learn. Collaborate. Create impact.</h2><div className="mt-8 max-w-3xl space-y-5 text-lg leading-relaxed text-foreground-body"><p>The AgriMinds AgriTech Summit is a space for the people shaping the future of agriculture and food to meet around practical opportunities, shared challenges, and partnerships.</p><p>The summit will explore how technology, entrepreneurship, finance, markets, institutions, and farmer-led knowledge can work together to create a stronger and more sustainable agri-food ecosystem.</p></div></div></section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24"><div className="rounded-3xl bg-deep p-7 text-deep-foreground sm:p-10"><p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">A separate opportunity to build</p><h2 className="font-display mt-4 max-w-3xl text-3xl font-semibold sm:text-4xl">Want to solve a real agricultural challenge?</h2><p className="mt-5 max-w-2xl leading-relaxed text-deep-foreground/80">The AgriMinds Hackathon has its own problem statements, participation details, and registration form for students and start-ups.</p><Link href="/Agritech-summit-2026/hackathon" className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover">Explore the Hackathon <ArrowRight className="h-4 w-4" /></Link></div></section>

      <section className="bg-background px-5 py-16 sm:px-8"><div className="mx-auto max-w-5xl text-center"><h2 className="font-display text-3xl font-semibold text-foreground-heading">Join the AgriMinds AgriTech Summit</h2><p className="mx-auto mt-4 max-w-2xl leading-relaxed text-foreground-body">Register through Luma to attend the summit at Andhra University, Vizag.</p><a href="https://luma.com/9yvksvpc" target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary-hover">Register on Luma <ArrowRight className="h-4 w-4" /></a></div></section>
    </main>
  );
}
