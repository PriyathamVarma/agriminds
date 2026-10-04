import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE } from "@/shared/data/agriminds";
import SectionHeading from "@/shared/components/molecules/sectionHeading";
import { BLOG_POSTS } from "@/shared/data/blog";

export const metadata: Metadata = {
  title: `Blog — ${SITE.name}`,
  description: "Stories, event highlights, and updates from the AgriMinds community.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <SectionHeading eyebrow="From the Community" title="Blog" description="Stories, milestones, and moments from the AgriMinds community." />
      <ul className="mt-12 space-y-6">{BLOG_POSTS.map((post) => <li key={post.slug}><article className="rounded-3xl border border-border bg-surface-card p-6 sm:p-9"><p className="text-xs font-semibold tracking-widest text-primary uppercase">{post.category} · {post.location}</p><h2 className="font-display mt-3 text-2xl font-semibold text-foreground-heading sm:text-3xl"><Link href={`/blog/${post.slug}`} className="hover:text-primary">{post.title}</Link></h2><p className="mt-4 max-w-3xl leading-relaxed text-foreground-body">{post.description}</p><Link href={`/blog/${post.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Read the story <ArrowRight className="h-4 w-4" /></Link></article></li>)}</ul>
    </section>
  );
}
