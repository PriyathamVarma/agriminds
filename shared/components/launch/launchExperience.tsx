"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { prefersReducedMotion, isWebGLAvailable } from "@/shared/components/three/webgl";
import LaunchBackground from "./launchBackground";
import { cx } from "@/shared/lib/utils";

type LaunchState = "idle" | "launching" | "fallback";

const FALLBACK_FADE_MS = 550;

export default function LaunchExperience() {
  const router = useRouter();
  const [state, setState] = useState<LaunchState>("idle");
  const [fallbackVisible, setFallbackVisible] = useState(false);

  // Full-screen, no scroll, no layout shift for the lifetime of this route.
  useEffect(() => {
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  useEffect(() => {
    if (state !== "fallback") return;
    const frame = requestAnimationFrame(() => setFallbackVisible(true));
    const timeout = window.setTimeout(() => router.push("/"), FALLBACK_FADE_MS);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [state, router]);

  const handleComplete = useCallback(() => {
    router.push("/");
  }, [router]);

  const handleClick = () => {
    if (state !== "idle") return;
    if (prefersReducedMotion() || !isWebGLAvailable()) {
      setState("fallback");
      return;
    }
    setState("launching");
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0f1d16]">
      {/* Minimal premium backdrop — a soft warm glow over the site's deep-forest base. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 46%, rgba(224,160,90,0.16) 0%, rgba(31,77,58,0.14) 45%, rgba(15,29,22,0) 75%)",
        }}
      />
      <div aria-hidden className="animate-launch-glow absolute inset-0" style={{ background: "radial-gradient(38% 32% at 50% 48%, rgba(243,225,204,0.14) 0%, rgba(243,225,204,0) 70%)" }} />

      {state === "launching" && (
        <LaunchBackground onComplete={handleComplete} className="absolute inset-0 z-10" />
      )}

      <div className="relative z-20 flex h-full w-full items-center justify-center px-6">
        <button
          type="button"
          onClick={handleClick}
          disabled={state !== "idle"}
          className={cx(
            "inline-flex items-center gap-3 rounded-full bg-accent px-10 py-5 text-lg font-semibold text-accent-foreground shadow-[0_8px_40px_-8px_rgba(193,113,47,0.55)] transition-opacity duration-500 ease-out hover:bg-accent-hover",
            state === "idle" ? "animate-launch-pulse opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          Launch
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {state === "fallback" && (
        <div
          aria-hidden
          className="absolute inset-0 z-30 bg-[#0f1d16] transition-opacity duration-500 ease-in-out"
          style={{ opacity: fallbackVisible ? 1 : 0 }}
        />
      )}
    </div>
  );
}
