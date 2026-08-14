"use client";

import dynamic from "next/dynamic";
import type { MotionValue } from "framer-motion";

const IndiaExpansionScene = dynamic(() => import("./indiaExpansionScene"), { ssr: false });

export default function IndiaExpansionBackground({
  progress,
  className,
}: {
  progress: MotionValue<number>;
  className?: string;
}) {
  return <IndiaExpansionScene progress={progress} className={className} />;
}
