import type { Metadata } from "next";
import Image from "next/image";
import { VIZAG_MEET_PHOTOS } from "@/shared/data/vizagMeet";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "AI in Agri: The Future — Vizag Chapter | AgriMinds",
  description: "Highlights and photos from the Vizag chapter’s agripreneurship meet on 12 September 2026 at RTIH: AI in agriculture and food-processing startup opportunities.",
};
const sessions = [
  {
    title: "AI in Agri: The Future",
    description: "The opening material connected AgriMinds’ vision with the technologies shaping agriculture: AI, IoT, drones, GIS, biotechnology, and robotics. Applications ranged from crop-disease detection and pest identification to smart irrigation, yield prediction, climate-risk forecasting, and automated quality control.",
    takeaway: "Look across the whole farm-to-market journey for problems technology can help solve.",
  },
  {
    title: "From smart farming to intelligent agri-enterprises",
    description: "The AI for Agriculture workshop framed AI around better decisions, using a five-stage loop: sense, understand, predict, act, and learn. It explored advisory services, crop diagnosis, market intelligence, and how FPOs can use data for procurement, quality, logistics, and enterprise planning.",
    takeaway: "A startup exercise in the session material linked one real problem with the data needed, an AI solution, and a paying customer. Farmer judgement, trust, and physical infrastructure remain essential.",
  },
  {
    title: "Food-processing startup opportunities",
    description: "Subhash Kiran Kasarapu’s GAME × AgriMinds presentation explored enterprise opportunities across aggregation, post-harvest handling, cold chains, processing, packaging, branding, market access, exports, food technology, and waste-to-value. Examples included Araku coffee, perishable produce, and women-led processing businesses.",
    takeaway: "Start with a value-chain problem and a customer. Asset-light services and shared infrastructure offer pathways alongside processing facilities.",
  },
  {
    title: "Building the AgriMinds ecosystem",
    description: "The foundation overview brought the sessions back to a shared purpose: helping farmers become entrepreneurs and FPOs become thriving enterprises. It outlined five ways the network supports that journey — Consult, Connect, Curate, Conduct, and Capitalize — through knowledge, technology, finance, markets, and partnerships.",
    takeaway: "Vizag is the founding chapter for a wider network connecting farmers, FPOs, founders, mentors, and institutions.",
  },
];


export default function VizagMeetPage() {
  return (
    <div className="bg-background">
      <section className="bg-deep py-16 text-deep-foreground sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <Link href="/chapters" className="inline-flex items-center gap-2 text-sm text-deep-foreground/80 hover:underline"><ArrowLeft className="h-4 w-4" /> All chapters</Link>
            <p className="mt-10 text-xs font-semibold tracking-widest text-accent uppercase">Vizag chapter · Agripreneurship meet</p>
            <h1 className="font-display mt-4 text-4xl font-semibold leading-tight sm:text-6xl">AI in Agri: The Future</h1>
            <p className="mt-5 text-xl text-deep-foreground/90">From smarter farms to stronger agribusinesses.</p>
            <p className="mt-7 text-sm text-deep-foreground/80"><time dateTime="2026-09-12">12 September 2026</time> · 4–7 PM IST · RTIH, Vizag</p>
            <p className="mt-6 max-w-xl leading-relaxed text-deep-foreground/85">The Vizag chapter’s meet brought AI in agriculture and food entrepreneurship into focus, connecting practical technology applications with opportunities to build stronger agri-food enterprises.</p>
            <a href="#meet-highlights" className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent-hover">Explore the highlights</a>
          </div>
          <a href={VIZAG_MEET_PHOTOS[0].src} target="_blank" rel="noopener noreferrer" aria-label="View the full meet photograph">
            <Image src={VIZAG_MEET_PHOTOS[0].src} width={VIZAG_MEET_PHOTOS[0].width} height={VIZAG_MEET_PHOTOS[0].height} alt="Participants at the second Vizag agripreneurship meet at RTIH" sizes="(max-width: 1024px) 100vw, 480px" className="h-auto w-full rounded-3xl" preload />
          </a>
        </div>
      </section>
      <section id="meet-highlights" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">What the meet covered</p>
        <h2 className="font-display mt-3 text-3xl font-semibold text-foreground-heading">Ideas from the sessions</h2>
        <p className="mt-4 max-w-3xl text-foreground-body">Highlights drawn from the presentations shared for the meet, alongside photographs of participants in discussion.</p>
        <div className="mt-9 grid gap-6 md:grid-cols-2">
          {sessions.map((session, i) => (
            <article key={session.title} className="rounded-3xl border border-border bg-surface-card p-6 sm:p-8">
              <p className="font-display text-3xl text-primary/50">0{i + 1}</p>
              <h3 className="font-display mt-4 text-2xl font-semibold text-foreground-heading">{session.title}</h3>
              <p className="mt-4 leading-relaxed text-foreground-body">{session.description}</p>
              <p className="mt-5 border-t border-border pt-5 text-sm leading-relaxed text-primary">{session.takeaway}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-surface py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="font-display text-3xl font-semibold text-foreground-heading">From an idea to a pilot</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-foreground-body">The food-processing presentation proposed a 90-day discovery pathway: choose one commodity, geography, and pain point; interview stakeholders; map the value chain and unit economics; build a prototype; run a measurable pilot; then decide whether to stop, pivot, replicate, or scale.</p>
          <p className="mt-5 max-w-3xl font-medium text-primary">A question to carry forward: which problem in your farm or business could AI help solve?</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <h2 className="font-display text-3xl font-semibold text-foreground-heading">Moments from the meet</h2>
        <p className="mt-3 text-foreground-body">Conversations and shared learning at the Vizag chapter. Select a photo to view it in full.</p>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
          {VIZAG_MEET_PHOTOS.map((photo, i) => (
            <a key={photo.src} href={photo.src} target="_blank" rel="noopener noreferrer" className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image src={photo.src} alt={`Vizag agripreneurship meet, 12 September 2026 — photo ${i + 1}`} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover transition duration-300 hover:scale-105" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
