import type { Metadata } from "next";
import { SITE } from "@/shared/data/agriminds";
import ChapterComingSoon from "@/shared/components/chapters/chapterComingSoon";

export const metadata: Metadata = { title: `Kurnool Chapter Coming Soon — ${SITE.name}`, description: "The AgriMinds Kurnool chapter is coming soon.", robots: { index: false, follow: true } };
export default function KurnoolChapterPage() { return <ChapterComingSoon city="Kurnool" />; }
