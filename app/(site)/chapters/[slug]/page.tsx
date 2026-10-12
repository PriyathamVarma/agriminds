import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, BadgeCheck, ArrowRight } from "lucide-react";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { Chapter } from "@/shared/models/chapter";
import { ChapterMembership } from "@/shared/models/chapterMembership";
import { ChapterUpdate } from "@/shared/models/chapterUpdate";
import { ImpactReport } from "@/shared/models/impactReport";
import VizagMeetCard from "@/shared/components/chapters/vizagMeetCard";
import { SITE } from "@/shared/data/agriminds";
import { VIZAG_MEET_PHOTOS } from "@/shared/data/vizagMeet";
import { VIZAG_WHATSAPP_GROUP_URL } from "@/shared/data/links";
import Breadcrumbs from "@/shared/components/seo/breadcrumbs";
import RelatedContent from "@/shared/components/seo/relatedContent";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  await connectToDatabase();
  const chapter = await Chapter.findOne({ slug, status: "active", isPublic: true }).lean();
  if (!chapter) return { title: `Chapter — ${SITE.name}` };
  const location = [chapter.city, chapter.district, chapter.state].filter(Boolean).join(", ");
  return { title: `${chapter.name} | Agriculture Entrepreneurship Network | ${SITE.name}`, description: chapter.description || `Connect with the ${chapter.name} chapter of the AgriMinds Ecosystem Foundation${location ? ` in ${location}` : ""}. Meet farmers, FPOs, founders, mentors, and institutions building stronger agri-enterprises.`, alternates: { canonical: `/chapters/${slug}` }, openGraph: { title: `${chapter.name} | ${SITE.name}`, description: chapter.description || `The ${chapter.name} chapter of the AgriMinds Ecosystem Foundation.` } };
}

