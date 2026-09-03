"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Megaphone, Plus } from "lucide-react";
import { authInputCls } from "@/shared/components/auth/formField";
import EmptyState from "@/shared/components/dashboard/emptyState";
import Skeleton from "@/shared/components/dashboard/skeleton";
import { useResource } from "@/shared/lib/hooks/useResource";

type Announcement = { _id: string; title: string; body: string; publishedAt: string };

export default function AnnouncementsAdminManager() {
  const { data, loading, reload } = useResource<{ items: Announcement[] }>(`/api/announcements?limit=20`);
  const items = data?.items ?? [];
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message are required");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, scope: "platform" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      toast.success("Announcement published.");
      setTitle("");
      setBody("");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface-card p-6">
        <input className={authInputCls} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={sending} />
        <textarea className={`${authInputCls} mt-3`} rows={4} placeholder="Message" value={body} onChange={(e) => setBody(e.target.value)} disabled={sending} />
        <button
          type="submit"
          disabled={sending}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {sending ? "Publishing…" : "Publish to everyone"}
        </button>
      </form>

      {loading ? (
        <Skeleton className="h-24" />
      ) : items.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements yet" />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((a) => (
            <div key={a._id} className="rounded-xl border border-border bg-surface-card p-4">
              <p className="text-sm font-semibold text-foreground-heading">{a.title}</p>
              <p className="mt-1 text-sm text-foreground-body">{a.body}</p>
              <p className="mt-2 text-xs text-foreground-muted">{new Date(a.publishedAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
