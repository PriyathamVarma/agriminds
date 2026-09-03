import type { Metadata } from "next";
import { SITE } from "@/shared/data/agriminds";
import ChaptersDirectory from "@/shared/components/chapters/chaptersDirectory";

export const metadata: Metadata = {
  title: `Chapters — ${SITE.name}`,
  description: "Find an AgriMinds chapter near you, or apply to join the movement.",
};

export default function ChaptersDirectoryPage() {
  return <ChaptersDirectory />;
}
