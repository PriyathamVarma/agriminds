import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/dashboard/", "/api/", "/login", "/register", "/forgot-password", "/reset-password", "/coming-soon", "/chapters/vijayawada", "/chapters/kurnool", "/chapters/tirupati"] }],
    sitemap: "https://agriminds.in/sitemap.xml",
  };
}
