"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, ListChecks, Newspaper } from "lucide-react";
import { authInputCls } from "@/shared/components/auth/formField";
import StatusBadge, { toneForStatus } from "@/shared/components/dashboard/statusBadge";
import EmptyState from "@/shared/components/dashboard/emptyState";
import { useResource } from "@/shared/lib/hooks/useResource";

type ChapterSummary = {
  _id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  status: string;
  isPublic: boolean;
  adminUserId: string | null;
};

type Requirement = { _id: string; title: string; status: string; dueDate: string | null; progressPercentage: number };
type Submission = { _id: string; valueReported: number; notes: string; evidenceUrls: string[]; status: string };
type UpdateItem = { _id: string; title: string; type: string; status: string; description: string };

function RequirementReviewRow({ chapterId, requirement, onReviewed }: { chapterId: string; requirement: Requirement; onReviewed: () => void }) {
  const { data } = useResource<{ items: Submission[] }>(`/api/chapters/${chapterId}/requirements/${requirement._id}/submissions`);
  const latest = data?.items?.[0];
  const [busy, setBusy] = useState(false);

  const review = async (status: "approved" | "rejected" | "changes_requested") => {
    if (!latest) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/chapters/${chapterId}/requirements/${requirement._id}/submissions/${latest._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Something went wrong.");
      toast.success(`Requirement ${status.replace("_", " ")}.`);
      onReviewed();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground-heading">{requirement.title}</p>
        <StatusBadge label={requirement.status} tone={toneForStatus(requirement.status)} />
      </div>
      {latest ? (
        <div className="mt-2 text-sm text-foreground-body">
          <p>Reported value: {latest.valueReported}</p>
          {latest.notes ? <p className="mt-1 text-foreground-muted">{latest.notes}</p> : null}
          {latest.evidenceUrls.length > 0 ? (
            <ul className="mt-1 flex flex-col gap-0.5">
              {latest.evidenceUrls.map((url) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-3 flex gap-2">
            <button type="button" disabled={busy} onClick={() => review("approved")} className="rounded-full bg-status-success px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
              Approve
            </button>
            <button type="button" disabled={busy} onClick={() => review("changes_requested")} className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground disabled:opacity-60">
              Request changes
            </button>
            <button type="button" disabled={busy} onClick={() => review("rejected")} className="rounded-full bg-status-danger px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
              Reject
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-xs text-foreground-muted">Loading submission…</p>
      )}
    </div>
  );
}

function UpdateReviewRow({ chapterId, update, onReviewed }: { chapterId: string; update: UpdateItem; onReviewed: () => void }) {
  const [busy, setBusy] = useState(false);

  const review = async (status: "approved" | "published" | "rejected") => {
    setBusy(true);
    try {
      const res = await fetch(`/api/chapters/${chapterId}/updates/${update._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Something went wrong.");
      toast.success(`Update ${status}.`);
      onReviewed();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground-heading">{update.title}</p>
        <StatusBadge label={update.type.replace(/_/g, " ")} tone="info" />
      </div>
      {update.description ? <p className="mt-1.5 text-sm text-foreground-body">{update.description}</p> : null}
      <div className="mt-3 flex gap-2">
        <button type="button" disabled={busy} onClick={() => review("published")} className="rounded-full bg-status-success px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
          Approve & publish
        </button>
        <button type="button" disabled={busy} onClick={() => review("rejected")} className="rounded-full bg-status-danger px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
          Reject
        </button>
      </div>
    </div>
  );
}

export default function AdminChapterDetail({ chapter }: { chapter: ChapterSummary }) {
  const [status, setStatus] = useState(chapter.status);
  const [isPublic, setIsPublic] = useState(chapter.isPublic);
  const [savingStatus, setSavingStatus] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [reqForm, setReqForm] = useState({ title: "", category: "general", targetValue: 0, unit: "", dueDate: "", priority: "medium" as "low" | "medium" | "high", evidenceRequired: false });
  const [assigningReq, setAssigningReq] = useState(false);

  const { data: reqData, reload: reloadReqs } = useResource<{ items: Requirement[] }>(`/api/chapters/${chapter._id}/requirements`);
  const requirements = reqData?.items ?? [];
  const pendingRequirements = requirements.filter((r) => r.status === "submitted");

  const { data: updatesData, reload: reloadUpdates } = useResource<{ items: UpdateItem[] }>(`/api/chapters/${chapter._id}/updates?status=submitted`);
  const pendingUpdates = updatesData?.items ?? [];

  const saveStatus = async () => {
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/chapters/${chapter._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, isPublic }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      toast.success("Chapter status updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSavingStatus(false);
    }
  };

  const assignAdmin = async () => {
    if (!adminEmail.trim()) return;
    setAssigning(true);
    try {
      const lookupRes = await fetch(`/api/admin/users/lookup?email=${encodeURIComponent(adminEmail.trim())}`);
      const lookupData = await lookupRes.json().catch(() => null);
      if (!lookupRes.ok || !lookupData?.user) throw new Error("No user found with that email — they need to register first.");
      const res = await fetch(`/api/chapters/${chapter._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminUserId: lookupData.user.id }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      toast.success(`${lookupData.user.name} is now the chapter administrator.`);
      setAdminEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setAssigning(false);
    }
  };

  const assignRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setAssigningReq(true);
    try {
      const res = await fetch(`/api/chapters/${chapter._id}/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqForm),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      toast.success("Requirement assigned.");
      setReqForm({ title: "", category: "general", targetValue: 0, unit: "", dueDate: "", priority: "medium", evidenceRequired: false });
      await reloadReqs();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setAssigningReq(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <Link href="/admin/chapters" className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted hover:text-primary">
        <ArrowLeft className="h-4 w-4" />
        All chapters
      </Link>

      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground-heading">{chapter.name}</h2>
        <p className="mt-1 text-sm text-foreground-muted">
          {chapter.code} · {chapter.city ? `${chapter.city}, ` : ""}
          {chapter.state}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface-card p-6">
          <h3 className="font-display text-base font-semibold text-foreground-heading">Status & visibility</h3>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground-heading">Status</label>
              <select className={authInputCls} value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 160 }}>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <label className="mb-2.5 flex items-center gap-2 text-sm text-foreground-body">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="h-4 w-4 rounded border-border text-primary" />
              Public chapter page
            </label>
            <button
              type="button"
              onClick={saveStatus}
              disabled={savingStatus}
              className="mb-0.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {savingStatus ? "Saving…" : "Save"}
            </button>
          </div>
          <p className="mt-3 text-xs text-foreground-muted">Approve a chapter (status: Active) and make it public once its profile is ready.</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface-card p-6">
          <h3 className="font-display text-base font-semibold text-foreground-heading">Chapter administrator</h3>
          <p className="mt-1 text-xs text-foreground-muted">{chapter.adminUserId ? "This chapter already has an administrator assigned." : "No administrator assigned yet."}</p>
          <div className="mt-4 flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-foreground-heading">User email</label>
              <input className={authInputCls} value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@example.com" disabled={assigning} />
            </div>
            <button
              type="button"
              onClick={assignAdmin}
              disabled={assigning}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {assigning ? "Assigning…" : "Assign"}
            </button>
          </div>
          <p className="mt-2 text-xs text-foreground-muted">The user must already have a registered AgriMinds account.</p>
        </div>
      </div>

      <div>
        <h3 className="font-display text-base font-semibold text-foreground-heading">Assign a requirement</h3>
        <form onSubmit={assignRequirement} className="mt-4 rounded-2xl border border-border bg-surface-card p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input className={`${authInputCls} lg:col-span-2`} placeholder="Title" value={reqForm.title} onChange={(e) => setReqForm({ ...reqForm, title: e.target.value })} disabled={assigningReq} />
            <select className={authInputCls} value={reqForm.priority} onChange={(e) => setReqForm({ ...reqForm, priority: e.target.value as typeof reqForm.priority })} disabled={assigningReq}>
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
            <input className={authInputCls} placeholder="Category" value={reqForm.category} onChange={(e) => setReqForm({ ...reqForm, category: e.target.value })} disabled={assigningReq} />
            <input
              type="number"
              className={authInputCls}
              placeholder="Target value"
              value={reqForm.targetValue}
              onChange={(e) => setReqForm({ ...reqForm, targetValue: Number(e.target.value) })}
              disabled={assigningReq}
            />
            <input className={authInputCls} placeholder="Unit (e.g. farmers)" value={reqForm.unit} onChange={(e) => setReqForm({ ...reqForm, unit: e.target.value })} disabled={assigningReq} />
            <input type="date" className={authInputCls} value={reqForm.dueDate} onChange={(e) => setReqForm({ ...reqForm, dueDate: e.target.value })} disabled={assigningReq} />
            <label className="flex items-center gap-2 text-sm text-foreground-body">
              <input
                type="checkbox"
                checked={reqForm.evidenceRequired}
                onChange={(e) => setReqForm({ ...reqForm, evidenceRequired: e.target.checked })}
                className="h-4 w-4 rounded border-border text-primary"
                disabled={assigningReq}
              />
              Evidence required
            </label>
          </div>
          <button
            type="submit"
            disabled={assigningReq}
            className="mt-4 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:opacity-60"
          >
            {assigningReq ? "Assigning…" : "Assign requirement"}
          </button>
        </form>
      </div>

      <div>
        <h3 className="font-display flex items-center gap-2 text-base font-semibold text-foreground-heading">
          <ListChecks className="h-4 w-4" />
          Submissions awaiting review
        </h3>
        {pendingRequirements.length > 0 ? (
          <div className="mt-4 flex flex-col gap-3">
            {pendingRequirements.map((r) => (
              <RequirementReviewRow key={r._id} chapterId={chapter._id} requirement={r} onReviewed={reloadReqs} />
            ))}
          </div>
        ) : (
          <EmptyState title="Nothing to review" className="mt-4" />
        )}
      </div>

      <div>
        <h3 className="font-display flex items-center gap-2 text-base font-semibold text-foreground-heading">
          <Newspaper className="h-4 w-4" />
          Updates awaiting review
        </h3>
        {pendingUpdates.length > 0 ? (
          <div className="mt-4 flex flex-col gap-3">
            {pendingUpdates.map((u) => (
              <UpdateReviewRow key={u._id} chapterId={chapter._id} update={u} onReviewed={reloadUpdates} />
            ))}
          </div>
        ) : (
          <EmptyState title="Nothing to review" className="mt-4" />
        )}
      </div>
    </div>
  );
}
