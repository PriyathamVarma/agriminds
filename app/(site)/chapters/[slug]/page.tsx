import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, BadgeCheck, Mail, Phone, ArrowRight, Globe } from "lucide-react";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { Chapter } from "@/shared/models/chapter";
import { ChapterMembership } from "@/shared/models/chapterMembership";
import { ChapterUpdate } from "@/shared/models/chapterUpdate";
import { ImpactReport } from "@/shared/models/impactReport";
import { SITE } from "@/shared/data/agriminds";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  await connectToDatabase();
  const chapter = await Chapter.findOne({ slug, status: "active", isPublic: true }).lean();
  if (!chapter) return { title: `Chapter — ${SITE.name}` };
  return { title: `${chapter.name} — ${SITE.name}`, description: chapter.description || `The ${chapter.name} chapter of the AgriMinds Ecosystem Foundation.` };
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

  return (
    <div className="bg-background">
      <section className="bg-deep py-20 text-deep-foreground sm:py-28">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
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
          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover"
          >
            Apply to Join This Chapter
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

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
              { label: "Events conducted", value: impactTotals.eventsConducted },
              { label: "Farmers reached", value: impactTotals.farmersReached },
              { label: "Startups supported", value: impactTotals.startupsSupported },
              { label: "FPOs supported", value: impactTotals.fpoSupported },
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

      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <h2 className="font-display text-2xl font-semibold text-foreground-heading">Get in touch</h2>
          <div className="mt-5 flex flex-wrap gap-6 text-sm text-foreground-body">
            {chapter.contactEmail ? (
              <a href={`mailto:${chapter.contactEmail}`} className="flex items-center gap-2 hover:text-primary">
                <Mail className="h-4 w-4" />
                {chapter.contactEmail}
              </a>
            ) : null}
            {chapter.contactPhone ? (
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {chapter.contactPhone}
              </span>
            ) : null}
            {chapter.socialLinks?.website ? (
              <a href={chapter.socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary">
                <Globe className="h-4 w-4" />
                Website
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
