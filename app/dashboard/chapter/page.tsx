import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, CalendarClock, AlertTriangle, Megaphone, ListChecks } from "lucide-react";
import { getCurrentUser } from "@/shared/lib/auth/getCurrentUser";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { Chapter } from "@/shared/models/chapter";
import { ChapterMembership } from "@/shared/models/chapterMembership";
import { ChapterRequirement } from "@/shared/models/chapterRequirement";
import { RequirementSubmission } from "@/shared/models/requirementSubmission";
import { ChapterUpdate } from "@/shared/models/chapterUpdate";
import { ImpactReport } from "@/shared/models/impactReport";
import { Announcement } from "@/shared/models/announcement";
import StatCard from "@/shared/components/dashboard/statCard";
import StatusBadge, { toneForStatus } from "@/shared/components/dashboard/statusBadge";
import ProgressRing from "@/shared/components/dashboard/progressRing";
import EmptyState from "@/shared/components/dashboard/emptyState";

const CHAPTER_PROFILE_FIELDS = ["description", "mission", "logoUrl", "coverImageUrl", "contactEmail", "contactPhone", "address", "establishedDate"] as const;

// A plain helper (not a component) — keeps the impure Date.now() read out of the component
// body itself, which React's purity rule flags even for a Server Component's render.
function splitByDeadline<T extends { dueDate?: Date | string | null; status: string }>(requirements: T[]) {
  const now = Date.now();
  const overdue = requirements.filter((r) => r.dueDate && new Date(r.dueDate).getTime() < now && r.status !== "approved");
  const upcoming = requirements.filter((r) => r.dueDate && new Date(r.dueDate).getTime() >= now && r.status !== "approved").slice(0, 5);
  return { overdue, upcoming };
}

export default async function ChapterDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard/chapter");
  if (user.role === "registered_user") redirect("/dashboard");
  if (!user.chapterId) redirect(user.role === "super_admin" ? "/admin/chapters" : "/dashboard");

  await connectToDatabase();
  const chapterId = String(user.chapterId);

  const [chapter, memberCount, requirements, pendingSubmissions, recentUpdates, impactReports, announcements] = await Promise.all([
    Chapter.findById(chapterId).lean(),
    ChapterMembership.countDocuments({ chapterId, status: "active" }),
    ChapterRequirement.find({ chapterId }).sort({ dueDate: 1 }).lean(),
    RequirementSubmission.countDocuments({ chapterId, status: "pending" }),
    ChapterUpdate.find({ chapterId }).sort({ date: -1 }).limit(5).lean(),
    ImpactReport.find({ chapterId }).lean(),
    Announcement.find({ $or: [{ scope: "platform" }, { scope: "chapter", chapterId }] })
      .sort({ publishedAt: -1 })
      .limit(5)
      .lean(),
  ]);

  if (!chapter) redirect("/unauthorized");

  const filled = CHAPTER_PROFILE_FIELDS.filter((f) => Boolean(chapter[f])).length;
  const profileCompletion = Math.round((filled / CHAPTER_PROFILE_FIELDS.length) * 100);

  const overallCompletion = requirements.length
    ? Math.round(requirements.reduce((sum, r) => sum + (r.progressPercentage || 0), 0) / requirements.length)
    : 0;
  const { overdue, upcoming } = splitByDeadline(requirements);

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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-semibold text-foreground-heading">{chapter.name}</h2>
            <StatusBadge label={chapter.status} tone={toneForStatus(chapter.status)} />
          </div>
          <p className="mt-1 text-sm text-foreground-muted">
            {chapter.code} · {chapter.city ? `${chapter.city}, ` : ""}
            {chapter.state}
          </p>
        </div>
        <Link href="/dashboard/chapter/profile" className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground-body hover:bg-surface">
          Edit chapter profile
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex items-center gap-5 rounded-2xl border border-border bg-surface-card p-6">
          <ProgressRing percent={profileCompletion} size={80} label="Profile" />
          <div>
            <p className="text-sm font-semibold text-foreground-heading">Profile completion</p>
            <p className="mt-1 text-xs text-foreground-muted">Complete your chapter&apos;s public profile to build trust with visitors.</p>
          </div>
        </div>
        <div className="flex items-center gap-5 rounded-2xl border border-border bg-surface-card p-6">
          <ProgressRing percent={overallCompletion} size={80} label="Requirements" />
          <div>
            <p className="text-sm font-semibold text-foreground-heading">Requirement completion</p>
            <p className="mt-1 text-xs text-foreground-muted">{requirements.length} requirement{requirements.length === 1 ? "" : "s"} assigned this period.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface-card p-6">
          <p className="text-xs font-semibold tracking-wide text-foreground-muted uppercase">Needs your attention</p>
          <div className="mt-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 flex-none text-status-danger" />
              <span className="text-foreground-body">{overdue.length} overdue requirement{overdue.length === 1 ? "" : "s"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ListChecks className="h-4 w-4 flex-none text-accent" />
              <span className="text-foreground-body">{pendingSubmissions} submission{pendingSubmissions === 1 ? "" : "s"} awaiting admin review</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Team members" value={memberCount} icon={Users} />
        <StatCard label="Events conducted" value={impactTotals.eventsConducted} icon={CalendarClock} />
        <StatCard label="Farmers reached" value={impactTotals.farmersReached} icon={Users} />
        <StatCard label="Startups & FPOs supported" value={impactTotals.startupsSupported + impactTotals.fpoSupported} icon={ListChecks} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground-heading">Upcoming deadlines</h3>
          {upcoming.length > 0 ? (
            <div className="mt-4 flex flex-col gap-2.5">
              {upcoming.map((r) => (
                <div key={String(r._id)} className="flex items-center justify-between rounded-xl border border-border bg-surface-card px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground-heading">{r.title}</p>
                    <p className="text-xs text-foreground-muted">Due {r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "—"}</p>
                  </div>
                  <StatusBadge label={r.status} tone={toneForStatus(r.status)} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Nothing due soon" className="mt-4" />
          )}
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold text-foreground-heading">Recent updates</h3>
          {recentUpdates.length > 0 ? (
            <div className="mt-4 flex flex-col gap-2.5">
              {recentUpdates.map((u) => (
                <div key={String(u._id)} className="flex items-center justify-between rounded-xl border border-border bg-surface-card px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground-heading">{u.title}</p>
                    <p className="text-xs text-foreground-muted">{new Date(u.date).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge label={u.status} tone={toneForStatus(u.status)} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No updates posted yet" className="mt-4" />
          )}
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold text-foreground-heading">Announcements</h3>
        {announcements.length > 0 ? (
          <div className="mt-4 flex flex-col gap-3">
            {announcements.map((a) => (
              <div key={String(a._id)} className="flex gap-3 rounded-xl border border-border bg-surface-card px-4 py-3">
                <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Megaphone className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground-heading">{a.title}</p>
                  <p className="mt-0.5 text-sm text-foreground-body">{a.body}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No announcements yet" className="mt-4" />
        )}
      </div>
    </div>
  );
}
