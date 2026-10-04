import type { Metadata } from "next";
import { SITE } from "@/shared/data/agriminds";
import ChapterComingSoon from "@/shared/components/chapters/chapterComingSoon";

export const metadata: Metadata = { title: `Tirupati Chapter Coming Soon — ${SITE.name}`, description: "The AgriMinds Tirupati chapter is coming soon." };
export default function TirupatiChapterPage() { return <ChapterComingSoon city="Tirupati" />; }
