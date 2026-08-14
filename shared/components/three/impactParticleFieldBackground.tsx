"use client";

import dynamic from "next/dynamic";

const ImpactParticleFieldScene = dynamic(() => import("./impactParticleFieldScene"), { ssr: false });

export default function ImpactParticleFieldBackground({ className }: { className?: string }) {
  return <ImpactParticleFieldScene className={className} />;
}
