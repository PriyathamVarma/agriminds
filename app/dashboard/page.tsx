import { redirect } from "next/navigation";
import { Megaphone, MapPin } from "lucide-react";
import { getCurrentUser } from "@/shared/lib/auth/getCurrentUser";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { Chapter } from "@/shared/models/chapter";
import { ChapterApplication, type IChapterApplication } from "@/shared/models/chapterApplication";
import { Announcement } from "@/shared/models/announcement";
import StatusBadge, { toneForStatus } from "@/shared/components/dashboard/statusBadge";
import ProgressBar from "@/shared/components/dashboard/progressBar";
import EmptyState from "@/shared/components/dashboard/emptyState";
import ApplyToChapterForm from "@/shared/components/dashboard/applyToChapterForm";

const PROFILE_FIELDS = ["phone", "city", "state", "organisation", "areaOfInterest"] as const;

export default async function GeneralDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard");
  if (user.role === "super_admin") redirect("/admin");
  if (user.role === "chapter_admin" || user.role === "chapter_member") redirect("/dashboard/chapter");

  await connectToDatabase();

  const [chapters, applications, announcements] = await Promise.all([
    Chapter.find({ status: "active", isPublic: true })
      .sort(user.state ? undefined : { createdAt: -1 })
      .limit(6)
      .lean(),
    ChapterApplication.find({ applicantUserId: user._id }).sort({ createdAt: -1 }).populate("targetChapterId", "name").lean(),
    Announcement.find({ scope: "platform" }).sort({ publishedAt: -1 }).limit(5).lean(),
  ]);

  const filledCount = PROFILE_FIELDS.filter((field) => Boolean(user[field])).length;
  const profileCompletion = Math.round((filledCount / PROFILE_FIELDS.length) * 100);
  const hasPendingApplication = applications.some((a) => a.status === "pending");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground-heading">Welcome back, {user.name.split(" ")[0]}</h2>
        <p className="mt-1 text-sm text-foreground-muted">Here&apos;s what&apos;s happening with your AgriMinds account.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface-card p-6 lg:col-span-1">
          <p className="text-xs font-semibold tracking-wide text-foreground-muted uppercase">Profile completion</p>
          <ProgressBar percent={profileCompletion} className="mt-4" />
          {profileCompletion < 100 ? (
            <p className="mt-3 text-xs text-foreground-muted">Fill in your phone, location, organisation, and interests so chapters know a bit about you.</p>
          ) : (
            <p className="mt-3 text-xs text-status-success">Your profile is complete.</p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface-card p-6 lg:col-span-2">
          <p className="text-xs font-semibold tracking-wide text-foreground-muted uppercase">Account status</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StatusBadge label="Registered member" tone="info" />
            {hasPendingApplication ? <StatusBadge label="Application pending review" tone="warning" /> : null}
          </div>
          <p className="mt-3 text-sm text-foreground-body">
            {hasPendingApplication
              ? "The AgriMinds team is reviewing your application — you'll get chapter access as soon as it's approved."
              : "You don't have an active chapter yet. Apply to join one below, or propose a new chapter for your city."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground-heading">Chapters near you</h3>
          {chapters.length > 0 ? (
            <div className="mt-4 flex flex-col gap-3">
              {chapters.map((c) => (
                <div key={String(c._id)} className="flex items-center justify-between rounded-xl border border-border bg-surface-card px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground-heading">{c.name}</p>
                    <p className="flex items-center gap-1 text-xs text-foreground-muted">
                      <MapPin className="h-3 w-3" />
                      {c.city ? `${c.city}, ` : ""}
                      {c.state}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No active chapters yet" description="Be the first — propose a new AgriMinds chapter for your city." className="mt-4" />
          )}
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold text-foreground-heading">Apply to join or propose a chapter</h3>
          <div className="mt-4">
            <ApplyToChapterForm chapters={chapters.map((c) => ({ _id: String(c._id), name: c.name, state: c.state, city: c.city }))} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold text-foreground-heading">Your applications</h3>
        {applications.length > 0 ? (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-surface-card">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs tracking-wide text-foreground-muted uppercase">
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Details</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app: IChapterApplication & { targetChapterId?: { name?: string } | null }) => (
                  <tr key={String(app._id)} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">{app.type === "join_existing" ? "Join chapter" : "Propose chapter"}</td>
                    <td className="px-4 py-3 text-foreground-body">{app.type === "join_existing" ? app.targetChapterId?.name || "—" : app.proposedChapterName}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={app.status} tone={toneForStatus(app.status)} />
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">{new Date(app.createdAt as unknown as string).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No applications yet" description="Apply to join a chapter above to get started." className="mt-4" />
        )}
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
