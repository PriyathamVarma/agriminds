"use client";

import dynamic from "next/dynamic";

const CropFieldScene = dynamic(() => import("./cropFieldScene"), { ssr: false });

export default function CropFieldBackground({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <CropFieldScene />
    </div>
  );
}
