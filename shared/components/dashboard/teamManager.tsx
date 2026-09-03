"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Users } from "lucide-react";
import { authInputCls } from "@/shared/components/auth/formField";
import EmptyState from "@/shared/components/dashboard/emptyState";
import Skeleton from "@/shared/components/dashboard/skeleton";
import ConfirmDialog from "@/shared/components/dashboard/confirmDialog";
import { useResource } from "@/shared/lib/hooks/useResource";

type Member = {
  _id: string;
  name: string;
  designation: string;
  bio: string;
  photoUrl: string;
  email: string;
  phone: string;
  linkedin: string;
  isPublic: boolean;
  role: "admin" | "member";
};

const emptyForm = { name: "", designation: "", bio: "", email: "", phone: "", linkedin: "", isPublic: true };

export default function TeamManager({ chapterId, canManage }: { chapterId: string; canManage: boolean }) {
  const { data, loading, reload } = useResource<{ items: Member[] }>(`/api/chapters/${chapterId}/team`);
  const members = data?.items ?? [];
  const [form, setForm] = useState(emptyForm);
  const [adding, setAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(`/api/chapters/${chapterId}/team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      toast.success("Team member added.");
      setForm(emptyForm);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setAdding(false);
    }
  };

  const handleTogglePublic = async (member: Member) => {
    const res = await fetch(`/api/chapters/${chapterId}/team/${member._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !member.isPublic }),
    });
    if (res.ok) reload();
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/chapters/${chapterId}/team/${pendingDelete._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not remove this member.");
      toast.success("Team member removed.");
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
        <form onSubmit={handleAdd} className="rounded-2xl border border-border bg-surface-card p-6">
          <h3 className="font-display text-base font-semibold text-foreground-heading">Add a team member</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input className={authInputCls} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={adding} />
            <input className={authInputCls} placeholder="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} disabled={adding} />
            <input className={authInputCls} placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={adding} />
            <input className={authInputCls} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} disabled={adding} />
            <input className={authInputCls} placeholder="LinkedIn URL" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} disabled={adding} />
            <textarea className={`${authInputCls} sm:col-span-2`} placeholder="Short bio" rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} disabled={adding} />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {adding ? "Adding…" : "Add member"}
          </button>
        </form>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <EmptyState icon={Users} title="No team members yet" description="Add the people who represent your chapter." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {members.map((m) => (
            <div key={m._id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface-card p-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground-heading">{m.name || "Unnamed"}</p>
                <p className="text-xs text-foreground-muted">{m.designation || "—"}</p>
                {m.bio ? <p className="mt-1.5 text-xs text-foreground-body">{m.bio}</p> : null}
              </div>
              {canManage ? (
                <div className="flex flex-none flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleTogglePublic(m)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${m.isPublic ? "bg-status-success-surface text-status-success" : "bg-surface text-foreground-muted"}`}
                  >
                    {m.isPublic ? "Public" : "Hidden"}
                  </button>
                  <button type="button" onClick={() => setPendingDelete(m)} className="text-foreground-muted hover:text-status-danger" aria-label={`Remove ${m.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Remove this team member?"
        description={`${pendingDelete?.name || "This person"} will be removed from the chapter team. This can't be undone.`}
        confirmLabel="Remove"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
