import type { Metadata } from "next";
import { SITE } from "@/shared/data/agriminds";
import SectionHeading from "@/shared/components/molecules/sectionHeading";
import LaunchEventHighlights from "@/shared/components/blog/launchEventHighlights";
import LaunchEventGallery from "@/shared/components/blog/launchEventGallery";
import LaunchEventSpeakers from "@/shared/components/blog/launchEventSpeakers";

export const metadata: Metadata = {
  title: `Our Launch Event — ${SITE.name}`,
  description: `Photos, speakers, and highlights from the ${SITE.name} Ecosystem Foundation's launch event in Vizag.`,
};

export default function LaunchEventPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-24 pb-14 sm:px-8 sm:pt-32">
        <SectionHeading
          eyebrow="From the Community"
          title="Our Launch Event"
          description="A look back at the moment the AgriMinds Ecosystem Foundation came together in Vizag to kick off the movement — farmers, founders, and partners in one room, from a single chapter to a nationwide network."
        />
      </section>
      <LaunchEventHighlights />
      <LaunchEventGallery />
      <LaunchEventSpeakers />
    </>
  );
}
