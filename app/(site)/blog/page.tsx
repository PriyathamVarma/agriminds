import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE } from "@/shared/data/agriminds";
import SectionHeading from "@/shared/components/molecules/sectionHeading";

export const metadata: Metadata = {
  title: `Blog — ${SITE.name}`,
  description: "Stories, event highlights, and updates from the AgriMinds community.",
};

export default function BlogPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <SectionHeading eyebrow="From the Community" title="Blog" description="Stories, milestones, and moments from the AgriMinds community." />
      <ul className="mt-12 space-y-6">
        <li>
          <article className="rounded-3xl border border-border bg-surface-card p-6 sm:p-9">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">Marketplace · Vizag · 2–3 October 2026</p>
            <h2 className="font-display mt-3 text-2xl font-semibold text-foreground-heading sm:text-3xl">
              <Link href="/blog/market-place" className="hover:text-primary">Market Place: Connecting Agri-Entrepreneurs with Customers</Link>
            </h2>
            <p className="mt-4 max-w-3xl leading-relaxed text-foreground-body">Over two days at RTIH, Vizag, 23 FPOs, farmer groups, and emerging agri-food enterprises brought authentic food, wellness, and rural products directly to more than 1,500 visitors.</p>
            <Link href="/blog/market-place" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Read the marketplace story <ArrowRight className="h-4 w-4" /></Link>
          </article>
        </li>
        <li>
          <article className="rounded-3xl border border-border bg-surface-card p-6 sm:p-9">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">Event highlights · Vizag</p>
            <h2 className="font-display mt-3 text-2xl font-semibold text-foreground-heading sm:text-3xl">
              <Link href="/blog/launch-event" className="hover:text-primary">Our Launch Event</Link>
            </h2>
            <p className="mt-4 max-w-3xl leading-relaxed text-foreground-body">The beginning of the AgriMinds Ecosystem Foundation — farmers, founders, and partners coming together in Vizag. Explore the highlights, photographs, and guests who joined us to launch the movement.</p>
            <Link href="/blog/launch-event" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Read the launch event story <ArrowRight className="h-4 w-4" /></Link>
          </article>
        </li>
      </ul>
    </section>
  );
}