export default async function PublicChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectToDatabase();

  // Only an approved AND explicitly public chapter is ever shown here — a pending or
  // not-yet-public chapter 404s exactly as if it didn't exist.
  const chapter = await Chapter.findOne({ slug, status: "active", isPublic: true }).lean();
  if (!chapter) notFound();

  const [team, updates, impactReports] = await Promise.all([
    ChapterMembership.find({ chapterId: chapter._id, isPublic: true, status: "active" }).sort({ displayOrder: 1 }).lean(),
    ChapterUpdate.find({ chapterId: chapter._id, status: "published", visibility: "public" }).sort({ date: -1 }).limit(9).lean(),
    ImpactReport.find({ chapterId: chapter._id }).lean(),
  ]);

  const impactTotals = impactReports.reduce(
    (acc, r) => {
      acc.eventsConducted += r.metrics?.eventsConducted || 0;
      acc.farmersReached += r.metrics?.farmersReached || 0;
      acc.startupsSupported += r.metrics?.startupsSupported || 0;
      acc.fpoSupported += r.metrics?.fpoSupported || 0;
      return acc;
    },
    { eventsConducted: 0, farmersReached: 0, startupsSupported: 0, fpoSupported: 0 },
  );

  const gallery = updates.flatMap((u) => u.images).slice(0, 8);
  const isVizag = [chapter.slug, chapter.city].some((value) => /^(vizag|visakhapatnam)(-chapter)?$/i.test(value || ""));
  const displayImpact = isVizag
    ? { eventsConducted: 2, farmersReached: 21, startupsSupported: 5, fpoSupported: 2 }
    : impactTotals;

  return (
    <div className="bg-background">
      <section className="bg-deep py-20 text-deep-foreground sm:py-28">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <Breadcrumbs items={[{ name: "Chapters", href: "/chapters" }, { name: chapter.name }]} />
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-accent uppercase">
            <BadgeCheck className="h-4 w-4" />
            Verified AgriMinds chapter
          </div>
          <h1 className="font-display mt-3 text-4xl font-semibold sm:text-5xl">{chapter.name}</h1>
          <p className="mt-3 flex items-center gap-1.5 text-deep-foreground/80">
            <MapPin className="h-4 w-4" />
            {chapter.city ? `${chapter.city}, ` : ""}
            {chapter.state}
          </p>
          {chapter.description ? <p className="mt-6 max-w-2xl text-deep-foreground/85">{chapter.description}</p> : null}
          <a
            href={isVizag ? VIZAG_WHATSAPP_GROUP_URL : "/dashboard"}
            target={isVizag ? "_blank" : undefined}
            rel={isVizag ? "noopener noreferrer" : undefined}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover"
          >
            Apply to Join This Chapter
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {isVizag ? (
        <section className="mx-auto max-w-5xl px-5 pt-8 sm:px-8 sm:pt-12">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-surface">
            <Image
              src={VIZAG_MEET_PHOTOS[9].src}
              width={VIZAG_MEET_PHOTOS[9].width}
              height={VIZAG_MEET_PHOTOS[9].height}
              alt="AgriMinds Vizag chapter members gathered at a chapter meet"
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="h-full w-full object-cover"
            />
          </div>
        </section>
      ) : null}

      {isVizag ? (
        <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="overflow-hidden rounded-3xl border border-border bg-surface-card">
            <div className="border-b border-border bg-primary px-6 py-6 text-primary-foreground sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-soft">Previous meet · Vizag chapter</p>
              <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Vizag Agripreneurship Meet</h2>
              <p className="mt-3 text-sm text-primary-foreground/80">10 October 2026 · Visakhapatnam</p>
            </div>
            <div className="grid gap-8 p-6 sm:grid-cols-[0.9fr_1.1fr] sm:p-8">
              <div>
                <p className="text-sm leading-7 text-foreground-body">AgriMinds Ecosystem Foundation brought together farmers, founders, students and ecosystem enablers to explore food waste to wealth, agri-startup market readiness and practical entrepreneurship challenges.</p>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Where</p>
                <p className="mt-3 font-semibold text-foreground-heading">RTIH, Vizag</p>
                <p className="mt-1 text-sm leading-6 text-foreground-muted">5th Floor, VRMDA – The Deck, Siripuram, Vizag</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">What the meet covered</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {["AgriMinds Ecosystem", "Food Waste to Wealth", "Market Readiness of Agri Startups", "Practical Entrepreneurship Challenges"].map((theme, index) => <div key={theme} className="rounded-2xl bg-surface px-4 py-4"><p className="text-xs font-bold text-primary">0{index + 1}</p><p className="mt-2 text-sm font-semibold leading-5 text-foreground-heading">{theme}</p></div>)}
                </div>
              </div>
            </div>
            <div className="border-t border-border px-6 py-5 sm:px-8">
              <Link href="/chapters/vizag/meets/agripreneurship-meet-2026" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover">Read the full meet recap <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </section>
      ) : null}

      {isVizag ? (
        <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Chapter highlights</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground-heading sm:text-4xl">Previous Meets</h2>
          <div className="mt-8"><VizagMeetCard /></div>
        </section>
      ) : null}

      {chapter.mission ? (
        <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
          <h2 className="font-display text-2xl font-semibold text-foreground-heading">Local Mission</h2>
          <p className="mt-3 max-w-3xl text-foreground-body">{chapter.mission}</p>
        </section>
      ) : null}

      <section className="bg-surface py-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <h2 className="font-display text-2xl font-semibold text-foreground-heading">Impact So Far</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Meets conducted", value: displayImpact.eventsConducted },
              { label: "Farmers reached", value: displayImpact.farmersReached },
              { label: "Startups supported", value: displayImpact.startupsSupported },
              { label: "FPOs supported", value: displayImpact.fpoSupported },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-surface-card p-5 text-center">
                <p className="font-display text-3xl font-semibold text-primary">{stat.value}</p>
                <p className="mt-1 text-xs text-foreground-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {team.length > 0 ? (
        <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
          <h2 className="font-display text-2xl font-semibold text-foreground-heading">Leadership & Team</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m) => (
              <div key={String(m._id)} className="rounded-2xl border border-border bg-surface-card p-5">
                <p className="text-sm font-semibold text-foreground-heading">{m.name || "Team member"}</p>
                <p className="text-xs text-foreground-muted">{m.designation}</p>
                {m.bio ? <p className="mt-2 text-sm text-foreground-body">{m.bio}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {updates.length > 0 ? (
        <section className="bg-surface py-16">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <h2 className="font-display text-2xl font-semibold text-foreground-heading">Updates & Achievements</h2>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {updates.map((u) => (
                <div key={String(u._id)} className="rounded-2xl border border-border bg-surface-card p-5">
                  <p className="text-xs font-semibold tracking-wide text-accent uppercase">{u.type.replace(/_/g, " ")}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground-heading">{u.title}</p>
                  <p className="mt-1 text-xs text-foreground-muted">{new Date(u.date).toLocaleDateString()}</p>
                  {u.description ? <p className="mt-2 line-clamp-3 text-sm text-foreground-body">{u.description}</p> : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {gallery.length > 0 ? (
        <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
          <h2 className="font-display text-2xl font-semibold text-foreground-heading">Gallery</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {gallery.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary external URLs from chapter-managed content, not a known optimizer host
              <img key={src} src={src} alt="" className="aspect-square w-full rounded-xl object-cover" />
            ))}
          </div>
        </section>
      ) : null}

      <RelatedContent items={[{ eyebrow: "Network", title: "Explore all chapters", href: "/chapters", description: "Find other AgriMinds chapters and upcoming local networks." }, { eyebrow: "Stories", title: "Read the AgriMinds blog", href: "/blog", description: "Follow events, milestones, and enterprise stories from the community." }, { eyebrow: "Videos", title: "Watch AgriMinds", href: "/videos", description: "See the people and events building the ecosystem." }]} />

    </div>
  );
}
