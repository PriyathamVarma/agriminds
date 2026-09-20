import Link from "next/link";
import VizagMeetCountdown from "@/shared/components/chapters/vizagMeetCountdown";
import { NEXT_VIZAG_MEET } from "@/shared/data/vizagMeet";
import { VIZAG_MEET_RSVP_URL } from "@/shared/data/links";

export default function NextMeetBanner() {
  return (
    <section className="bg-deep px-5 py-8 text-deep-foreground sm:px-8 sm:py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-3xl border border-deep-border bg-deep-elevated/70 px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Next event · Vizag chapter</p>
          <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{NEXT_VIZAG_MEET.title}</h2>
          <p className="mt-2 text-sm text-deep-muted">{NEXT_VIZAG_MEET.day}, {NEXT_VIZAG_MEET.date} · {NEXT_VIZAG_MEET.time}</p>
          <details className="mt-4 max-w-xl text-sm text-deep-muted">
            <summary className="cursor-pointer font-semibold text-deep-foreground transition hover:text-accent">View event details</summary>
            <p className="mt-3 leading-6">{NEXT_VIZAG_MEET.description}</p>
            <p className="mt-2 leading-6">{NEXT_VIZAG_MEET.venue} · {NEXT_VIZAG_MEET.address}</p>
            <Link href={VIZAG_MEET_RSVP_URL} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex font-semibold text-accent hover:text-accent-hover">RSVP on Luma →</Link>
          </details>
        </div>
        <div className="shrink-0 lg:min-w-[360px]">
          <VizagMeetCountdown />
        </div>
      </div>
    </section>
  );
}
