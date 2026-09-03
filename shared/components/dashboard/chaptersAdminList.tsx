"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Plus, Search, Building2 } from "lucide-react";
import { authInputCls } from "@/shared/components/auth/formField";
import StatusBadge, { toneForStatus } from "@/shared/components/dashboard/statusBadge";
import EmptyState from "@/shared/components/dashboard/emptyState";
import Skeleton from "@/shared/components/dashboard/skeleton";
import { useResource } from "@/shared/lib/hooks/useResource";

type Chapter = { _id: string; name: string; code: string; city: string; state: string; status: string; type: string };

const emptyForm = { name: "", state: "", city: "", district: "", type: "district" };

export default function ChaptersAdminList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (status) params.set("status", status);
    params.set("limit", "50");
    return params.toString();
  }, [search, status]);

  const { data, loading, reload } = useResource<{ items: Chapter[]; total: number }>(`/api/chapters?${query}`);
  const items = data?.items ?? [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.state.trim()) {
      toast.error("Chapter name and state are required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      toast.success("Chapter created — set it live from its detail page.");
      setForm(emptyForm);
      setShowCreate(false);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input className={`${authInputCls} pl-10`} placeholder="Search chapters…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className={authInputCls} value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 180 }}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="archived">Archived</option>
        </select>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" />
          New chapter
        </button>
      </div>

      {showCreate ? (
        <form onSubmit={handleCreate} className="rounded-2xl border border-border bg-surface-card p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={authInputCls} placeholder="Chapter name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={creating} />
            <select className={authInputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} disabled={creating}>
              <option value="district">District</option>
              <option value="state">State</option>
              <option value="institutional">Institutional</option>
              <option value="regional">Regional</option>
            </select>
            <input className={authInputCls} placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} disabled={creating} />
            <input className={authInputCls} placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} disabled={creating} />
            <input className={authInputCls} placeholder="District" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} disabled={creating} />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {creating ? "Creating…" : "Create chapter"}
          </button>
        </form>
      ) : null}

      {loading ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Building2} title="No chapters found" description="Adjust your filters, or create the first chapter." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs tracking-wide text-foreground-muted uppercase">
                <th className="px-4 py-3 font-semibold">Chapter</th>
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id} className="border-b border-border last:border-0 hover:bg-surface">
                  <td className="px-4 py-3">
                    <Link href={`/admin/chapters/${c._id}`} className="font-semibold text-foreground-heading hover:text-primary hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">{c.code}</td>
                  <td className="px-4 py-3 text-foreground-body">
                    {c.city ? `${c.city}, ` : ""}
                    {c.state}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={c.status} tone={toneForStatus(c.status)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
