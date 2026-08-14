"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useScroll } from "framer-motion";
import { cx } from "@/shared/lib/utils";
import { createHeroScene } from "./heroCanvas";

/**
 * The site's hero: a 230vh scroll-stage with a sticky, scroll-driven Canvas 2D
 * landscape that zooms from a wide "meadow" view into a closer "ecosystem" view as
 * the visitor scrolls, cross-fading between two headline moments along the way.
 * Scroll progress comes from Framer Motion (the project's existing scroll
 * infrastructure) rather than a bespoke scroll listener; the canvas itself mutates
 * the cross-fade/rail DOM directly inside its own rAF loop for perf, matching how
 * every other scroll-driven scene in this codebase is built.
 */
export default function HeroSection() {
  const scrollStageRef = useRef<HTMLDivElement>(null);
  const heroElRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scene1Ref = useRef<HTMLDivElement>(null);
  const scene2Ref = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const railDot0Ref = useRef<HTMLButtonElement>(null);
  const railDot1Ref = useRef<HTMLButtonElement>(null);
  const [canvasSupported, setCanvasSupported] = useState(true);

  const { scrollYProgress } = useScroll({ target: scrollStageRef, offset: ["start start", "end end"] });

  useEffect(() => {
    const canvas = canvasRef.current;
    const heroEl = heroElRef.current;
    const scene1 = scene1Ref.current;
    const scene2 = scene2Ref.current;
    const scrollIndicator = scrollIndicatorRef.current;
    const railDot0 = railDot0Ref.current;
    const railDot1 = railDot1Ref.current;
    if (!canvas || !heroEl || !scene1 || !scene2 || !scrollIndicator || !railDot0 || !railDot1) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = createHeroScene(
      { canvas, heroEl, scene1El: scene1, scene2El: scene2, scrollIndicatorEl: scrollIndicator, railDot0, railDot1 },
      () => scrollYProgress.get(),
      reduceMotion,
    );
    if (!scene.supported) setCanvasSupported(false);

    return () => scene.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function scrollToScene(i: 0 | 1) {
    const stage = scrollStageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    const targetProgress = i === 0 ? 0.03 : 0.97;
    const targetY = window.scrollY + rect.top + targetProgress * scrollable;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: targetY, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <div ref={scrollStageRef} className="relative h-[230vh]">
      <section ref={heroElRef} className="sticky top-0 h-[100svh] min-h-[640px] w-full overflow-hidden bg-deep">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block opacity-0 transition-opacity duration-[1200ms] ease-out data-[ready=true]:opacity-100"
          aria-hidden="true"
        />
        {!canvasSupported && (
          <div className="absolute inset-0 z-[2] flex items-center justify-center p-5 text-center text-sm text-deep-foreground/70">
            Canvas 2D isn&apos;t available in this browser — try a recent Chrome, Firefox, Safari, or Edge.
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(6,14,15,.92) 0%, rgba(6,14,15,.74) 26%, rgba(6,14,15,.38) 48%, rgba(6,14,15,.08) 68%, rgba(6,14,15,.2) 100%)," +
              "linear-gradient(180deg, rgba(4,10,11,.4) 0%, rgba(4,10,11,0) 22%, rgba(4,10,11,0) 66%, rgba(4,10,11,.46) 100%)",
          }}
        />

        {/* Scene 1 — From Farm to Enterprise */}
        <div className="absolute inset-0 z-[4] flex items-center px-5 pt-16 sm:px-8 sm:pt-0 lg:px-[90px]">
          <div ref={scene1Ref} className="max-w-[88vw] will-change-[opacity,transform] sm:max-w-[640px] lg:max-w-[760px]">
            <p className="animate-fade-up flex items-center gap-3.5 text-xs font-semibold tracking-[0.14em] text-deep-foreground/90 uppercase [text-shadow:0_1px_10px_rgba(4,10,10,.75)]">
              <span className="h-px w-8 flex-none bg-accent" />
              AgriMinds Ecosystem Foundation · Founded in Vizag, 2026
            </p>
            <h1 className="font-display animate-fade-up animate-delay-1 mt-6 text-5xl leading-[1.02] font-semibold text-deep-foreground [text-shadow:0_4px_24px_rgba(4,10,10,.65),0_1px_4px_rgba(4,10,10,.85)] sm:text-6xl lg:text-[5.25rem]">
              From Farm to <em className="text-accent italic">Enterprise</em>
            </h1>
            <p className="animate-fade-up animate-delay-2 mt-6 max-w-xl text-base leading-relaxed text-deep-foreground/85 [text-shadow:0_2px_14px_rgba(4,10,10,.55)] sm:text-lg">
              Nurturing Indian agriculture&apos;s next generation of entrepreneurs — from a single Vizag chapter to a
              nationwide network built by the AgriMinds Ecosystem Foundation. Part of a 2026–2036 strategy to build
              100,000 profitable enterprises and improve the lives of one million farming families.
            </p>
            <div className="animate-fade-up animate-delay-3 mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#join"
                className="inline-flex items-center gap-2.5 rounded-full bg-accent px-6.5 py-4 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover"
              >
                Join the Movement
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#pillars"
                className="inline-flex items-center gap-2.5 rounded-full border-[1.5px] border-deep-foreground/50 px-6.5 py-4 text-sm font-semibold text-deep-foreground transition hover:border-deep-foreground"
              >
                Explore the Pillars
              </a>
            </div>
          </div>
        </div>

        {/* Scene 2 — One Chapter to a Nationwide Ecosystem */}
        <div className="absolute inset-0 z-[4] flex items-center px-5 pt-16 sm:px-8 sm:pt-0 lg:px-[90px]">
          <div ref={scene2Ref} className="max-w-[88vw] opacity-0 will-change-[opacity,transform] sm:max-w-[640px] lg:max-w-[760px]">
            <p className="flex items-center gap-3.5 text-xs font-semibold tracking-[0.14em] text-deep-foreground/90 uppercase [text-shadow:0_1px_10px_rgba(4,10,10,.75)]">
              <span className="h-px w-8 flex-none bg-accent" />
              The Expanding Network
            </p>
            <h2 className="font-display mt-6 text-4xl leading-[1.02] font-semibold text-deep-foreground [text-shadow:0_4px_24px_rgba(4,10,10,.65),0_1px_4px_rgba(4,10,10,.85)] sm:text-5xl lg:text-[4.4rem]">
              One Chapter to a <em className="text-accent italic">Nationwide Ecosystem</em>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-deep-foreground/85 [text-shadow:0_2px_14px_rgba(4,10,10,.55)] sm:text-lg">
              Solar-powered chapters, connected fields, and the next generation of agri-entrepreneurs — this is what
              the network looks like as it scales from Vizag to every farming region in India.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#chapter-model"
                className="inline-flex items-center gap-2.5 rounded-full bg-accent px-6.5 py-4 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover"
              >
                Explore the Chapter Model
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#roadmap"
                className="inline-flex items-center gap-2.5 rounded-full border-[1.5px] border-deep-foreground/50 px-6.5 py-4 text-sm font-semibold text-deep-foreground transition hover:border-deep-foreground"
              >
                See the Roadmap
              </a>
            </div>
          </div>
        </div>

        <div
          ref={scrollIndicatorRef}
          className="absolute inset-x-0 bottom-28 z-[4] hidden flex-col items-center gap-3.5 text-[11px] font-semibold tracking-[0.2em] text-deep-foreground/65 sm:flex"
        >
          SCROLL
          <span className="h-13 w-px bg-deep-foreground/35" />
        </div>

        {/* Curved progress rail — jump between the meadow and ecosystem scenes */}
        <div className="absolute top-1/2 right-[clamp(60px,7vw,110px)] z-[6] hidden h-[46vh] min-h-[280px] w-[30px] -translate-y-1/2 sm:block">
          <svg viewBox="0 0 30 300" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            <path d="M15 4 C -2 90, 32 210, 15 296" stroke="rgba(244,239,227,.32)" strokeWidth="1" fill="none" />
          </svg>
          <span className="absolute top-[-26px] left-1/2 -translate-x-1/2 text-sm text-deep-foreground/50">↑</span>
          <button
            ref={railDot0Ref}
            type="button"
            onClick={() => scrollToScene(0)}
            aria-label="Meadow scene"
            data-active="true"
            className={cx(
              "absolute left-1/2 h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-[1.3px] border-deep-foreground/60 bg-transparent p-0",
              "transition-[background-color,width,height] duration-300 ease-out",
              "data-[active=true]:h-[11px] data-[active=true]:w-[11px] data-[active=true]:bg-deep-foreground",
            )}
            style={{ top: "6%" }}
          />
          <button
            ref={railDot1Ref}
            type="button"
            onClick={() => scrollToScene(1)}
            aria-label="Ecosystem scene"
            data-active="false"
            className={cx(
              "absolute left-1/2 h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-[1.3px] border-deep-foreground/60 bg-transparent p-0",
              "transition-[background-color,width,height] duration-300 ease-out",
              "data-[active=true]:h-[11px] data-[active=true]:w-[11px] data-[active=true]:bg-deep-foreground",
            )}
            style={{ top: "94%" }}
          />
          <span className="absolute bottom-[-26px] left-1/2 -translate-x-1/2 text-sm text-deep-foreground/50">↓</span>
        </div>
      </section>
    </div>
  );
}
