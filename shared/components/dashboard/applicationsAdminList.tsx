"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ClipboardList } from "lucide-react";
import StatusBadge, { toneForStatus } from "@/shared/components/dashboard/statusBadge";
import EmptyState from "@/shared/components/dashboard/emptyState";
import Skeleton from "@/shared/components/dashboard/skeleton";
import { useResource } from "@/shared/lib/hooks/useResource";

type Application = {
  _id: string;
  type: "join_existing" | "propose_new";
  status: string;
  message: string;
  proposedChapterName?: string;
  proposedCity?: string;
  proposedState?: string;
  applicantUserId?: { name?: string; email?: string };
  targetChapterId?: { name?: string };
  createdAt: string;
};

function ApplicationRow({ application, onReviewed }: { application: Application; onReviewed: () => void }) {
  const [busy, setBusy] = useState(false);

  const review = async (status: "approved" | "rejected") => {
    setBusy(true);
    try {
      const res = await fetch(`/api/applications/${application._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      toast.success(`Application ${status}.`);
      onReviewed();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground-heading">{application.applicantUserId?.name || "Unknown applicant"}</p>
          <p className="text-xs text-foreground-muted">{application.applicantUserId?.email}</p>
        </div>
        <StatusBadge label={application.status} tone={toneForStatus(application.status)} />
      </div>
      <p className="mt-2 text-sm text-foreground-body">
        {application.type === "join_existing" ? (
          <>
            Wants to join <span className="font-medium">{application.targetChapterId?.name || "a chapter"}</span>
          </>
        ) : (
          <>
            Proposes a new chapter: <span className="font-medium">{application.proposedChapterName}</span> — {application.proposedCity}, {application.proposedState}
          </>
        )}
      </p>
      {application.message ? <p className="mt-1 text-sm text-foreground-muted">&ldquo;{application.message}&rdquo;</p> : null}
      {application.status === "pending" ? (
        <div className="mt-3 flex gap-2">
          <button type="button" disabled={busy} onClick={() => review("approved")} className="rounded-full bg-status-success px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
            Approve
          </button>
          <button type="button" disabled={busy} onClick={() => review("rejected")} className="rounded-full bg-status-danger px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
            Reject
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function ApplicationsAdminList() {
  const { data, loading, reload } = useResource<{ items: Application[] }>(`/api/applications?limit=50`);
  const items = data?.items ?? [];

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyState icon={ClipboardList} title="No applications yet" />;
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((a) => (
        <ApplicationRow key={a._id} application={a} onReviewed={reload} />
      ))}
    </div>
  );
}
