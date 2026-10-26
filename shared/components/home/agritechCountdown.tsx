import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

export default function AgriTechCountdown() {
  return (
    <section className="bg-surface px-5 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-3xl border-2 border-accent/50 bg-background px-5 py-6 shadow-md sm:px-7 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary"><CalendarDays aria-hidden="true" className="h-4 w-4" /> Important Update</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-foreground-heading sm:text-3xl">AgriTech Summit 2026 — Postponed</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-foreground-body">The summit scheduled for 31st October 2026 has been postponed due to severe weather conditions in Vizag. We will publish the revised schedule shortly.</p>
        </div>
        <Link href="/Agritech-summit-2026" className="inline-flex items-center gap-2 font-semibold text-primary transition hover:text-primary-hover">View summit update <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
      </div>
    </section>
  );
}
