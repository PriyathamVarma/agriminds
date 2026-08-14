"use client";

import { useEffect, useState, type RefObject } from "react";

/** Tracks whether an element is near the viewport, so render loops can pause when scrolled far away. */
export function useInViewport<T extends HTMLElement>(
  ref: RefObject<T | null>,
  rootMargin = "20% 0px",
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView;
}
