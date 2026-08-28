"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import { prefersReducedMotion, isWebGLAvailable } from "@/shared/components/three/webgl";
import LaunchBackground from "./launchBackground";
import LaunchTitleOverlay from "./launchTitleOverlay";
import type { LaunchPhase } from "./launchTimeline";
import { cx } from "@/shared/lib/utils";

type LaunchState = "idle" | "launching" | "fallback";

const FALLBACK_FADE_MS = 550;
const SKIP_CONTROL_DELAY_MS = 1800;
const AUDIO_SRC = encodeURI("/music/Dust and Starlight.mp3");
const AUDIO_TARGET_VOLUME = 0.55;
const AUDIO_FADE_IN_MS = 900;
const AUDIO_FADE_OUT_MS = 1200;
const AUDIO_SKIP_FADE_OUT_MS = 400;

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
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioFadeFrameRef = useRef<number | null>(null);
  // The whole world is procedural geometry — nothing to preload, so readiness is just
  // "the Three.js scene has mounted and rendered its first frame" (or immediate for fallback).
  const ready = sceneReady || !capable;

  const fadeAudioTo = useCallback((target: number, durationMs: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audioFadeFrameRef.current !== null) cancelAnimationFrame(audioFadeFrameRef.current);
    const start = audio.volume;
    const startTime = performance.now();
    const step = (now: number) => {
      // Clamp both ends — rAF's first callback can fire with `now` a hair before `startTime`
      // (timestamp rounding), which briefly drove t negative and threw on the volume setter,
      // silently killing the whole fade loop.
      const t = Math.max(0, Math.min(1, (now - startTime) / durationMs));
      audio.volume = Math.max(0, Math.min(1, start + (target - start) * t));
      if (t < 1) {
        audioFadeFrameRef.current = requestAnimationFrame(step);
      } else {
        audioFadeFrameRef.current = null;
        if (target === 0) audio.pause();
      }
    };
    audioFadeFrameRef.current = requestAnimationFrame(step);
  }, []);

  // Muting is independent of the fade envelope above — .muted silences output instantly
  // without disturbing the .volume ramp driving the fade in/out.
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  // The music fades out as the camera dives into the canopy, so it never plays under the
  // dissolve into the homepage.
  useEffect(() => {
    if (phase === "transition") fadeAudioTo(0, AUDIO_FADE_OUT_MS);
  }, [phase, fadeAudioTo]);

  // Belt-and-braces: pause on unmount so nothing bleeds into the next route.
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audioFadeFrameRef.current !== null) cancelAnimationFrame(audioFadeFrameRef.current);
      audio?.pause();
    };
  }, []);

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
    // Started synchronously inside the click handler so the browser credits it to this
    // user gesture — deferring it to an effect risks autoplay-with-sound being blocked.
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0;
      audio.currentTime = 0;
      audio.play().catch(() => {});
      fadeAudioTo(AUDIO_TARGET_VOLUME, AUDIO_FADE_IN_MS);
    }
  };

  const handleSkip = () => {
    if (state !== "launching" || skipped) return;
    setSkipped(true);
    fadeAudioTo(0, AUDIO_SKIP_FADE_OUT_MS);
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0f1d16]">
      {/* Only mounted for the real capable/launching path — never plays under the fallback,
          which redirects almost immediately anyway. */}
      {capable && <audio ref={audioRef} src={AUDIO_SRC} preload="auto" aria-hidden="true" />}

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

      {/* Kept visually and functionally separate from Skip — its own control on the opposite
          corner, so muting can never be mistaken for (or interfere with) skipping. */}
      {state === "launching" && (
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute background music" : "Mute background music"}
          aria-pressed={muted}
          className={cx(
            "absolute bottom-6 left-6 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-deep-foreground/25 text-deep-foreground/70 backdrop-blur-sm transition-all duration-500 ease-out hover:border-deep-foreground/50 hover:text-deep-foreground sm:bottom-8 sm:left-8",
            skipVisible ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
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
