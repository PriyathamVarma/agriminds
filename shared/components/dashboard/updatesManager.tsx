"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Newspaper, Plus, Trash2 } from "lucide-react";
import { authInputCls } from "@/shared/components/auth/formField";
import StatusBadge, { toneForStatus } from "@/shared/components/dashboard/statusBadge";
import EmptyState from "@/shared/components/dashboard/emptyState";
import Skeleton from "@/shared/components/dashboard/skeleton";
import ConfirmDialog from "@/shared/components/dashboard/confirmDialog";
import { useResource } from "@/shared/lib/hooks/useResource";

type Update = { _id: string; type: string; title: string; description: string; date: string; status: string; visibility: string };

const UPDATE_TYPES = ["general", "event", "workshop", "meeting", "success_story", "partnership", "support_activity", "impact_report"];
const emptyForm = { type: "general", title: "", description: "", location: "", visibility: "private" as "public" | "private" };

export default function UpdatesManager({ chapterId, canManage }: { chapterId: string; canManage: boolean }) {
  const { data, loading, reload } = useResource<{ items: Update[] }>(`/api/chapters/${chapterId}/updates`);
  const items = data?.items ?? [];
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Update | null>(null);
  const [deleting, setDeleting] = useState(false);

  const createUpdate = async (status: "draft" | "submitted") => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`/api/chapters/${chapterId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      toast.success(status === "submitted" ? "Submitted for review." : "Saved as draft.");
      setForm(emptyForm);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/chapters/${chapterId}/updates/${pendingDelete._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete this update.");
      toast.success("Update deleted.");
      setPendingDelete(null);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {canManage ? (
        <div className="rounded-2xl border border-border bg-surface-card p-6">
          <h3 className="font-display text-base font-semibold text-foreground-heading">Post an update</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <select className={authInputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} disabled={creating}>
              {UPDATE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <select
              className={authInputCls}
              value={form.visibility}
              onChange={(e) => setForm({ ...form, visibility: e.target.value as "public" | "private" })}
              disabled={creating}
            >
              <option value="private">Private (internal only)</option>
              <option value="public">Public (once approved)</option>
            </select>
            <input className={`${authInputCls} sm:col-span-2`} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} disabled={creating} />
            <input className={authInputCls} placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} disabled={creating} />
            <textarea
              className={`${authInputCls} sm:col-span-2`}
              rows={3}
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              disabled={creating}
            />
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => createUpdate("draft")}
              disabled={creating}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground-body hover:bg-surface disabled:opacity-60"
            >
              Save as draft
            </button>
            <button
              type="button"
              onClick={() => createUpdate("submitted")}
              disabled={creating}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              Submit for review
            </button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Newspaper} title="No updates yet" description="Post your chapter's first event, story, or announcement above." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((u) => (
            <div key={u._id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface-card px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground-heading">{u.title}</p>
                <p className="text-xs text-foreground-muted">
                  {u.type.replace(/_/g, " ")} · {new Date(u.date).toLocaleDateString()} · {u.visibility}
                </p>
              </div>
              <div className="flex flex-none items-center gap-3">
                <StatusBadge label={u.status} tone={toneForStatus(u.status)} />
                {canManage && u.status === "draft" ? (
                  <button type="button" onClick={() => setPendingDelete(u)} className="text-foreground-muted hover:text-status-danger" aria-label={`Delete ${u.title}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this update?"
        description={`"${pendingDelete?.title}" will be permanently deleted.`}
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
