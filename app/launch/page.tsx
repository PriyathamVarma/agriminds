import type { Metadata } from "next";
import { SITE } from "@/shared/data/agriminds";
import LaunchExperience from "@/shared/components/launch/launchExperience";

export const metadata: Metadata = {
  title: `Launch — ${SITE.name}`,
  description: SITE.description,
};

export default function LaunchPage() {
  return <LaunchExperience />;
}
