import type { Metadata } from "next";
import { SITE } from "@/shared/data/agriminds";
import ChapterComingSoon from "@/shared/components/chapters/chapterComingSoon";

export const metadata: Metadata = { title: `Vijayawada Chapter Coming Soon — ${SITE.name}`, description: "The AgriMinds Vijayawada chapter is coming soon." };
export default function VijayawadaChapterPage() { return <ChapterComingSoon city="Vijayawada" />; }
