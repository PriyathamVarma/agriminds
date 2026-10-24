import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import tieVizagLogo from "@/Partners/partner-tie-vizag.jpeg";
import andhraUniversityLogo from "@/Partners/partner-andhra-university.jpeg";
import aHubLogo from "@/Partners/partner-a-hub.jpeg";
import alcovePartnersLogo from "@/Partners/partner-alcove-partners.png";
import picxyLogo from "@/Partners/partner-picxy.jpeg";
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";
import Breadcrumbs from "@/shared/components/seo/breadcrumbs";
import { JsonLd, eventJsonLd } from "@/shared/components/seo/jsonLd";

const partnerLogos = [
  { name: "TiE Vizag", id: "tie-vizag", logo: tieVizagLogo },
  { name: "Andhra University", id: "andhra-university", logo: andhraUniversityLogo },
  { name: "ā hub", id: "a-hub", logo: aHubLogo },
  { name: "Alcove Partners", id: "alcove-partners", logo: alcovePartnersLogo },
  { name: "Picxy", id: "picxy", logo: picxyLogo },
];

const summitAgenda = [
  { start: "9:00 AM", end: "9:45 AM", session: "Registration" },
  { start: "9:45 AM", end: "10:15 AM", session: "Inaugural Session" },
  { start: "10:15 AM", end: "10:45 AM", session: "Keynote Address" },
  { start: "10:45 AM", end: "11:00 AM", session: "Innovation Spotlight" },
  { start: "11:00 AM", end: "11:15 AM", session: "Tea Break" },
  { start: "11:15 AM", end: "12:00 PM", session: "Panel 1: AgriTech Reality Check — Hype, Hits & Hard Lessons" },
  { start: "12:00 PM", end: "12:45 PM", session: "Panel 2: Capital Meets the Kisan — Funding the Next AgriTech Revolution" },
  { start: "12:45 PM", end: "1:30 PM", session: "Panel 3: Crowd Sourcing — Solutioning from the Delegates" },
  { start: "1:30 PM", end: "2:30 PM", session: "Lunch" },
  { start: "2:30 PM", end: "4:00 PM", session: "AgriTech Startup Pitch Challenge" },
  { start: "4:15 PM", end: "4:30 PM", session: "Awards" },
  { start: "4:30 PM", end: "4:40 PM", session: "Valedictory & Closing" },
  { start: "4:40 PM", end: "5:00 PM", session: "High Tea" },
];

export const metadata: Metadata = {
  title: "AgriMinds AgriTech Summit 2026",
  description: "Join the AgriMinds AgriTech Summit 2026 in Vizag. Connect with innovators, farmers, FPOs, start-ups, investors, and agri-food partners.",
  alternates: { canonical: "/Agritech-summit-2026" },
  openGraph: { title: "AgriMinds AgriTech Summit 2026", description: "A gathering for the future of agriculture, food, and agri-innovation in Vizag.", type: "website", url: "https://agriminds.org/Agritech-summit-2026" },
};

