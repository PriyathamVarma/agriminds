import Image from "next/image";
import {
  CHAPTER_MODEL_POINTS,
  FLAGSHIP_PROGRAMS,
  IMAGES,
  JOIN_ROLES,
  NORTH_STAR,
  PILLARS,
  REVENUE_STREAMS,
  ROADMAP_PHASES,
  SUCCESS_METRICS,
} from "@/shared/data/agriminds";
import SectionHeading from "@/shared/components/molecules/sectionHeading";
import FadeIn from "@/shared/components/molecules/fadeIn";
import CounterStat from "@/shared/components/molecules/counterStat";
import ParallaxImage from "@/shared/components/molecules/parallaxImage";
import JoinForm from "@/shared/components/molecules/joinForm";
import RoadmapTimeline from "@/shared/components/molecules/roadmapTimeline";
import ChapterModelSection from "@/shared/components/molecules/chapterModelSection";
import HeroSection from "@/shared/components/hero/heroSection";
import HeroStatsStrip from "@/shared/components/hero/heroStatsStrip";
import ImpactParticleFieldBackground from "@/shared/components/three/impactParticleFieldBackground";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <HeroSection />
      <HeroStatsStrip />

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
              alt="A farmer plowing his field with two oxen under a dramatic storm-lit sky"
              className="blob aspect-4/5 w-full"
              imgClassName="object-bottom"
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

      {/* Pillars — image paired with the pillar grid */}
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
          <div className="mt-14 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch lg:gap-12">
            <FadeIn className="relative aspect-[4/5] overflow-hidden rounded-3xl lg:aspect-auto">
              <Image
                src="/brand/images/The_6_Pillars.webp"
                alt="A farmer checking market updates on his phone while walking through a cotton field, bamboo pole over his shoulder"
                fill
                loading="lazy"
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
                style={{ objectPosition: "38% 35%" }}
              />
            </FadeIn>
            <div className="grid gap-5 sm:grid-cols-2">
              {PILLARS.map((pillar, i) => {
                const Icon = pillar.icon;
                return (
                  <FadeIn key={pillar.title} delay={i * 0.04}>
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
                alt="A line of farmers planting rice seedlings across a paddy field, mountains in the distance"
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
