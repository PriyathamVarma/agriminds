"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { prefersReducedMotion, isWebGLAvailable } from "@/shared/components/three/webgl";
import LaunchBackground from "./launchBackground";
import LaunchTitleOverlay from "./launchTitleOverlay";
import type { LaunchPhase } from "./launchTimeline";
import { cx } from "@/shared/lib/utils";

type LaunchState = "idle" | "launching" | "fallback";

const FALLBACK_FADE_MS = 550;
const SKIP_CONTROL_DELAY_MS = 1800;

// The capability check never changes after mount, so there's nothing to subscribe to —
// useSyncExternalStore is used purely for its SSR-safe snapshot semantics (server always
// sees "not capable", the client re-evaluates for real on its first paint, no effect needed).
function subscribeNever() {
  return () => {};
}
function getCapabilitySnapshot() {
  return !prefersReducedMotion() && isWebGLAvailable();
}
function getServerCapabilitySnapshot() {
  return false;
}

export default function LaunchExperience() {
  const router = useRouter();
  const [state, setState] = useState<LaunchState>("idle");
  const [fallbackVisible, setFallbackVisible] = useState(false);
  const capable = useSyncExternalStore(subscribeNever, getCapabilitySnapshot, getServerCapabilitySnapshot);
  const [sceneReady, setSceneReady] = useState(false);
  const [skipVisible, setSkipVisible] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [phase, setPhase] = useState<LaunchPhase>("germination");
  // The whole world is procedural geometry — nothing to preload, so readiness is just
  // "the Three.js scene has mounted and rendered its first frame" (or immediate for fallback).
  const ready = sceneReady || !capable;

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

  useEffect(() => {
    if (state !== "launching") return;
    const timeout = window.setTimeout(() => setSkipVisible(true), SKIP_CONTROL_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [state]);

  const handleSceneReady = useCallback(() => setSceneReady(true), []);
  const handleComplete = useCallback(() => {
    router.push("/");
  }, [router]);
  const handlePhaseChange = useCallback((next: LaunchPhase) => setPhase(next), []);

  const handleClick = () => {
    if (state !== "idle" || !ready) return;
    if (!capable) {
      setState("fallback");
      return;
    }
    setState("launching");
  };

  const handleSkip = () => {
    if (state !== "launching" || skipped) return;
    setSkipped(true);
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0f1d16]">
      {/* Minimal premium backdrop — a soft warm glow over the site's deep-forest base. Sits behind
          the canvas (which paints its own opaque sky once mounted) and stands in on its own for the
          no-WebGL / reduced-motion path, where no 3D scene mounts at all. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 46%, rgba(224,160,90,0.16) 0%, rgba(31,77,58,0.14) 45%, rgba(15,29,22,0) 75%)",
        }}
      />
      <div aria-hidden className="animate-launch-glow absolute inset-0" style={{ background: "radial-gradient(38% 32% at 50% 48%, rgba(243,225,204,0.14) 0%, rgba(243,225,204,0) 70%)" }} />

      {capable && (
        <LaunchBackground
          launching={state === "launching"}
          skip={skipped}
          onReady={handleSceneReady}
          onComplete={handleComplete}
          onPhaseChange={handlePhaseChange}
          className="absolute inset-0 z-10"
        />
      )}

      {(state === "launching" || state === "fallback") && (
        <LaunchTitleOverlay phase={state === "fallback" ? "ecosystem" : phase} />
      )}

      <div className="relative z-20 flex h-full w-full flex-col items-center justify-center gap-4 px-6">
        <button
          type="button"
          onClick={handleClick}
          disabled={state !== "idle" || !ready}
          className={cx(
            "inline-flex items-center gap-3 rounded-full bg-accent px-10 py-5 text-lg font-semibold text-accent-foreground shadow-[0_8px_40px_-8px_rgba(193,113,47,0.55)] transition-opacity duration-500 ease-out hover:bg-accent-hover",
            state === "idle" && ready ? "animate-launch-pulse opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          Launch
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {state === "launching" && (
        <button
          type="button"
          onClick={handleSkip}
          disabled={skipped}
          className={cx(
            "absolute right-6 bottom-6 z-30 rounded-full border border-deep-foreground/25 px-4 py-2 text-xs font-medium text-deep-foreground/70 backdrop-blur-sm transition-all duration-500 ease-out hover:border-deep-foreground/50 hover:text-deep-foreground sm:right-8 sm:bottom-8",
            skipVisible && !skipped ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          Skip
        </button>
      )}

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
