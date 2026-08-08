"use client";

import { motion } from "framer-motion";

export default function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    // Opacity is never animated — content must always be visible even if JS is slow,
    // an observer never fires (fast/programmatic scroll, screenshot tools), or motion
    // is disabled. Only the transform is animated, as a bonus on top of visible content.
    <motion.div
      initial={{ y: 16 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
