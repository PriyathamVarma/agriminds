"use client";

import { useRef } from "react";
import { useScroll } from "framer-motion";
import { cx } from "@/shared/lib/utils";
import SectionHeading from "./sectionHeading";
import FadeIn from "./fadeIn";
import ParallaxImage from "./parallaxImage";
import IndiaMapBackground from "@/shared/components/three/indiaMapBackground";

const LEGEND = [
  { color: "bg-accent", label: "Vizag — Founding Chapter" },
  { color: "bg-[#e0a05a]", label: "Phase 1 States" },
  { color: "bg-[#7fa38a]", label: "Phase 2 States" },
  { color: "bg-[#a8b8ac]", label: "Wider Network" },
];

export default function ChapterModelSection({
  imageSrc,
  points,
}: {
  imageSrc: string;
  points: string[];
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: mapRef, offset: ["start end", "end start"] });

  return (
    <section id="chapter-model" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-20">
        <FadeIn className="relative">
          <ParallaxImage
            src={imageSrc}
            alt="Two people shaking hands in a wheat field"
            className="blob-2 aspect-4/5 w-full"
            strength={30}
          />
          <div className="absolute -right-2 -bottom-6 rounded-2xl border border-border bg-surface-card px-6 py-5 shadow-xl sm:-right-6">
            <div className="font-display text-3xl font-semibold text-primary">Vizag</div>
            <div className="mt-1 max-w-[11rem] text-xs font-medium text-foreground-muted">
              Founding Chapter — the blueprint for every city after
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <SectionHeading
            eyebrow="The Chapter Model"
            title="City by City Expansion"
            description="Each City = One Chapter. Every chapter operates as an independent unit with a shared playbook, feeding into the Agriminds Ecosystem Foundation's decade-long, state-by-state expansion."
          />
          <ol className="mt-10 space-y-7 border-l-2 border-border pl-9">
            {points.map((point, i) => (
              <li key={point} className="relative">
                <span className="font-display absolute top-0 -left-[2.95rem] flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-foreground-body sm:text-base">{point}</p>
              </li>
            ))}
          </ol>
        </FadeIn>
      </div>

      <FadeIn className="mt-20 sm:mt-28">
        <SectionHeading
          eyebrow="Geographic Expansion"
          title="From Vizag to a National Network"
          description="A real map of India's states — scroll to watch AgriMinds expand outward from the founding chapter, and hover any state to see its name."
          align="center"
        />
        <div
          ref={mapRef}
          className="relative mx-auto mt-10 aspect-[9/10] w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-surface-card sm:mt-14"
        >
          <IndiaMapBackground progress={scrollYProgress} className="absolute inset-0" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 bg-gradient-to-t from-surface-card via-surface-card/90 to-transparent px-5 pt-12 pb-5">
            {LEGEND.map((item) => (
              <span key={item.label} className="flex items-center gap-1.5 text-xs font-medium text-foreground-muted">
                <span className={cx("h-2 w-2 flex-none rounded-full", item.color)} />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
