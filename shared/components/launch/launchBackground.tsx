"use client";

import dynamic from "next/dynamic";
import type { LaunchPhase } from "./launchTimeline";

const LaunchScene = dynamic(() => import("./launchScene"), { ssr: false });

export default function LaunchBackground({
  launching,
  skip,
  onReady,
  onComplete,
  onPhaseChange,
  className,
}: {
  launching: boolean;
  skip: boolean;
  onReady: () => void;
  onComplete: () => void;
  onPhaseChange?: (phase: LaunchPhase) => void;
  className?: string;
}) {
  return (
    <LaunchScene
      launching={launching}
      skip={skip}
      onReady={onReady}
      onComplete={onComplete}
      onPhaseChange={onPhaseChange}
      className={className}
    />
  );
}
