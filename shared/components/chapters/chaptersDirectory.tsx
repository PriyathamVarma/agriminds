"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, MapPin, BadgeCheck } from "lucide-react";
import { authInputCls } from "@/shared/components/auth/formField";
import EmptyState from "@/shared/components/dashboard/emptyState";
import Skeleton from "@/shared/components/dashboard/skeleton";
import SectionHeading from "@/shared/components/molecules/sectionHeading";
import { useResource } from "@/shared/lib/hooks/useResource";

type Chapter = { _id: string; slug: string; name: string; city: string; state: string; type: string; description: string };

export default function ChaptersDirectory() {
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [type, setType] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (state) params.set("state", state);
    if (type) params.set("type", type);
    params.set("limit", "50");
    return params.toString();
  }, [search, state, type]);

  const { data, loading } = useResource<{ items: Chapter[] }>(`/api/chapters?${query}`);
  const items = useMemo(() => data?.items ?? [], [data]);
  const states = useMemo(() => Array.from(new Set(items.map((c) => c.state))).sort(), [items]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <SectionHeading eyebrow="The Network" title="AgriMinds Chapters" description="Find a chapter near you, or apply to bring AgriMinds to your city." align="center" />

      <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input className={`${authInputCls} pl-10`} placeholder="Search chapters…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className={authInputCls} value={state} onChange={(e) => setState(e.target.value)} style={{ width: 160 }}>
          <option value="">All states</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select className={authInputCls} value={type} onChange={(e) => setType(e.target.value)} style={{ width: 160 }}>
          <option value="">All types</option>
          <option value="district">District</option>
          <option value="state">State</option>
          <option value="institutional">Institutional</option>
          <option value="regional">Regional</option>
        </select>
      </div>

      <div className="mt-10">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState title="No chapters found" description="Try a different search, or propose a new chapter from your dashboard." />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
              <Link
                key={c._id}
                href={`/chapters/${c.slug}`}
                className="group rounded-3xl border border-border bg-surface-card p-6 transition hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 flex-none text-primary" />
                  <p className="text-xs font-semibold tracking-wide text-primary uppercase">Verified chapter</p>
                </div>
                <h3 className="font-display mt-3 text-lg font-semibold text-foreground-heading group-hover:text-accent">{c.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-foreground-muted">
                  <MapPin className="h-3.5 w-3.5" />
                  {c.city ? `${c.city}, ` : ""}
                  {c.state}
                </p>
                {c.description ? <p className="mt-3 line-clamp-2 text-sm text-foreground-body">{c.description}</p> : null}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
