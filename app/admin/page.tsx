import Link from "next/link";
import { Building2, ClipboardList, ListChecks, AlertTriangle, Users, TrendingUp } from "lucide-react";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { Chapter } from "@/shared/models/chapter";
import { ChapterApplication } from "@/shared/models/chapterApplication";
import { RequirementSubmission } from "@/shared/models/requirementSubmission";
import { ChapterRequirement } from "@/shared/models/chapterRequirement";
import { AuditLog } from "@/shared/models/auditLog";
import StatCard from "@/shared/components/dashboard/statCard";
import StatusBadge, { toneForStatus } from "@/shared/components/dashboard/statusBadge";
import EmptyState from "@/shared/components/dashboard/emptyState";

export default async function AdminOverviewPage() {
  await connectToDatabase();

  const [statusCounts, pendingApplications, pendingSubmissions, overdueRequirements, attentionChapters, recentActivity] = await Promise.all([
    Chapter.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ChapterApplication.countDocuments({ status: "pending" }),
    RequirementSubmission.countDocuments({ status: "pending" }),
    ChapterRequirement.countDocuments({ dueDate: { $lt: new Date() }, status: { $nin: ["approved"] } }),
    Chapter.find({ status: "pending" }).sort({ createdAt: -1 }).limit(6).lean(),
    AuditLog.find().sort({ createdAt: -1 }).limit(8).populate("actorUserId", "name").lean(),
  ]);

  const counts: Record<string, number> = { pending: 0, active: 0, suspended: 0, archived: 0 };
  for (const row of statusCounts) counts[row._id] = row.count;
  const totalChapters = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground-heading">Platform Overview</h2>
        <p className="mt-1 text-sm text-foreground-muted">A snapshot of every chapter across the AgriMinds network.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total chapters" value={totalChapters} icon={Building2} hint={`${counts.active} active`} />
        <StatCard label="Pending applications" value={pendingApplications} icon={ClipboardList} />
        <StatCard label="Submissions to review" value={pendingSubmissions} icon={ListChecks} />
        <StatCard label="Overdue requirements" value={overdueRequirements} icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active" value={counts.active} icon={TrendingUp} />
        <StatCard label="Pending review" value={counts.pending} icon={ClipboardList} />
        <StatCard label="Suspended" value={counts.suspended} icon={AlertTriangle} />
        <StatCard label="Archived" value={counts.archived} icon={Users} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-foreground-heading">Chapters awaiting review</h3>
            <Link href="/admin/chapters?status=pending" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          {attentionChapters.length > 0 ? (
            <div className="mt-4 flex flex-col gap-2.5">
              {attentionChapters.map((c) => (
                <Link
                  key={String(c._id)}
                  href={`/admin/chapters/${String(c._id)}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface-card px-4 py-3 transition hover:border-primary/40"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground-heading">{c.name}</p>
                    <p className="text-xs text-foreground-muted">
                      {c.city ? `${c.city}, ` : ""}
                      {c.state}
                    </p>
                  </div>
                  <StatusBadge label={c.status} tone={toneForStatus(c.status)} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="Nothing pending" description="Every chapter has been reviewed." className="mt-4" />
          )}
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold text-foreground-heading">Recent activity</h3>
          {recentActivity.length > 0 ? (
            <div className="mt-4 flex flex-col gap-2.5">
              {recentActivity.map((log) => {
                const actor = log.actorUserId as unknown as { name?: string } | null;
                return (
                  <div key={String(log._id)} className="rounded-xl border border-border bg-surface-card px-4 py-3 text-sm">
                    <span className="font-medium text-foreground-heading">{actor?.name || "Someone"}</span>{" "}
                    <span className="text-foreground-muted">{log.action.replace(/[._]/g, " ")}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No activity yet" className="mt-4" />
          )}
        </div>
      </div>
    </div>
  );
}
