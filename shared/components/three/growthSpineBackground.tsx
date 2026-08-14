"use client";

import dynamic from "next/dynamic";
import type { MotionValue } from "framer-motion";

const GrowthSpineScene = dynamic(() => import("./growthSpineScene"), { ssr: false });

export default function GrowthSpineBackground({
  progress,
  className,
}: {
  progress: MotionValue<number>;
  className?: string;
}) {
  return <GrowthSpineScene progress={progress} className={className} />;
}
