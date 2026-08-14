import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cx } from "@/shared/lib/utils";
import {
  CHAPTER_MODEL_POINTS,
  FLAGSHIP_PROGRAMS,
  IMAGES,
  JOIN_ROLES,
  NORTH_STAR,
  PILLARS,
  REVENUE_STREAMS,
  ROADMAP_PHASES,
  SITE,
  STATS,
  SUCCESS_METRICS,
} from "@/shared/data/agriminds";
import SectionHeading from "@/shared/components/molecules/sectionHeading";
import FadeIn from "@/shared/components/molecules/fadeIn";
import CounterStat from "@/shared/components/molecules/counterStat";
import ParallaxImage from "@/shared/components/molecules/parallaxImage";
import JoinForm from "@/shared/components/molecules/joinForm";
import RoadmapTimeline from "@/shared/components/molecules/roadmapTimeline";
import ChapterModelSection from "@/shared/components/molecules/chapterModelSection";
import HeroCropFieldLayer from "@/shared/components/three/heroCropFieldLayer";
import PillarParticleFieldBackground from "@/shared/components/three/pillarParticleFieldBackground";
import ImpactParticleFieldBackground from "@/shared/components/three/impactParticleFieldBackground";

const PILLAR_SPANS = [
  "lg:col-span-2 lg:row-span-2",
  "lg:col-span-2 lg:row-span-1",
  "lg:col-span-1 lg:row-span-1",
  "lg:col-span-1 lg:row-span-1",
  "lg:col-span-2 lg:row-span-1",
  "lg:col-span-2 lg:row-span-1",
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate min-h-[100svh] bg-deep text-deep-foreground">
        <HeroCropFieldLayer
          src={`${IMAGES.hero}?auto=format&fit=crop&w=2400&q=80`}
          alt="Golden wheat field at sunset"
        />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-5 pt-28 pb-24 sm:px-8">
          <div className="animate-fade-up flex items-center gap-3 text-xs font-semibold tracking-[0.22em] text-deep-foreground/80 uppercase">
            <span className="h-px w-8 bg-accent" />
            Agriminds Ecosystem Foundation · Founded in Vizag, 2026
          </div>
          <h1 className="font-display animate-fade-up animate-delay-1 mt-7 max-w-4xl text-5xl leading-[1.05] font-semibold sm:text-6xl lg:text-[5.25rem]">
            From Farm to <span className="text-accent italic">Enterprise</span>
          </h1>
          <p className="animate-fade-up animate-delay-2 mt-7 max-w-xl text-lg leading-relaxed text-deep-foreground/85">
            {SITE.description} Part of a 2026–2036 strategy to build 100,000 profitable
            enterprises and improve the lives of one million farming families.
          </p>
          <div className="animate-fade-up animate-delay-3 mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="#join"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover"
            >
              Join the Movement
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#pillars"
              className="inline-flex items-center justify-center rounded-full border border-deep-foreground/30 px-7 py-3.5 text-sm font-semibold text-deep-foreground backdrop-blur-sm transition hover:border-deep-foreground/60 hover:bg-deep-foreground/5"
            >
              Explore the Pillars
            </a>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-32 z-10 hidden justify-center sm:flex">
          <div className="flex flex-col items-center gap-2 text-deep-foreground/60">
            <span className="text-[10px] font-semibold tracking-[0.22em] uppercase">Scroll</span>
            <span className="h-9 w-px bg-gradient-to-b from-deep-foreground/60 to-transparent" />
          </div>
        </div>

        {/* Floating stats — overlaps the hero/next-section seam */}
        <div className="absolute inset-x-5 bottom-0 z-20 translate-y-1/2 sm:inset-x-8">
          <div className="mx-auto max-w-5xl rounded-3xl border border-border bg-surface-card/95 px-6 py-7 shadow-2xl backdrop-blur sm:px-10 sm:py-8">
            <div className="grid grid-cols-2 divide-x divide-border sm:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="px-3 text-center first:pl-0 last:pr-0 sm:px-6">
                  <CounterStat
                    value={stat.value}
                    className="font-display block text-3xl font-semibold text-primary sm:text-4xl"
                  />
                  <div className="mt-1.5 text-xs font-semibold text-foreground-heading sm:text-sm">
                    {stat.label}
                  </div>
                  <div className="mt-1 hidden text-xs text-foreground-muted sm:block">
                    {stat.sublabel}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pillar marquee */}
      <div className="overflow-hidden border-b border-border bg-surface pt-24 pb-5 sm:pt-28">
        <div className="animate-marquee scrollbar-hide flex w-max gap-10">
          {[...PILLARS, ...PILLARS].map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <span
                key={`${pillar.title}-${i}`}
                className="flex items-center gap-3 text-sm font-medium whitespace-nowrap text-foreground-muted"
              >
                <Icon className="h-4 w-4 text-primary" />
                {pillar.title}
                <span className="mx-2 h-1 w-1 rounded-full bg-border" />
              </span>
            );
          })}
        </div>
      </div>

      {/* Vision & Mission */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
          <FadeIn>
            <ParallaxImage
              src={IMAGES.mission}
              alt="Rows of young crop seedlings emerging from dark soil"
              className="blob aspect-4/5 w-full"
              strength={30}
            />
          </FadeIn>
          <FadeIn delay={0.1}>
            <SectionHeading eyebrow="Why We Exist" title="Vision & Mission" />
            <p className="font-display mt-5 max-w-md text-xl leading-snug text-accent italic">
              &ldquo;{NORTH_STAR}&rdquo;
            </p>
            <div className="mt-9 space-y-9">
              <div className="border-l-2 border-accent pl-6">
                <h3 className="font-display text-xl font-semibold text-foreground-heading">
                  Our Vision
                </h3>
                <p className="mt-2 leading-relaxed text-foreground-body">
                  To build India&apos;s most trusted agri-food entrepreneurship ecosystem,
                  creating 100,000 profitable enterprises and improving the livelihoods of one
                  million farming families.
                </p>
              </div>
              <div className="border-l-2 border-primary pl-6">
                <h3 className="font-display text-xl font-semibold text-foreground-heading">
                  Our Mission
                </h3>
                <p className="mt-2 leading-relaxed text-foreground-body">
                  We help farmers become entrepreneurs and FPOs become sustainable businesses by
                  connecting them with knowledge, technology, finance, markets, and partnerships.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Pillars — bento grid */}
      <section id="pillars" className="bg-surface py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <FadeIn>
            <SectionHeading
              eyebrow="What We Do"
              title="The 6 Pillars of AgriMinds"
              description="Every chapter runs the same six pillars, adapted to its local agri ecosystem."
              align="center"
            />
          </FadeIn>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:auto-rows-[172px] lg:grid-cols-4">
            {PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              if (i === 0) {
                return (
                  <FadeIn key={pillar.title} className={cx("group", PILLAR_SPANS[0])}>
                    <div className="relative h-full min-h-[280px] overflow-hidden rounded-3xl">
                      <Image
                        src={`${IMAGES.pillarFeatured}?auto=format&fit=crop&w=1200&q=75`}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                      <PillarParticleFieldBackground className="absolute inset-0 mix-blend-screen opacity-80" />
                      <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/55 to-transparent" />
                      <div className="relative z-10 flex h-full flex-col justify-end p-7 sm:p-8">
                        <span className="blob mb-4 flex h-11 w-11 items-center justify-center bg-accent text-accent-foreground">
                          <Icon className="h-5 w-5" />
                        </span>
                        <h3 className="font-display text-2xl font-semibold text-deep-foreground">
                          {pillar.title}
                        </h3>
                        <p className="mt-2 max-w-sm text-sm leading-relaxed text-deep-foreground/80">
                          {pillar.description}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                );
              }
              return (
                <FadeIn key={pillar.title} delay={i * 0.04} className={PILLAR_SPANS[i]}>
                  <div className="group flex h-full flex-col justify-center rounded-3xl border border-border bg-surface-card p-6 transition hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg sm:p-7">
                    <span className="blob flex h-10 w-10 items-center justify-center bg-primary-soft text-primary transition group-hover:bg-accent-soft group-hover:text-accent">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-foreground-heading">
                      {pillar.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground-muted">
                      {pillar.description}
                    </p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Flagship Programmes */}
      <section id="programmes" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <FadeIn>
          <SectionHeading
            eyebrow="Flagship Programmes"
            title="Seven Programmes, One Ecosystem"
            description="Each flagship programme targets a specific stage or segment of the agri-entrepreneurship journey — all feeding into the same national deal flow."
            align="center"
          />
        </FadeIn>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FLAGSHIP_PROGRAMS.map((program, i) => {
            const Icon = program.icon;
            return (
              <FadeIn key={program.title} delay={i * 0.05}>
                <div className="group h-full rounded-3xl border border-border bg-surface-card p-7 transition hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg">
                  <span className="blob flex h-11 w-11 items-center justify-center bg-primary-soft text-primary transition group-hover:bg-accent-soft group-hover:text-accent">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-foreground-heading">
                    {program.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                    {program.description}
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      <ChapterModelSection imageSrc={IMAGES.chapterModel} points={CHAPTER_MODEL_POINTS} />

      {/* Roadmap — alternating timeline */}
      <section id="roadmap" className="bg-surface py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <FadeIn>
            <SectionHeading
              eyebrow="Looking Ahead"
              title="2026–2036 Roadmap"
              description="From proving the model in Vizag to a nationwide network of 100,000 thriving enterprises."
              align="center"
            />
          </FadeIn>

          <RoadmapTimeline phases={ROADMAP_PHASES} />
        </div>
      </section>

      {/* Impact — success metrics */}
      <section id="impact" className="bg-grain relative overflow-hidden bg-deep py-24 text-deep-foreground sm:py-32">
        <div
          aria-hidden
          className="blob pointer-events-none absolute -top-20 -left-32 h-96 w-96 bg-primary/40 blur-3xl"
        />
        <div
          aria-hidden
          className="blob-2 pointer-events-none absolute -right-24 -bottom-20 h-80 w-80 bg-accent/25 blur-3xl"
        />
        <ImpactParticleFieldBackground className="pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <FadeIn>
            <SectionHeading
              eyebrow="Accountability"
              title="What Success Looks Like"
              description="The targets the Agriminds Ecosystem Foundation is building toward by 2036."
              tone="dark"
            />
          </FadeIn>
          <div className="mt-16 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {SUCCESS_METRICS.map((row, i) => (
              <FadeIn key={row.metric} delay={i * 0.05} className="border-t border-deep-border pt-6">
                <CounterStat
                  value={row.target}
                  className="font-display block text-4xl font-semibold text-accent sm:text-5xl"
                />
                <p className="mt-3 text-sm font-medium text-deep-foreground/80">{row.metric}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue & Sustainability */}
      <section className="mx-auto max-w-5xl px-5 py-24 sm:px-8 sm:py-32">
        <FadeIn>
          <SectionHeading
            eyebrow="Sustainability"
            title="Revenue & Sustainability Model"
            description="AgriMinds is built to shift from grant-funded to earned-revenue sustainability as it scales — not to depend on any single funding source."
          />
        </FadeIn>
        <div className="mt-14 divide-y divide-border border-t border-border">
          {REVENUE_STREAMS.map((stream, i) => {
            const Icon = stream.icon;
            return (
              <FadeIn key={stream.title} delay={i * 0.04}>
                <div className="group flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:gap-8">
                  <span className="font-display text-sm text-foreground-muted sm:w-10">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="blob flex h-12 w-12 flex-none items-center justify-center bg-primary-soft text-primary transition group-hover:bg-accent-soft group-hover:text-accent">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground-heading">{stream.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-foreground-muted">
                      {stream.description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* Join the Movement */}
      <section id="join" className="bg-surface py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
            <FadeIn>
              <SectionHeading
                eyebrow="Get Involved"
                title="Join the AgriMinds Movement"
                description="Whether you are an aspiring agripreneur, an agri startup, a corporate partner, an investor, or a city wanting its own chapter — AgriMinds is where the future of Indian agriculture is being built."
              />
              <div className="mt-9 flex flex-wrap gap-2.5">
                {JOIN_ROLES.map((role) => (
                  <span
                    key={role.title}
                    className="cursor-default rounded-full border border-border bg-surface-card px-4 py-2 text-sm font-medium text-foreground-heading transition hover:border-accent hover:text-accent"
                  >
                    {role.title}
                  </span>
                ))}
              </div>
              <ParallaxImage
                src={IMAGES.join}
                alt="Fresh vegetables at a farmers market"
                className="blob mt-10 hidden aspect-16/10 w-full lg:block"
                strength={20}
                priority
              />
            </FadeIn>

            <FadeIn delay={0.1}>
              <JoinForm />
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
