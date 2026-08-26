"use client";

import { useState, type TransitionEvent } from "react";
import { LAUNCH_PHASE_TITLES, type LaunchPhase } from "./launchTimeline";

/**
 * The pillar-scene title, overlaid above the /launch canvas. Purely a function of the
 * `phase` prop from <LaunchScene />'s own timeline (no independent timer) — when `phase`
 * changes, any currently-shown title fades out first, then the new one (if any) fades in
 * once that fade-out finishes, so the two never overlap and there's never an instant swap.
 *
 * Uses React's "adjust state during render" pattern (comparing `phase` to `prevPhase`)
 * rather than an effect, since this only reacts to a prop change — see
 * https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes.
 */
export default function LaunchTitleOverlay({ phase }: { phase: LaunchPhase }) {
  const [prevPhase, setPrevPhase] = useState(phase);
  const [shownPhase, setShownPhase] = useState<LaunchPhase>(phase);
  const [visible, setVisible] = useState(() => Boolean(LAUNCH_PHASE_TITLES[phase]));

  if (phase !== prevPhase) {
    setPrevPhase(phase);
    if (visible) {
      // Something is on screen right now — fade it out; handleTransitionEnd does the swap.
      setVisible(false);
    } else {
      // Nothing on screen — swap straight away and fade the new title in from there.
      setShownPhase(phase);
      setVisible(Boolean(LAUNCH_PHASE_TITLES[phase]));
    }
  }

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "opacity" || visible || phase === shownPhase) return;
    setShownPhase(phase);
    setVisible(Boolean(LAUNCH_PHASE_TITLES[phase]));
  };

  const config = LAUNCH_PHASE_TITLES[shownPhase];

  return (
    <div
      aria-hidden={!config}
      className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center px-6 pt-[max(1.75rem,env(safe-area-inset-top))] sm:pt-[max(2.5rem,env(safe-area-inset-top))]"
    >
      <div
        onTransitionEnd={handleTransitionEnd}
        className="relative max-w-[min(88vw,42rem)] text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-10px)",
          filter: visible ? "blur(0px)" : "blur(6px)",
          transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1), filter 0.6s ease",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-12 -inset-y-8 -z-10"
          style={{ background: "radial-gradient(60% 100% at 50% 0%, rgba(4,10,10,0.5) 0%, rgba(4,10,10,0) 72%)" }}
        />
        {config && (
          <>
            <p
              className="font-display font-semibold text-deep-foreground uppercase"
              style={{
                fontSize: "clamp(1.05rem, 0.7rem + 1.6vw, 1.9rem)",
                letterSpacing: "0.13em",
                textShadow: "0 2px 22px rgba(4,10,10,0.85), 0 1px 3px rgba(4,10,10,0.9)",
              }}
            >
              {config.title}
            </p>
            <span className="mx-auto mt-3 mb-2 block h-px w-10 bg-accent/80" />
            <p
              className="mx-auto max-w-[34ch] text-deep-foreground/85"
              style={{
                fontSize: "clamp(0.78rem, 0.68rem + 0.4vw, 0.98rem)",
                textShadow: "0 2px 14px rgba(4,10,10,0.85)",
              }}
            >
              {config.subtitle}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
