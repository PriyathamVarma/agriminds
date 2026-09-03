"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { BarChart3, Plus } from "lucide-react";
import { authInputCls } from "@/shared/components/auth/formField";
import EmptyState from "@/shared/components/dashboard/emptyState";
import Skeleton from "@/shared/components/dashboard/skeleton";
import { useResource } from "@/shared/lib/hooks/useResource";

const METRIC_FIELDS: { key: string; label: string }[] = [
  { key: "eventsConducted", label: "Events conducted" },
  { key: "farmersReached", label: "Farmers reached" },
  { key: "fpoSupported", label: "FPOs / FPCs supported" },
  { key: "startupsSupported", label: "Startups supported" },
  { key: "studentsEngaged", label: "Students engaged" },
  { key: "womenEntrepreneursSupported", label: "Women entrepreneurs supported" },
  { key: "partnershipsCreated", label: "Partnerships created" },
  { key: "mentorshipSessions", label: "Mentorship sessions" },
  { key: "fundingFacilitated", label: "Funding facilitated (₹)" },
  { key: "jobsCreated", label: "Jobs / livelihoods created" },
];

type Report = { _id: string; period: string; periodStart: string; periodEnd: string; metrics: Record<string, number>; status: string };

const emptyMetrics = Object.fromEntries(METRIC_FIELDS.map((f) => [f.key, 0]));

export default function ImpactManager({ chapterId, canManage }: { chapterId: string; canManage: boolean }) {
  const { data, loading, reload } = useResource<{ items: Report[] }>(`/api/chapters/${chapterId}/impact`);
  const items = data?.items ?? [];
  const [period, setPeriod] = useState<"monthly" | "quarterly" | "annual">("monthly");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [metrics, setMetrics] = useState<Record<string, number>>(emptyMetrics);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodStart || !periodEnd) {
      toast.error("Select a start and end date for this reporting period");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/chapters/${chapterId}/impact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period, periodStart, periodEnd, metrics }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      toast.success("Impact report submitted.");
      setMetrics(emptyMetrics);
      setPeriodStart("");
      setPeriodEnd("");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {canManage ? (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface-card p-6">
          <h3 className="font-display text-base font-semibold text-foreground-heading">Submit an impact report</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <select className={authInputCls} value={period} onChange={(e) => setPeriod(e.target.value as typeof period)} disabled={submitting}>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
            <input type="date" className={authInputCls} value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} disabled={submitting} />
            <input type="date" className={authInputCls} value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} disabled={submitting} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {METRIC_FIELDS.map((f) => (
              <div key={f.key}>
                <label className="mb-1.5 block text-xs font-medium text-foreground-heading">{f.label}</label>
                <input
                  type="number"
                  min={0}
                  className={authInputCls}
                  value={metrics[f.key]}
                  onChange={(e) => setMetrics({ ...metrics, [f.key]: Number(e.target.value) })}
                  disabled={submitting}
                />
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {submitting ? "Submitting…" : "Submit report"}
          </button>
        </form>
      ) : null}

      {loading ? (
        <Skeleton className="h-32" />
      ) : items.length === 0 ? (
        <EmptyState icon={BarChart3} title="No impact reports yet" description="Submit your chapter's first reporting period above." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs tracking-wide text-foreground-muted uppercase">
                <th className="px-4 py-3 font-semibold">Period</th>
                <th className="px-4 py-3 font-semibold">Events</th>
                <th className="px-4 py-3 font-semibold">Farmers</th>
                <th className="px-4 py-3 font-semibold">Startups</th>
                <th className="px-4 py-3 font-semibold">FPOs</th>
                <th className="px-4 py-3 font-semibold">Jobs</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r._id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground-body">
                    {new Date(r.periodStart).toLocaleDateString()} – {new Date(r.periodEnd).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{r.metrics.eventsConducted}</td>
                  <td className="px-4 py-3">{r.metrics.farmersReached}</td>
                  <td className="px-4 py-3">{r.metrics.startupsSupported}</td>
                  <td className="px-4 py-3">{r.metrics.fpoSupported}</td>
                  <td className="px-4 py-3">{r.metrics.jobsCreated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
