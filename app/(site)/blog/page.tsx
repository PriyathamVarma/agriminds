import type { Metadata } from "next";
import { SITE } from "@/shared/data/agriminds";
import SectionHeading from "@/shared/components/molecules/sectionHeading";
import { BLOG_POSTS } from "@/shared/data/blog";
import BlogIndex from "@/shared/components/blog/blogIndex";

export const metadata: Metadata = {
  title: `Blog — ${SITE.name}`,
  description: "Stories, event highlights, and updates from the AgriMinds community.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <SectionHeading eyebrow="From the Community" title="Blog" description="Stories, milestones, and moments from the AgriMinds community." />
      <BlogIndex posts={BLOG_POSTS} />
    </section>
  );
}
