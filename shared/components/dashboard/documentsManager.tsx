"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FolderOpen, Plus, Trash2, ExternalLink } from "lucide-react";
import { authInputCls } from "@/shared/components/auth/formField";
import EmptyState from "@/shared/components/dashboard/emptyState";
import Skeleton from "@/shared/components/dashboard/skeleton";
import ConfirmDialog from "@/shared/components/dashboard/confirmDialog";
import { useResource } from "@/shared/lib/hooks/useResource";

type Doc = { _id: string; category: string; title: string; fileUrl: string; fileType: string };

const CATEGORIES = ["registration", "team_authorisation", "minutes", "activity_report", "financial", "partnership", "compliance", "photo_evidence"];
const emptyForm = { category: "registration", title: "", fileUrl: "", fileType: "" };

export default function DocumentsManager({ chapterId, canManage }: { chapterId: string; canManage: boolean }) {
  const { data, loading, reload } = useResource<{ items: Doc[] }>(`/api/chapters/${chapterId}/documents`);
  const items = data?.items ?? [];
  const [form, setForm] = useState(emptyForm);
  const [adding, setAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Doc | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.fileUrl.trim()) {
      toast.error("Title and file URL are required");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(`/api/chapters/${chapterId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      toast.success("Document added.");
      setForm(emptyForm);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/chapters/${chapterId}/documents/${pendingDelete._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete this document.");
      toast.success("Document deleted.");
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
          <h3 className="font-display text-base font-semibold text-foreground-heading">Add a document</h3>
          <p className="mt-1 text-xs text-foreground-muted">Upload the file to Cloudinary (or your storage of choice) first, then paste its secure URL here.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <select className={authInputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} disabled={adding}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <select className={authInputCls} value={form.fileType} onChange={(e) => setForm({ ...form, fileType: e.target.value })} disabled={adding}>
              <option value="">File type…</option>
              {["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg", "webp"].map((t) => (
                <option key={t} value={t}>
                  {t.toUpperCase()}
                </option>
              ))}
            </select>
            <input className={`${authInputCls} sm:col-span-2`} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} disabled={adding} />
            <input
              className={`${authInputCls} sm:col-span-2`}
              placeholder="https://res.cloudinary.com/…"
              value={form.fileUrl}
              onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
              disabled={adding}
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {adding ? "Adding…" : "Add document"}
          </button>
        </form>
      ) : null}

      {loading ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No documents yet" description="Add registration papers, minutes, and reports here." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((doc) => (
            <div key={doc._id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-card px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground-heading">{doc.title}</p>
                <p className="text-xs text-foreground-muted">{doc.category.replace(/_/g, " ")}</p>
              </div>
              <div className="flex flex-none items-center gap-3">
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-foreground-muted hover:text-primary" aria-label={`Open ${doc.title}`}>
                  <ExternalLink className="h-4 w-4" />
                </a>
                {canManage ? (
                  <button type="button" onClick={() => setPendingDelete(doc)} className="text-foreground-muted hover:text-status-danger" aria-label={`Delete ${doc.title}`}>
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
        title="Delete this document?"
        description={`"${pendingDelete?.title}" will be permanently deleted.`}
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
