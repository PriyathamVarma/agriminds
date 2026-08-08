"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { cx } from "@/shared/lib/utils";

export default function ParallaxImage({
  src,
  alt,
  className,
  imgClassName,
  strength = 40,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  strength?: number;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength]);

  return (
    <div ref={ref} className={cx("relative overflow-hidden", className)}>
      <motion.div style={{ y }} className="absolute inset-[-8%]">
        <Image
          src={`${src}?auto=format&fit=crop&w=1400&q=75`}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className={cx("object-cover", imgClassName)}
        />
      </motion.div>
    </div>
  );
}
