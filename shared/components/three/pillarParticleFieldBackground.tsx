"use client";

import dynamic from "next/dynamic";

const PillarParticleFieldScene = dynamic(() => import("./pillarParticleFieldScene"), { ssr: false });

export default function PillarParticleFieldBackground({ className }: { className?: string }) {
  return <PillarParticleFieldScene className={className} />;
}
