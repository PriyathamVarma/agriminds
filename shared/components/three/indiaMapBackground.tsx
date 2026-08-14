"use client";

import dynamic from "next/dynamic";
import type { MotionValue } from "framer-motion";

const IndiaMapScene = dynamic(() => import("./indiaMapScene"), { ssr: false });

export default function IndiaMapBackground({
  progress,
  className,
}: {
  progress: MotionValue<number>;
  className?: string;
}) {
  return <IndiaMapScene progress={progress} className={className} />;
}
