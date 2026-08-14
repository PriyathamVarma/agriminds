"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { cx } from "@/shared/lib/utils";
import type { IRoadmapPhase } from "@/shared/data/agriminds";
import FadeIn from "./fadeIn";
import GrowthSpineBackground from "@/shared/components/three/growthSpineBackground";

const STATUS_LABEL: Record<IRoadmapPhase["status"], string> = {
  done: "Complete",
  active: "In Progress",
  upcoming: "Upcoming",
};

const STATUS_STYLES: Record<IRoadmapPhase["status"], string> = {
  done: "bg-status-success-surface text-status-success",
  active: "bg-accent-soft text-accent-hover",
  upcoming: "bg-surface text-foreground-muted",
};

function RoadmapCard({ phase }: { phase: IRoadmapPhase }) {
  return (
    <div className="rounded-3xl border border-border bg-surface-card p-7 sm:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-display text-sm font-semibold text-foreground-muted">{phase.phase}</span>
        <span className={cx("rounded-full px-3 py-1 text-xs font-semibold", STATUS_STYLES[phase.status])}>
          {STATUS_LABEL[phase.status]} · {phase.timeline}
        </span>
      </div>
      <h3 className="font-display mt-3 text-2xl font-semibold text-foreground-heading">{phase.milestone}</h3>
      <ul className="mt-5 space-y-2.5">
        {phase.activities.map((activity) => (
          <li key={activity} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground-body">
            <span className="mt-2 h-1 w-1 flex-none rounded-full bg-accent" />
            {activity}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A phase's dot on the growth spine — scales up, glows, and briefly blooms when scroll progress reaches it. */
function RoadmapNode({ progress, threshold }: { progress: MotionValue<number>; threshold: number }) {
  const rawScale = useTransform(progress, [Math.max(0, threshold - 0.08), threshold], [1, 1.45]);
  const scale = useSpring(rawScale, { stiffness: 260, damping: 22 });
  const glowOpacity = useTransform(progress, [Math.max(0, threshold - 0.06), threshold], [0, 0.55]);

  const [burst, setBurst] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    return progress.on("change", (v) => {
      if (v >= threshold && !firedRef.current) {
        firedRef.current = true;
        setBurst(true);
        const timeout = setTimeout(() => setBurst(false), 700);
        return () => clearTimeout(timeout);
      }
      if (v < threshold - 0.08) {
        firedRef.current = false;
      }
    });
  }, [progress, threshold]);

  return (
    <span className="absolute top-8 left-1/2 hidden -translate-x-1/2 lg:block">
      <motion.span
        aria-hidden
        className="absolute inset-0 -m-2 rounded-full bg-accent blur-md"
        style={{ opacity: glowOpacity }}
      />
      {burst && <span className="pointer-events-none absolute inset-0 -m-3 animate-ping rounded-full bg-accent/50" />}
      <motion.span
        className="relative block h-3.5 w-3.5 rounded-full border-4 border-surface bg-accent"
        style={{ scale }}
      />
    </span>
  );
}

export default function RoadmapTimeline({ phases }: { phases: IRoadmapPhase[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <div ref={ref} className="relative mt-16">
      <GrowthSpineBackground
        progress={scrollYProgress}
        className="absolute top-0 left-1/2 hidden h-full w-16 -translate-x-1/2 lg:block"
      />
      <div className="space-y-8 lg:space-y-4">
        {phases.map((phase, i) => {
          const leftSide = i % 2 === 0;
          const threshold = phases.length > 1 ? i / (phases.length - 1) : 0;
          return (
            <div key={phase.phase} className="relative lg:grid lg:grid-cols-2 lg:gap-16">
              <RoadmapNode progress={scrollYProgress} threshold={threshold} />
              <FadeIn delay={i * 0.08} className={leftSide ? "lg:col-start-1 lg:py-8" : "lg:col-start-2 lg:py-8"}>
                <RoadmapCard phase={phase} />
              </FadeIn>
            </div>
          );
        })}
      </div>
    </div>
  );
}
