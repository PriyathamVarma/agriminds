"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { BlogPost } from "@/shared/data/blog";

const PAGE_SIZE = 10;

export default function BlogIndex({ posts }: { posts: BlogPost[] }) {
  const [category, setCategory] = useState("All categories");
  const [month, setMonth] = useState("All dates");
  const [page, setPage] = useState(1);
  const categories = ["All categories", ...new Set(posts.map((post) => post.category))];
  const months = [...new Set(posts.map((post) => post.date.slice(0, 7)))].sort().reverse();
  const filtered = useMemo(() => posts.filter((post) => (category === "All categories" || post.category === category) && (month === "All dates" || post.date.startsWith(month))).sort((a, b) => b.date.localeCompare(a.date)), [category, month, posts]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const updateFilter = (setter: (value: string) => void, value: string) => { setter(value); setPage(1); };

  return (
    <div className="mt-12">
      <div className="grid gap-4 rounded-3xl border border-border bg-surface p-5 sm:grid-cols-2 sm:p-6">
        <label className="text-sm font-semibold text-foreground-heading">Category<select value={category} onChange={(event) => updateFilter(setCategory, event.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal text-foreground-body"><option>All categories</option>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-sm font-semibold text-foreground-heading">Month and year<select value={month} onChange={(event) => updateFilter(setMonth, event.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal text-foreground-body"><option>All dates</option>{months.map((item) => <option key={item} value={item}>{new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(`${item}-01T00:00:00`))}</option>)}</select></label>
      </div>
      <p className="mt-6 text-sm text-foreground-muted">Showing {visible.length} of {filtered.length} articles · Newest first</p>
      <ul className="mt-5 space-y-6">{visible.map((post) => <li key={post.slug}><article className="rounded-3xl border border-border bg-surface-card p-6 sm:p-9"><p className="text-xs font-semibold tracking-widest text-primary uppercase">{post.category} · {post.location}</p><p className="mt-2 text-sm text-foreground-muted"><time dateTime={post.date}>{new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${post.date}T00:00:00`))}</time></p><h2 className="font-display mt-3 text-2xl font-semibold text-foreground-heading sm:text-3xl"><Link href={`/blog/${post.slug}`} className="hover:text-primary">{post.title}</Link></h2><p className="mt-4 max-w-3xl leading-relaxed text-foreground-body">{post.description}</p><Link href={`/blog/${post.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Read the story <ArrowRight className="h-4 w-4" /></Link></article></li>)}</ul>
      {pageCount > 1 ? <nav className="mt-8 flex items-center justify-between" aria-label="Blog pagination"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Previous</button><span className="text-sm text-foreground-muted">Page {page} of {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40">Next <ChevronRight className="h-4 w-4" /></button></nav> : null}
    </div>
  );
}
