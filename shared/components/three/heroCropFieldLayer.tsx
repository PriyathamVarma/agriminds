"use client";

import { useRef } from "react";
import Image from "next/image";
import { useScroll } from "framer-motion";
import CropFieldBackground from "./cropFieldBackground";

/**
 * The hero's background image + crop-field scene, scoped to the hero's own scroll
 * progress (0 at load, 1 once scrolled past it) so the field can settle as the page
 * transitions into the next section. Kept as a small client boundary so app/page.tsx
 * can stay a server component.
 */
export default function HeroCropFieldLayer({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <Image src={src} alt={alt} fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/75 to-deep/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-deep/70 via-deep/10 to-deep/50" />
      <CropFieldBackground
        className="absolute inset-x-0 bottom-0 h-[65%] mix-blend-screen opacity-80"
        progress={scrollYProgress}
      />
    </div>
  );
}