export default function AgriTechSummitPage() {
  return (
    <main className="bg-background">
      <JsonLd data={eventJsonLd({ name: "AgriMinds AgriTech Summit 2026", description: "A two-day summit and hackathon bringing together innovators, farmers, FPOs, start-ups, investors, and agri-food partners in Vizag.", startDate: "2026-10-30", endDate: "2026-10-31", location: "Vizag", address: "Vizag, Andhra Pradesh", url: "https://agriminds.org/Agritech-summit-2026", eventStatus: "https://schema.org/EventScheduled" })} />
      <section className="bg-deep py-20 text-deep-foreground sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Breadcrumbs items={[{ name: "AgriTech Summit 2026" }]} />
          <div className="mt-12 grid gap-12 lg:grid-cols-[1.5fr_0.75fr] lg:items-center">
            <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">AgriMinds · AgriTech Summit 2026</p>
            <h1 className="font-display mt-6 text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">AgriTech Summit 2026</h1>
            <p className="mt-7 max-w-3xl text-lg leading-relaxed text-deep-foreground/85 sm:text-xl">AgriMinds is bringing together innovators, farmers, FPOs, start-ups, investors, institutions, and agri-food partners to connect ideas with the people and partnerships that can create real impact.</p>
            <div className="mt-9 flex flex-wrap items-center gap-3 text-sm font-semibold">
              <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-accent-foreground"><CalendarDays aria-hidden="true" className="h-4 w-4" /> 30–31 October 2026</span>
              <a href="https://luma.com/9yvksvpc" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-accent-foreground transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">Register for Summit <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
              <a href="https://forms.gle/4f1yDCLHECRFcjpB6" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-sky-700 px-5 py-3 text-white transition hover:bg-sky-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-400">Apply to Pitch <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold">
              <span className="inline-flex items-center gap-2 rounded-full border border-deep-border px-4 py-3 text-deep-foreground/85"><MapPin aria-hidden="true" className="h-4 w-4 shrink-0" /> Vizag</span>
            </div>
            <section aria-labelledby="summit-partners-heading" className="mt-10">
              <h2 id="summit-partners-heading" className="font-display text-xl font-semibold text-deep-foreground">Partners</h2>
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {partnerLogos.map((partner) => (
                  <li key={partner.id} className="min-w-0">
                    <Link
                      href={`/partners#${partner.id}`}
                      aria-label={`Learn about ${partner.name} on our partners page`}
                      className="group relative flex h-20 items-center justify-center rounded-xl bg-white p-3 ring-1 ring-white/10 transition hover:ring-2 hover:ring-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                    >
                      <Image
                        src={partner.logo}
                        alt={`${partner.name} logo`}
                        sizes="(min-width: 1024px) 110px, (min-width: 640px) 16vw, 40vw"
                        className="h-full w-full object-contain"
                      />
                      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-full z-10 pt-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        <span className="flex flex-col items-center rounded-lg bg-deep-elevated px-2 py-2 text-center text-xs leading-snug text-deep-foreground shadow-lg ring-1 ring-deep-border">
                          <span className="font-semibold">{partner.name}</span>
                          <span className="mt-1 inline-flex items-center gap-1 text-accent">View profile <ArrowRight aria-hidden="true" className="h-3 w-3" /></span>
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
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
          <article className="rounded-3xl border border-border bg-surface-card p-7"><CalendarDays className="h-6 w-6 text-accent" /><h2 className="font-display mt-5 text-2xl font-semibold text-foreground-heading">When</h2><p className="mt-3 leading-relaxed text-foreground-body">Hackathon: 30 October 2026. Summit: 31 October 2026, 9:00 AM–5:00 PM IST.</p></article>
          <article className="rounded-3xl border border-border bg-surface-card p-7"><MapPin className="h-6 w-6 text-accent" /><h2 className="font-display mt-5 text-2xl font-semibold text-foreground-heading">Where</h2><p className="mt-3 leading-relaxed text-foreground-body">Vizag.</p></article>
          <article className="rounded-3xl border border-border bg-surface-card p-7"><Users className="h-6 w-6 text-accent" /><h2 className="font-display mt-5 text-2xl font-semibold text-foreground-heading">Who should attend</h2><p className="mt-3 leading-relaxed text-foreground-body">Farmers, FPOs, agripreneurs, founders, students, investors, mentors, institutions, and industry partners.</p></article>
        </div>
      </section>

      <section id="agenda" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-16 sm:px-8 sm:pb-24" aria-labelledby="agenda-heading">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Day 2 · 31 October 2026</p>
        <h2 id="agenda-heading" className="font-display mt-4 text-3xl font-semibold text-foreground-heading sm:text-5xl">Summit agenda</h2>
        <p className="mt-5 max-w-2xl leading-relaxed text-foreground-body">A day of ideas, conversations, and connections shaping the future of agriculture. All times are in Indian Standard Time (IST).</p>
        <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-surface-card">
          <table className="w-full table-fixed text-left text-sm sm:text-base">
            <caption className="sr-only">AgriTech Summit agenda for 31 October 2026. All times in IST.</caption>
            <thead className="bg-deep text-deep-foreground">
              <tr>
                <th scope="col" className="w-20 px-3 py-4 font-semibold sm:w-32 sm:px-6">Start</th>
                <th scope="col" className="w-20 px-3 py-4 font-semibold sm:w-32 sm:px-6">End</th>
                <th scope="col" className="px-3 py-4 font-semibold sm:px-6">Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {summitAgenda.map(({ start, end, session }) => (
                <tr key={start} className="even:bg-surface">
                  <td className="whitespace-nowrap px-3 py-5 align-top text-foreground-body tabular-nums sm:px-6">{start}</td>
                  <td className="whitespace-nowrap px-3 py-5 align-top text-foreground-body tabular-nums sm:px-6">{end}</td>
                  <th scope="row" className="px-3 py-5 align-top font-medium leading-relaxed text-foreground-heading sm:px-6">{session}</th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-surface px-5 py-16 sm:px-8 sm:py-24"><div className="mx-auto max-w-5xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">About the summit</p><h2 className="font-display mt-4 max-w-3xl text-3xl font-semibold text-foreground-heading sm:text-5xl">Connect. Learn. Collaborate. Create impact.</h2><div className="mt-8 max-w-3xl space-y-5 text-lg leading-relaxed text-foreground-body"><p>The AgriMinds AgriTech Summit is a space for the people shaping the future of agriculture and food to meet around practical opportunities, shared challenges, and partnerships.</p><p>The summit will explore how technology, entrepreneurship, finance, markets, institutions, and farmer-led knowledge can work together to create a stronger and more sustainable agri-food ecosystem.</p></div></div></section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24"><div className="rounded-3xl bg-deep p-7 text-deep-foreground sm:p-10"><p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">A separate opportunity to build</p><h2 className="font-display mt-4 max-w-3xl text-3xl font-semibold sm:text-4xl">Want to solve a real agricultural challenge?</h2><p className="mt-5 max-w-2xl leading-relaxed text-deep-foreground/80">The AgriMinds Hackathon has its own problem statements, participation details, and registration form for students and start-ups.</p><Link href="/Agritech-summit-2026/hackathon" className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover">Explore the Hackathon <ArrowRight className="h-4 w-4" /></Link></div></section>

      <section className="bg-background px-5 py-16 sm:px-8"><div className="mx-auto max-w-5xl text-center"><h2 className="font-display text-3xl font-semibold text-foreground-heading">Join the AgriMinds AgriTech Summit</h2><p className="mx-auto mt-4 max-w-2xl leading-relaxed text-foreground-body">Register through Luma to attend the summit in Vizag.</p><a href="https://luma.com/9yvksvpc" target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary-hover">Register on Luma <ArrowRight className="h-4 w-4" /></a></div></section>
    </main>
  );
}
