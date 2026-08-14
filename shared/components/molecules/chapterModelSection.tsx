"use client";

import { useRef } from "react";
import { useScroll } from "framer-motion";
import SectionHeading from "./sectionHeading";
import FadeIn from "./fadeIn";
import ParallaxImage from "./parallaxImage";
import IndiaExpansionBackground from "@/shared/components/three/indiaExpansionBackground";

export default function ChapterModelSection({
  imageSrc,
  points,
}: {
  imageSrc: string;
  points: string[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <section id="chapter-model" ref={ref} className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <IndiaExpansionBackground
        progress={scrollYProgress}
        className="pointer-events-none absolute inset-0 opacity-70 sm:opacity-80"
      />
      <div className="relative grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-20">
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
    </section>
  );
}
