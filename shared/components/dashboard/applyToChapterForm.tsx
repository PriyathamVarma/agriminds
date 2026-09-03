"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authInputCls } from "@/shared/components/auth/formField";

type Chapter = { _id: string; name: string; state: string; city?: string };

export default function ApplyToChapterForm({ chapters }: { chapters: Chapter[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<"join_existing" | "propose_new">("join_existing");
  const [targetChapterId, setTargetChapterId] = useState(chapters[0]?._id ?? "");
  const [proposedChapterName, setProposedChapterName] = useState("");
  const [proposedCity, setProposedCity] = useState("");
  const [proposedState, setProposedState] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "join_existing"
            ? { type: mode, targetChapterId, message }
            : { type: mode, proposedChapterName, proposedCity, proposedState, message },
        ),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Something went wrong. Please try again.");
      toast.success("Application submitted — the AgriMinds team will review it soon.");
      setMessage("");
      setProposedChapterName("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface-card p-6">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("join_existing")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${mode === "join_existing" ? "bg-primary text-primary-foreground" : "bg-surface text-foreground-muted hover:bg-border/60"}`}
        >
          Join a chapter
        </button>
        <button
          type="button"
          onClick={() => setMode("propose_new")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${mode === "propose_new" ? "bg-primary text-primary-foreground" : "bg-surface text-foreground-muted hover:bg-border/60"}`}
        >
          Propose a new chapter
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {mode === "join_existing" ? (
          chapters.length > 0 ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground-heading">Chapter</label>
              <select className={authInputCls} value={targetChapterId} onChange={(e) => setTargetChapterId(e.target.value)} disabled={submitting}>
                {chapters.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} — {c.city ? `${c.city}, ` : ""}
                    {c.state}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-sm text-foreground-muted">There are no active chapters to join yet — you can propose a new one instead.</p>
          )
        ) : (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground-heading">Proposed chapter name</label>
              <input className={authInputCls} value={proposedChapterName} onChange={(e) => setProposedChapterName(e.target.value)} disabled={submitting} placeholder="e.g. AgriMinds Coimbatore" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground-heading">City</label>
                <input className={authInputCls} value={proposedCity} onChange={(e) => setProposedCity(e.target.value)} disabled={submitting} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground-heading">State</label>
                <input className={authInputCls} value={proposedState} onChange={(e) => setProposedState(e.target.value)} disabled={submitting} />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground-heading">Message (optional)</label>
          <textarea
            className={authInputCls}
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={submitting}
            placeholder="Tell us a bit about why you'd like to get involved."
          />
        </div>

        <button
          type="submit"
          disabled={submitting || (mode === "join_existing" && chapters.length === 0)}
          className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit application"}
        </button>
      </div>
    </form>
  );
}
