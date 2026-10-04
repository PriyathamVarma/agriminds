import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SITE } from "@/shared/data/agriminds";
import SectionHeading from "@/shared/components/molecules/sectionHeading";
import LaunchEventHighlights from "@/shared/components/blog/launchEventHighlights";
import LaunchEventGallery from "@/shared/components/blog/launchEventGallery";
import LaunchEventSpeakers from "@/shared/components/blog/launchEventSpeakers";
import Breadcrumbs from "@/shared/components/seo/breadcrumbs";
import RelatedContent from "@/shared/components/seo/relatedContent";

export const metadata: Metadata = {
  title: `Our Launch Event — ${SITE.name}`,
  description: `Photos, speakers, and highlights from the ${SITE.name} Ecosystem Foundation's launch event in Vizag.`,
  alternates: { canonical: "/blog/launch-event" },
};

export default function LaunchEventPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-24 pb-14 sm:px-8 sm:pt-32">
        <Breadcrumbs items={[{ name: "Blog", href: "/blog" }, { name: "Our Launch Event" }]} />
        <Link href="/blog" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Back to Blog</Link>
        <p className="mb-4 text-sm text-foreground-muted">AgriMinds Ecosystem Foundation · Vizag</p>
        <SectionHeading
          eyebrow="From the Community"
          title="Our Launch Event"
          description="A look back at the moment the AgriMinds Ecosystem Foundation came together in Vizag to kick off the movement — farmers, founders, and partners in one room, from a single chapter to a nationwide network."
        />
      </section>
      <LaunchEventHighlights />
      <LaunchEventGallery />
      <LaunchEventSpeakers />
      <RelatedContent items={[{ eyebrow: "Chapter", title: "Explore all chapters", href: "/chapters", description: "Find the growing local network around AgriMinds." }, { eyebrow: "Story", title: "Market Place in Vizag", href: "/blog/market-place", description: "Read about 23 enterprises meeting more than 1,500 visitors." }, { eyebrow: "Video", title: "Watch AgriMinds videos", href: "/videos", description: "Watch the events and stories behind the ecosystem." }]} />
    </>
  );
}
