"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ListChecks, ChevronDown } from "lucide-react";
import { authInputCls } from "@/shared/components/auth/formField";
import StatusBadge, { toneForStatus } from "@/shared/components/dashboard/statusBadge";
import ProgressBar from "@/shared/components/dashboard/progressBar";
import EmptyState from "@/shared/components/dashboard/emptyState";
import Skeleton from "@/shared/components/dashboard/skeleton";
import { useResource } from "@/shared/lib/hooks/useResource";
import { cx } from "@/shared/lib/utils";

type Requirement = {
  _id: string;
  title: string;
  description: string;
  category: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  dueDate: string | null;
  priority: "low" | "medium" | "high";
  evidenceRequired: boolean;
  progressPercentage: number;
  status: string;
  adminFeedback: string;
};

function RequirementRow({
  requirement,
  chapterId,
  canManage,
  onSubmitted,
}: {
  requirement: Requirement;
  chapterId: string;
  canManage: boolean;
  onSubmitted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [valueReported, setValueReported] = useState(requirement.currentValue);
  const [notes, setNotes] = useState("");
  const [evidence, setEvidence] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const locked = requirement.status === "approved" || requirement.status === "submitted";

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const evidenceUrls = evidence
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch(`/api/chapters/${chapterId}/requirements/${requirement._id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valueReported, notes, evidenceUrls }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      toast.success("Submitted for review.");
      setNotes("");
      setEvidence("");
      onSubmitted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface-card">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-3 p-5 text-left">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground-heading">{requirement.title}</p>
            <StatusBadge label={requirement.status.replace("_", " ")} tone={toneForStatus(requirement.status)} />
            {requirement.priority === "high" ? <StatusBadge label="High priority" tone="danger" /> : null}
          </div>
          <p className="mt-1 text-xs text-foreground-muted">
            {requirement.category} · Due {requirement.dueDate ? new Date(requirement.dueDate).toLocaleDateString() : "no deadline"}
          </p>
          <ProgressBar percent={requirement.progressPercentage} className="mt-3 max-w-xs" />
        </div>
        <ChevronDown className={cx("h-4 w-4 flex-none text-foreground-muted transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="border-t border-border p-5">
          {requirement.description ? <p className="text-sm text-foreground-body">{requirement.description}</p> : null}
          {requirement.adminFeedback ? (
            <div className="mt-3 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-accent-foreground">
              <span className="font-semibold">AgriMinds feedback: </span>
              {requirement.adminFeedback}
            </div>
          ) : null}

          {canManage && !locked ? (
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-end gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground-heading">Current value {requirement.unit ? `(${requirement.unit})` : ""}</label>
                  <input
                    type="number"
                    className={`${authInputCls} w-32`}
                    value={valueReported}
                    onChange={(e) => setValueReported(Number(e.target.value))}
                    disabled={submitting}
                  />
                </div>
                <p className="pb-3 text-xs text-foreground-muted">Target: {requirement.targetValue} {requirement.unit}</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground-heading">Notes</label>
                <textarea className={authInputCls} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} disabled={submitting} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground-heading">
                  Evidence URLs {requirement.evidenceRequired ? "(required, one per line)" : "(optional, one per line)"}
                </label>
                <textarea className={authInputCls} rows={2} value={evidence} onChange={(e) => setEvidence(e.target.value)} disabled={submitting} placeholder="https://res.cloudinary.com/…" />
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="self-start rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit for review"}
              </button>
            </div>
          ) : locked ? (
            <p className="mt-4 text-xs text-foreground-muted">
              {requirement.status === "approved" ? "This requirement has been approved." : "This requirement is awaiting admin review."}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function RequirementsManager({ chapterId, canManage }: { chapterId: string; canManage: boolean }) {
  const { data, loading, reload } = useResource<{ items: Requirement[] }>(`/api/chapters/${chapterId}/requirements`);
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
    return <EmptyState icon={ListChecks} title="No requirements assigned yet" description="The AgriMinds team will assign requirements for this chapter to work toward." />;
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((r) => (
        <RequirementRow key={r._id} requirement={r} chapterId={chapterId} canManage={canManage} onSubmitted={reload} />
      ))}
    </div>
  );
}
