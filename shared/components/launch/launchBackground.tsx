"use client";

import dynamic from "next/dynamic";

const LaunchScene = dynamic(() => import("./launchScene"), { ssr: false });

export default function LaunchBackground({ onComplete, className }: { onComplete: () => void; className?: string }) {
  return <LaunchScene onComplete={onComplete} className={className} />;
}
