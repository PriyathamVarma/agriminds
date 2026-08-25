import type { Metadata } from "next";
import { SITE } from "@/shared/data/agriminds";
import SocialLinksPage from "@/shared/components/links/socialLinksPage";

export const metadata: Metadata = {
  title: `Links — ${SITE.name}`,
  description: `Connect with the ${SITE.name} Ecosystem Foundation on LinkedIn, X, Instagram, and our website.`,
};

export default function LinksPage() {
  return <SocialLinksPage />;
}
