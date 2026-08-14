"use client";

import dynamic from "next/dynamic";
import type { MotionValue } from "framer-motion";

const CropFieldScene = dynamic(() => import("./cropFieldScene"), { ssr: false });

export default function CropFieldBackground({
  className,
  progress,
}: {
  className?: string;
  progress?: MotionValue<number>;
}) {
  return (
    <div className={className} aria-hidden="true">
      <CropFieldScene progress={progress} />
    </div>
  );
}
