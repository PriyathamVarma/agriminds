"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { VIZAG_MEET_PHOTOS } from "@/shared/data/vizagMeet";

type Meet = {
  title: string;
  date: string;
  year: number;
  month: number;
  venue: string;
  description: string;
  href: string;
  image: string;
  imageAlt: string;
  rawImage?: boolean;
  meta?: string;
};

const MEETS: Meet[] = [
  {
    title: "AI in Agri: The Future",
    date: "12 September 2026",
    year: 2026,
    month: 9,
    venue: "RTIH, Vizag",
    description: "Highlights from the first Vizag chapter meet on AI in agriculture, smart farming and food-processing startup opportunities.",
    href: "/chapters/vizag/meets/ai-in-agri-future",
    image: VIZAG_MEET_PHOTOS[9].src,
    imageAlt: "Participants at the September Vizag agripreneurship meet",
  },
  {
    title: "Agripreneurship Meet in Vizag",
    date: "10 October 2026",
    year: 2026,
    month: 10,
    venue: "Visakhapatnam",
    description: "Explore the second meet’s sessions on food waste to wealth, agri-startup market readiness and practical entrepreneurship challenges.",
    href: "/chapters/vizag/meets/agripreneurship-meet-2026",
    image: "https://res.cloudinary.com/vot5ad3f/image/upload/f_jpg,q_auto/v1791806648/IMG_6620.heic",
    imageAlt: "Participants at the October Vizag agripreneurship meet",
    rawImage: true,
  },
  {
    title: "3rd Agripreneurship Meet",
    date: "14 November 2026",
    year: 2026,
    month: 11,
    venue: "RTIH, Vizag",
    description: "A third chapter meet on distributed renewable energy and startup pitches from HACKAP winners.",
    href: "/chapters/vizag/meets/agripreneurship-meet-2026-11-14",
    image: "https://res.cloudinary.com/vot5ad3f/image/upload/v1794923614/group-photo.jpg",
    imageAlt: "Participants at the November Vizag agripreneurship meet",
    meta: "34 people attended",
  },
];

const MONTHS = [
  [9, "September"],
  [10, "October"],
  [11, "November"],
] as const;

export default function VizagMeetCard() {
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const years = useMemo(() => [...new Set(MEETS.map((meet) => meet.year))].sort((a, b) => b - a), []);
  const filteredMeets = useMemo(
    () => MEETS.filter((meet) => (year === "all" || meet.year === Number(year)) && (month === "all" || meet.month === Number(month))),
    [month, year],
  );

  return (
    <div>
      <div className="mb-8 rounded-3xl border border-border bg-surface-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Meet archive</p>
            <h3 className="font-display mt-2 text-2xl font-semibold text-foreground-heading">Browse Vizag meets by date</h3>
          </div>
          <p className="text-sm text-foreground-muted" aria-live="polite">Showing {filteredMeets.length} of {MEETS.length} meets</p>
        </div>
        <div className="mt-5 grid gap-4 sm:max-w-xl sm:grid-cols-2">
          <div>
            <label htmlFor="vizag-meet-year" className="text-xs font-semibold text-foreground-muted">Year</label>
            <select id="vizag-meet-year" value={year} onChange={(event) => setYear(event.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground-heading outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
              <option value="all">All years</option>
              {years.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="vizag-meet-month" className="text-xs font-semibold text-foreground-muted">Month</label>
            <select id="vizag-meet-month" value={month} onChange={(event) => setMonth(event.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground-heading outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
              <option value="all">All months</option>
              {MONTHS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {filteredMeets.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredMeets.map((meet) => (
            <article key={meet.href} className="overflow-hidden rounded-3xl border border-border bg-surface-card">
              <div className="relative aspect-[16/9]">
                {meet.rawImage ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Cloudinary performs the HEIC-to-JPEG conversion
                  <img src={meet.image} alt={meet.imageAlt} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <Image src={meet.image} alt={meet.imageAlt} fill sizes="(max-width: 1024px) 100vw, 50vw" unoptimized className="object-cover" />
                )}
              </div>
              <div className="p-6 sm:p-8">
                <p className="text-xs font-semibold tracking-widest text-primary uppercase">Vizag chapter · Meet recap</p>
                <h4 className="font-display mt-3 text-2xl font-semibold text-foreground-heading">{meet.title}</h4>
                <p className="mt-2 text-sm text-foreground-muted">{meet.date} · {meet.venue}{meet.meta ? ` · ${meet.meta}` : ""}</p>
                <p className="mt-4 text-foreground-body">{meet.description}</p>
                <Link href={meet.href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Read the meet recap <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border bg-surface-card px-6 py-12 text-center">
          <p className="font-display text-2xl font-semibold text-foreground-heading">No meets found</p>
          <p className="mt-2 text-sm text-foreground-muted">Try a different year or month.</p>
        </div>
      )}
    </div>
  );
}
