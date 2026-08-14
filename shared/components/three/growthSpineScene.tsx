"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { createLowPowerRenderer, disposeObject3D, isLowPowerDevice, prefersReducedMotion } from "./webgl";
import { useInViewport } from "./useInViewport";

/**
 * An organic "growth spine" — a wandering stem-like line, revealed top-to-bottom
 * as `progress` (0..1, scroll-through of the roadmap section) advances, with a
 * warm glowing tip at the growth front and a handful of particles drifting
 * along the already-grown portion. Fills its container edge-to-edge.
 */

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision mediump float;
  uniform float uProgress;
  uniform float uTime;
  uniform vec3 uColorBase;
  uniform vec3 uColorTip;
  uniform vec3 uColorGlow;
  varying vec2 vUv;

  void main() {
    // Roadmap reads top-to-bottom: "travelled" is the grown fraction from the top.
    float travelled = 1.0 - vUv.y;

    // Organic wander of the stem's centerline across the strip.
    float wander = sin(vUv.y * 14.0 + uTime * 0.06) * 0.09
                 + sin(vUv.y * 4.0 - uTime * 0.03) * 0.05;
    float center = 0.5 + wander;
    float dist = abs(vUv.x - center);

    float thickness = 0.024 + 0.005 * sin(vUv.y * 30.0 + uTime * 0.4);
    float stem = smoothstep(thickness, thickness * 0.35, dist);
    float bloom = smoothstep(thickness * 3.4, thickness * 0.6, dist) * 0.3;

    // Soft reveal edge — nothing beyond what's grown so far.
    float grown = 1.0 - smoothstep(uProgress - 0.015, uProgress + 0.015, travelled);

    // Warm glow right at the growing tip.
    float tip = (1.0 - smoothstep(0.0, 0.05, abs(travelled - uProgress))) * grown;

    vec3 color = mix(uColorBase, uColorTip, clamp(travelled * 1.3, 0.0, 1.0));
    color = mix(color, uColorGlow, tip * 0.85);

    float alpha = (stem + bloom) * grown + tip * 0.5;
    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`;

function wanderX(travelled: number, t: number): number {
  const y = 1 - travelled;
  return 0.5 + Math.sin(y * 14 + t * 0.06) * 0.09 + Math.sin(y * 4 - t * 0.03) * 0.05;
}

export default function GrowthSpineScene({
  progress,
  className,
}: {
  progress: MotionValue<number>;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInViewport(containerRef, "25% 0px");

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !inView) return;

    const reduceMotion = prefersReducedMotion();
    const lowPower = isLowPowerDevice();

    const renderer = createLowPowerRenderer();
    if (!renderer) return;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // Fixed full-bleed orthographic camera — the plane always fills the container exactly,
    // no aspect-dependent frustum math needed for a background quad like this.
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uColorBase: { value: new THREE.Color("#1f4d3a") },
        uColorTip: { value: new THREE.Color("#c1712f") },
        uColorGlow: { value: new THREE.Color("#f3e1cc") },
      },
    });
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    const particleCount = reduceMotion ? 0 : lowPower ? 6 : 14;
    const particlePositions = new Float32Array(particleCount * 3);
    const particlePhase = new Float32Array(particleCount);
    const particleSpeed = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      particlePhase[i] = Math.random();
      particleSpeed[i] = 0.05 + Math.random() * 0.05;
      particlePositions[i * 3 + 1] = 999; // hidden until first frame places them
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: new THREE.Color("#f3e1cc"),
      size: 0.028,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    if (particleCount > 0) scene.add(particles);

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      renderer.setSize(clientWidth, clientHeight);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const clock = new THREE.Clock();

    const renderFrame = () => {
      const t = clock.getElapsedTime();
      const p = progress.get();
      material.uniforms.uTime.value = t;
      material.uniforms.uProgress.value = p;

      if (particleCount > 0) {
        const posAttr = particleGeometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < particleCount; i++) {
          const travelled = (particlePhase[i] + t * particleSpeed[i]) % 1;
          if (travelled > p - 0.01) {
            posAttr.setY(i, 999); // not grown yet — keep offscreen
            continue;
          }
          const x = (wanderX(travelled, t) - 0.5) * 2;
          const y = 1 - 2 * travelled;
          posAttr.setX(i, x);
          posAttr.setY(i, y);
          posAttr.setZ(i, 0.02);
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    renderFrame();

    let frameId = 0;
    let running = true;
    const loop = () => {
      if (!running) return;
      renderFrame();
      frameId = requestAnimationFrame(loop);
    };

    // Reduced motion: still respond to the user's own scrolling, just no autonomous animation loop.
    let unsubscribe: (() => void) | undefined;
    if (!reduceMotion) {
      frameId = requestAnimationFrame(loop);
    } else {
      unsubscribe = progress.on("change", renderFrame);
    }

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      unsubscribe?.();
      resizeObserver.disconnect();
      disposeObject3D(scene);
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [inView, progress]);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
}
