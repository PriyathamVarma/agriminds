import type { MetadataRoute } from "next";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { Chapter } from "@/shared/models/chapter";

const BASE_URL = "https://agriminds.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ["/", "/chapters", "/blog", "/blog/launch-event", "/blog/market-place", "/blog/agripreneurship-in-vizag", "/videos", "/partners", "/links", "/Agritech-summit-2026", "/chapters/vizag/meets/ai-in-agri-future"];
  try {
    await connectToDatabase();
    const chapters = await Chapter.find({ status: "active", isPublic: true }).select("slug").lean();
    routes.push(...chapters.map((chapter) => `/chapters/${chapter.slug}`));
  } catch {
    // Keep the sitemap available if the database is temporarily unavailable.
  }
  return [...new Set(routes)].map((path) => ({ url: `${BASE_URL}${path}` }));
}
