import VizagMeetCountdown from "@/shared/components/chapters/vizagMeetCountdown";
import { NEXT_VIZAG_MEET } from "@/shared/data/vizagMeet";

export default function NextMeetBanner() {
  return (
    <section className="bg-deep px-5 py-8 text-deep-foreground sm:px-8 sm:py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-3xl border border-deep-border bg-deep-elevated/70 px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-soft">Next event · Vizag chapter</p>
          <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{NEXT_VIZAG_MEET.title}</h2>
          <p className="mt-2 text-sm text-deep-muted">{NEXT_VIZAG_MEET.day}, {NEXT_VIZAG_MEET.date} · {NEXT_VIZAG_MEET.time}</p>
          <p className="mt-4 max-w-xl text-sm leading-6 text-deep-muted">{NEXT_VIZAG_MEET.description}</p>
        </div>
        <div className="shrink-0 lg:min-w-[360px]">
          <VizagMeetCountdown />
        </div>
      </div>
    </section>
  );
}
