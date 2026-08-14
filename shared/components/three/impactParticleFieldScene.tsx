"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createLowPowerRenderer, disposeObject3D, isLowPowerDevice, prefersReducedMotion } from "./webgl";
import { useInViewport } from "./useInViewport";

/**
 * A gentle rising particle field behind the impact stat grid. Gets a brief "bloom" —
 * a touch more spread, brightness, and rise speed — right as the section enters view,
 * roughly in step with the CounterStat counters starting their own count-up (both key
 * off scroll-into-view), then settles back to a calm ambient drift.
 */

const VERTEX_SHADER = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  uniform float uPixelRatio;
  varying float vSeed;

  void main() {
    vSeed = aSeed;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio;
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision mediump float;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vSeed;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float alpha = smoothstep(0.5, 0.1, d) * 0.6;
    if (alpha <= 0.01) discard;
    vec3 color = mix(uColorA, uColorB, vSeed);
    gl_FragColor = vec4(color, alpha);
  }
`;

export default function ImpactParticleFieldScene({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInViewport(containerRef, "10% 0px");

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !inView) return;

    const reduceMotion = prefersReducedMotion();
    const lowPower = isLowPowerDevice();

    const renderer = createLowPowerRenderer();
    if (!renderer) return;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    const count = reduceMotion ? 18 : lowPower ? 24 : 46;
    const basePositions = new Float32Array(count * 2);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const seeds = new Float32Array(count);
    const speeds = new Float32Array(count);
    const drift = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 2 * 0.9;
      const y = (Math.random() - 0.5) * 2;
      basePositions[i * 2] = x;
      basePositions[i * 2 + 1] = y;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = 0;
      sizes[i] = 2.5 + Math.random() * 3.5;
      seeds[i] = Math.random();
      speeds[i] = 0.03 + Math.random() * 0.05;
      drift[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.75) },
        uColorA: { value: new THREE.Color("#c1712f") },
        uColorB: { value: new THREE.Color("#f3e1cc") },
      },
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      renderer.setSize(clientWidth, clientHeight);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    const enteredAt = clock.getElapsedTime();

    const renderFrame = () => {
      const t = clock.getElapsedTime();
      const sinceEntered = t - enteredAt;
      // Rises over ~1s, holds briefly, settles back down by ~3s — timed to roughly
      // coincide with the stat counters counting up right as this section comes into view.
      const bloom = reduceMotion
        ? 0
        : THREE.MathUtils.smoothstep(sinceEntered, 0, 1) * (1 - THREE.MathUtils.smoothstep(sinceEntered, 1.6, 3.2));

      if (!reduceMotion) {
        const posAttr = geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < count; i++) {
          const riseSpeed = speeds[i] * (1 + bloom * 1.8);
          let y = posAttr.getY(i) + riseSpeed * 0.016;
          if (y > 1.1) y = -1.1;
          const sway = Math.sin(t * 0.5 + drift[i]) * (0.02 + bloom * 0.05);
          posAttr.setX(i, basePositions[i * 2] + sway);
          posAttr.setY(i, y);
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
    if (!reduceMotion) {
      frameId = requestAnimationFrame(loop);
    }

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      disposeObject3D(scene);
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [inView]);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
}
