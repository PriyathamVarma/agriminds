import Image from "next/image";
import { ArrowRight } from "lucide-react";

/**
 * The site's hero: a full-bleed photograph with the headline, supporting copy,
 * and primary CTAs overlaid on a gradient scrim for legibility.
 */
export default function HeroSection() {
  return (
    <section className="relative flex min-h-[100svh] w-full items-center overflow-hidden bg-deep">
      <Image
        src="/brand/images/hero-banner.webp"
        alt="Farmers carrying freshly harvested rice seedlings through a misty paddy field at golden hour"
        fill
        priority
        sizes="100vw"
        className="origin-[12%_50%] scale-[1.4] object-cover"
        style={{ objectPosition: "50% 55%" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(6,14,15,.95) 0%, rgba(6,14,15,.82) 30%, rgba(6,14,15,.5) 55%, rgba(6,14,15,.12) 75%, rgba(6,14,15,.18) 100%)," +
            "linear-gradient(180deg, rgba(4,10,11,.42) 0%, rgba(4,10,11,.02) 22%, rgba(4,10,11,.06) 60%, rgba(4,10,11,.55) 100%)",
        }}
      />

      <div className="relative z-[4] w-full px-5 pt-16 sm:px-8 sm:pt-0 lg:px-[90px]">
        <div className="max-w-[calc(100vw-2.5rem)] sm:max-w-[640px] lg:max-w-[760px]">
          <p className="animate-fade-up flex items-center gap-3.5 text-xs font-semibold tracking-[0.14em] text-deep-foreground/90 uppercase [text-shadow:0_1px_10px_rgba(4,10,10,.75)]">
            <span className="h-px w-8 flex-none bg-accent" />
            AgriMinds Ecosystem Foundation · Founded in Vizag, 2026
          </p>
          <h1 className="font-display animate-fade-up animate-delay-1 mt-6 text-5xl leading-[1.02] font-semibold text-deep-foreground [text-shadow:0_4px_24px_rgba(4,10,10,.65),0_1px_4px_rgba(4,10,10,.85)] sm:text-6xl lg:text-[5.25rem]">
            From Farm to <em className="text-accent italic">Enterprise</em>
          </h1>
          <p className="animate-fade-up animate-delay-2 mt-6 max-w-xl text-base leading-relaxed text-deep-foreground [text-shadow:0_2px_16px_rgba(4,10,10,.9)] sm:text-lg">
            Nurturing Indian agriculture&apos;s next generation of entrepreneurs — from a single Vizag chapter to a
            nationwide network built by the AgriMinds Ecosystem Foundation. Part of a 2026–2036 strategy to build
            100,000 profitable enterprises and improve the lives of one million farming families.
          </p>
          <div className="animate-fade-up animate-delay-3 mt-9 flex flex-wrap items-center gap-4 pb-16 sm:pb-0">
            <a
              href="#join"
              className="inline-flex items-center gap-2.5 rounded-full bg-accent px-6.5 py-4 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover"
            >
              Join the Movement
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#pillars"
              className="inline-flex items-center gap-2.5 rounded-full border-[1.5px] border-deep-foreground/80 bg-deep/30 px-6.5 py-4 text-sm font-semibold text-deep-foreground transition hover:border-deep-foreground hover:bg-deep/45"
            >
              Explore the Pillars
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
