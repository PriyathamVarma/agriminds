"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createLowPowerRenderer, disposeObject3D, isLowPowerDevice, prefersReducedMotion } from "./webgl";
import { useInViewport } from "./useInViewport";

/**
 * A small field of soil-grain/seed particles that gently scatter away from the
 * cursor and ease back to rest. Purely decorative — sits behind the featured
 * pillar tile's gradient and copy.
 */

const VERTEX_SHADER = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uPixelRatio;
  varying vec3 vColor;

  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio;
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision mediump float;
  varying vec3 vColor;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float alpha = smoothstep(0.5, 0.1, d) * 0.7;
    if (alpha <= 0.01) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

const EARTH_TONES = ["#c1712f", "#e0a05a", "#a8763f", "#f3e1cc"];

export default function PillarParticleFieldScene({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInViewport(containerRef, "10% 0px");

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !inView) return;

    const reduceMotion = prefersReducedMotion();
    const lowPower = isLowPowerDevice();
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const interactive = canHover && !reduceMotion;

    const renderer = createLowPowerRenderer();
    if (!renderer) return;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    const count = reduceMotion ? 24 : lowPower ? 30 : 70;
    const basePositions = new Float32Array(count * 2);
    const currentPositions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const wobbleSeed = new Float32Array(count);

    const colorObj = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 2 * 0.92;
      const y = (Math.random() - 0.5) * 2 * 0.92;
      basePositions[i * 2] = x;
      basePositions[i * 2 + 1] = y;
      currentPositions[i * 3] = x;
      currentPositions[i * 3 + 1] = y;
      currentPositions[i * 3 + 2] = 0;
      sizes[i] = 3 + Math.random() * 4;
      wobbleSeed[i] = Math.random() * Math.PI * 2;
      colorObj.set(EARTH_TONES[i % EARTH_TONES.length]);
      colors[i * 3] = colorObj.r;
      colors[i * 3 + 1] = colorObj.g;
      colors[i * 3 + 2] = colorObj.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(currentPositions, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.75) } },
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // This layer sits behind the tile's text overlay, which has no pointer-events-none
    // and fully covers the tile — so it, not this div, is what actually receives hit-tests.
    // Listening on the shared parent (the tile wrapper) catches pointer moves regardless
    // of which child was hit, since the event still bubbles up through it.
    const hoverTarget = container.parentElement ?? container;

    // Pointer position in the plane's -1..1 local space; far offscreen when idle/absent.
    const pointer = { x: 999, y: 999, active: false };
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointer.active = true;
    };
    const handlePointerLeave = () => {
      pointer.active = false;
    };

    if (interactive) {
      hoverTarget.addEventListener("pointermove", handlePointerMove);
      hoverTarget.addEventListener("pointerleave", handlePointerLeave);
    }

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      renderer.setSize(clientWidth, clientHeight);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const RADIUS = 0.35;
    const STRENGTH = 0.16;
    const EASE = 0.08;

    const clock = new THREE.Clock();
    const renderFrame = () => {
      const t = clock.getElapsedTime();
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;

      for (let i = 0; i < count; i++) {
        let targetX = basePositions[i * 2];
        let targetY = basePositions[i * 2 + 1];

        if (!reduceMotion) {
          // Gentle idle drift so the field never looks perfectly static.
          targetX += Math.sin(t * 0.4 + wobbleSeed[i]) * 0.01;
          targetY += Math.cos(t * 0.35 + wobbleSeed[i]) * 0.01;
        }

        if (interactive && pointer.active) {
          const dx = targetX - pointer.x;
          const dy = targetY - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < RADIUS && dist > 0.0001) {
            const force = (1 - dist / RADIUS) ** 2 * STRENGTH;
            targetX += (dx / dist) * force;
            targetY += (dy / dist) * force;
          }
        }

        const cx = posAttr.getX(i);
        const cy = posAttr.getY(i);
        posAttr.setX(i, cx + (targetX - cx) * EASE);
        posAttr.setY(i, cy + (targetY - cy) * EASE);
      }
      posAttr.needsUpdate = true;

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
      if (interactive) {
        hoverTarget.removeEventListener("pointermove", handlePointerMove);
        hoverTarget.removeEventListener("pointerleave", handlePointerLeave);
      }
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
