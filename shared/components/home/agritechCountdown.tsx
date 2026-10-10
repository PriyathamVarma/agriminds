"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";

const EVENT_DATE = "2026-10-30";
const EVENT_TIMESTAMP = new Date("2026-10-30T00:00:00+05:30").getTime();

type Countdown = { days: number; hours: number; minutes: number; seconds: number; finished: boolean };

function getCountdown(): Countdown {
  const difference = Math.max(0, EVENT_TIMESTAMP - Date.now());
  return {
    days: Math.floor(difference / 86400000),
    hours: Math.floor((difference / 3600000) % 24),
    minutes: Math.floor((difference / 60000) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    finished: difference === 0,
  };
}

const initialCountdown: Countdown = { days: 0, hours: 0, minutes: 0, seconds: 0, finished: false };

export default function AgriTechCountdown() {
  const [countdown, setCountdown] = useState(initialCountdown);

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const units = [
    [countdown.days, "Days"],
    [countdown.hours, "Hours"],
    [countdown.minutes, "Minutes"],
    [countdown.seconds, "Seconds"],
  ] as const;

  return (
    <section className="bg-surface px-5 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-3xl border border-border bg-background px-5 py-6 shadow-sm sm:px-7 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-accent"><CalendarDays className="h-4 w-4" /> Upcoming event</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-foreground-heading sm:text-3xl">AgriTech Summit 2026</h2>
          <p className="mt-2 text-sm text-foreground-muted"><time dateTime={EVENT_DATE}>30 October 2026</time> · Vizag</p>
        </div>
        <div className="flex flex-wrap items-center gap-2" aria-live="polite" aria-label="Countdown to AgriTech Summit 2026">
          {countdown.finished ? <p className="font-semibold text-accent">The summit is underway.</p> : units.map(([value, label]) => (
            <div key={label} className="min-w-[64px] rounded-2xl bg-surface px-3 py-2 text-center">
              <p className="font-display text-2xl font-semibold text-foreground-heading">{String(value).padStart(2, "0")}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-foreground-muted">{label}</p>
            </div>
          ))}
        </div>
        <Link href="/Agritech-summit-2026" className="inline-flex items-center gap-2 font-semibold text-primary transition hover:text-primary-hover">View summit &amp; hackathon details <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </section>
  );
}
