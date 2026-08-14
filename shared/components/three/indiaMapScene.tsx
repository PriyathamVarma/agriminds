"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { createLowPowerRenderer, disposeObject3D, isLowPowerDevice, prefersReducedMotion } from "./webgl";
import { useInViewport } from "./useInViewport";
import { INDIA_STATES } from "./indiaStatesData";
import { projectIndia } from "./indiaProjection";
import { VIZAG, STATE_ACTIVATIONS, CATEGORY_COLOR } from "./indiaGeo";

/**
 * A real, geographically-projected 3D map of India's states (see indiaStatesData.ts /
 * indiaProjection.ts), subtly extruded and lit. States activate outward from Vizag as
 * `progress` (0..1, scroll-through of the map panel) advances, matching the phase data
 * in indiaGeo.ts. Hovering a state highlights it and shows its name.
 */

const BASE_COLOR_HEX = "#ece3d0";
const HOVER_TINT_HEX = "#fffdf8";
const BOUNDARY_COLOR_HEX = "#b6ac90";
const EXTRUDE_DEPTH = 0.018;
const TILT = -0.19; // radians, ~11° — enough to read the extrusion, not a dramatic angle

const LINE_VERTEX_SHADER = /* glsl */ `
  attribute float aThreshold;
  attribute float aT;
  uniform float uProgress;
  varying float vAlpha;
  void main() {
    float drawn = smoothstep(aThreshold - 0.1, aThreshold, uProgress);
    vAlpha = step(aT, drawn) * smoothstep(0.0, 0.2, drawn);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const LINE_FRAGMENT_SHADER = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    if (vAlpha <= 0.01) discard;
    gl_FragColor = vec4(uColor, vAlpha * 0.65);
  }
`;

const MARKER_VERTEX_SHADER = /* glsl */ `
  uniform float uSize;
  uniform float uPixelRatio;
  void main() {
    gl_PointSize = uSize * uPixelRatio;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const MARKER_FRAGMENT_SHADER = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float alpha = smoothstep(0.5, 0.1, d) * uAlpha;
    if (alpha <= 0.01) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

interface StateEntry {
  name: string;
  mesh: THREE.Mesh;
  material: THREE.MeshLambertMaterial;
  centroid: THREE.Vector2;
  categoryColor: THREE.Color;
  threshold: number | null;
  targetColor: THREE.Color;
  hovered: boolean;
}

export default function IndiaMapScene({
  progress,
  className,
}: {
  progress: MotionValue<number>;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const inView = useInViewport(containerRef, "20% 0px");

  useEffect(() => {
    const container = containerRef.current;
    const tooltip = tooltipRef.current;
    if (!container || !tooltip || !inView) return;

    const reduceMotion = prefersReducedMotion();
    const lowPower = isLowPowerDevice();
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const renderer = createLowPowerRenderer();
    if (!renderer) return;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -5, 5);
    camera.position.set(0, 0, 3);

    scene.add(new THREE.AmbientLight(0xfff3e0, 0.95));
    const sun = new THREE.DirectionalLight(0xfff3e0, 0.75);
    sun.position.set(-0.6, 1, 1.4);
    scene.add(sun);

    const mapGroup = new THREE.Group();
    mapGroup.rotation.x = TILT;
    scene.add(mapGroup);

    const baseColor = new THREE.Color(BASE_COLOR_HEX);
    const hoverTint = new THREE.Color(HOVER_TINT_HEX);
    const activationByName = new Map(STATE_ACTIVATIONS.map((a) => [a.stateName, a]));

    const entries: StateEntry[] = [];
    const boundaryPositions: number[] = [];
    let dataMinX = Infinity;
    let dataMaxX = -Infinity;
    let dataMinY = Infinity;
    let dataMaxY = -Infinity;

    for (const state of INDIA_STATES) {
      const shapes = state.rings.map((ring) => {
        const shape = new THREE.Shape();
        ring.forEach(([x, y], i) => {
          dataMinX = Math.min(dataMinX, x);
          dataMaxX = Math.max(dataMaxX, x);
          dataMinY = Math.min(dataMinY, y);
          dataMaxY = Math.max(dataMaxY, y);
          if (i === 0) shape.moveTo(x, y);
          else shape.lineTo(x, y);
        });
        return shape;
      });

      const geometry = new THREE.ExtrudeGeometry(shapes, {
        depth: EXTRUDE_DEPTH,
        bevelEnabled: false,
        curveSegments: 1,
      });
      const material = new THREE.MeshLambertMaterial({ color: baseColor.clone() });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData.name = state.name;
      mapGroup.add(mesh);

      for (const ring of state.rings) {
        for (let i = 0; i < ring.length; i++) {
          const [x1, y1] = ring[i];
          const [x2, y2] = ring[(i + 1) % ring.length];
          boundaryPositions.push(x1, y1, EXTRUDE_DEPTH + 0.002, x2, y2, EXTRUDE_DEPTH + 0.002);
        }
      }

      const largestRing = state.rings.reduce((a, b) => (b.length > a.length ? b : a));
      const cx = largestRing.reduce((s, [x]) => s + x, 0) / largestRing.length;
      const cy = largestRing.reduce((s, [, y]) => s + y, 0) / largestRing.length;

      const activation = activationByName.get(state.name);
      entries.push({
        name: state.name,
        mesh,
        material,
        centroid: new THREE.Vector2(cx, cy),
        categoryColor: new THREE.Color(activation ? CATEGORY_COLOR[activation.category] : BASE_COLOR_HEX),
        threshold: activation?.threshold ?? null,
        targetColor: baseColor.clone(),
        hovered: false,
      });
    }

    const boundaryGeometry = new THREE.BufferGeometry();
    boundaryGeometry.setAttribute("position", new THREE.Float32BufferAttribute(boundaryPositions, 3));
    const boundaryMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(BOUNDARY_COLOR_HEX),
      transparent: true,
      opacity: 0.55,
    });
    mapGroup.add(new THREE.LineSegments(boundaryGeometry, boundaryMaterial));

    // --- Vizag marker ---
    const entryByName = new Map(entries.map((e) => [e.name, e]));
    const vizagPos = projectIndia(VIZAG.lat, VIZAG.lon);
    const markerGeometry = new THREE.BufferGeometry();
    markerGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([vizagPos.x, vizagPos.y, EXTRUDE_DEPTH + 0.01], 3),
    );
    const markerMaterial = new THREE.ShaderMaterial({
      vertexShader: MARKER_VERTEX_SHADER,
      fragmentShader: MARKER_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uSize: { value: 12 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.75) },
        uColor: { value: new THREE.Color(CATEGORY_COLOR.origin) },
        uAlpha: { value: 0 },
      },
    });
    const marker = new THREE.Points(markerGeometry, markerMaterial);
    mapGroup.add(marker);

    const haloMaterial = new THREE.ShaderMaterial({
      vertexShader: MARKER_VERTEX_SHADER,
      fragmentShader: MARKER_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uSize: { value: 26 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.75) },
        uColor: { value: new THREE.Color(CATEGORY_COLOR.origin) },
        uAlpha: { value: 0 },
      },
    });
    const halo = new THREE.Points(markerGeometry, haloMaterial);
    mapGroup.add(halo);

    // --- Connections (Vizag/state centroid -> activating state centroid) ---
    const linkPositions: number[] = [];
    const linkThresholds: number[] = [];
    const linkT: number[] = [];
    const routes: Array<{ fromX: number; fromY: number; toX: number; toY: number; threshold: number }> = [];
    for (const act of STATE_ACTIVATIONS) {
      const to = entryByName.get(act.stateName);
      if (!to) continue;
      const from = act.connectsTo === "Vizag" ? vizagPos : entryByName.get(act.connectsTo)?.centroid;
      if (!from) continue;
      linkPositions.push(from.x, from.y, EXTRUDE_DEPTH + 0.008, to.centroid.x, to.centroid.y, EXTRUDE_DEPTH + 0.008);
      linkThresholds.push(act.threshold, act.threshold);
      linkT.push(0, 1);
      routes.push({ fromX: from.x, fromY: from.y, toX: to.centroid.x, toY: to.centroid.y, threshold: act.threshold });
    }
    const linkGeometry = new THREE.BufferGeometry();
    linkGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linkPositions, 3));
    linkGeometry.setAttribute("aThreshold", new THREE.Float32BufferAttribute(linkThresholds, 1));
    linkGeometry.setAttribute("aT", new THREE.Float32BufferAttribute(linkT, 1));
    const linkMaterial = new THREE.ShaderMaterial({
      vertexShader: LINE_VERTEX_SHADER,
      fragmentShader: LINE_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      uniforms: { uProgress: { value: 0 }, uColor: { value: new THREE.Color("#c1712f") } },
    });
    mapGroup.add(new THREE.LineSegments(linkGeometry, linkMaterial));

    // --- A few particles traveling along active routes ---
    const particleCount = reduceMotion || lowPower ? 0 : Math.min(routes.length, 14);
    const particlePositions = new Float32Array(particleCount * 3);
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: new THREE.Color("#f3e1cc"),
      size: 0.02,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    if (particleCount > 0) mapGroup.add(new THREE.Points(particleGeometry, particleMaterial));

    // --- Resize: "contain fit" so the whole map is always visible, never clipped ---
    const halfW = (dataMaxX - dataMinX) / 2;
    const halfH = (dataMaxY - dataMinY) / 2;
    const mapAspect = halfW / halfH;
    const MARGIN = 1.18;
    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      const containerAspect = clientWidth / clientHeight;
      let top: number;
      let right: number;
      if (containerAspect > mapAspect) {
        top = halfH * MARGIN;
        right = top * containerAspect;
      } else {
        right = halfW * MARGIN;
        top = right / containerAspect;
      }
      camera.left = -right;
      camera.right = right;
      camera.top = top;
      camera.bottom = -top;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
      markerMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 1.75);
      haloMaterial.uniforms.uPixelRatio.value = markerMaterial.uniforms.uPixelRatio.value;
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // --- Render loop (defined before the hover handlers below, which call it directly
    // to repaint immediately under reduced motion) ---
    const clock = new THREE.Clock();
    const renderFrame = () => {
      const t = clock.getElapsedTime();
      const p = reduceMotion ? 1 : progress.get();
      const colorLerp = reduceMotion ? 1 : 0.15;
      const liftLerp = reduceMotion ? 1 : 0.18;

      for (const entry of entries) {
        const activation = entry.threshold != null ? THREE.MathUtils.smoothstep(p, entry.threshold - 0.06, entry.threshold) : 0;
        entry.targetColor.copy(baseColor).lerp(entry.categoryColor, activation);
        if (entry.hovered) entry.targetColor.lerp(hoverTint, 0.3);
        entry.material.color.lerp(entry.targetColor, colorLerp);
        const targetZ = entry.hovered ? 0.045 : 0;
        entry.mesh.position.z += (targetZ - entry.mesh.position.z) * liftLerp;
      }

      const vizagActive = THREE.MathUtils.smoothstep(p, VIZAG.threshold - 0.03, VIZAG.threshold);
      markerMaterial.uniforms.uAlpha.value = vizagActive;
      haloMaterial.uniforms.uAlpha.value = vizagActive * (0.35 + 0.15 * Math.sin(t * 2));
      haloMaterial.uniforms.uSize.value = 22 + Math.sin(t * 2) * 4;

      linkMaterial.uniforms.uProgress.value = p;

      if (particleCount > 0) {
        const posAttr = particleGeometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < particleCount; i++) {
          const route = routes[i % routes.length];
          const drawn = THREE.MathUtils.smoothstep(p, route.threshold - 0.1, route.threshold);
          if (drawn <= 0.02) {
            posAttr.setY(i, 999);
            continue;
          }
          const speed = 0.15 + (i % 5) * 0.03;
          const travel = ((t * speed + i * 0.37) % 1) * Math.min(drawn, 1);
          posAttr.setX(i, route.fromX + (route.toX - route.fromX) * travel);
          posAttr.setY(i, route.fromY + (route.toY - route.fromY) * travel);
          posAttr.setZ(i, EXTRUDE_DEPTH + 0.012);
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    // --- Hover raycasting + tooltip ---
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2(999, 999);
    const meshes = entries.map((e) => e.mesh);
    let hoveredEntry: StateEntry | null = null;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(meshes)[0];
      const nextEntry = hit ? (entries.find((en) => en.mesh === hit.object) ?? null) : null;

      if (nextEntry !== hoveredEntry) {
        if (hoveredEntry) hoveredEntry.hovered = false;
        hoveredEntry = nextEntry;
        if (hoveredEntry) hoveredEntry.hovered = true;
      }

      if (hoveredEntry) {
        tooltip.textContent = hoveredEntry.name;
        tooltip.style.opacity = "1";
        tooltip.style.transform = `translate(${e.clientX - rect.left + 14}px, ${e.clientY - rect.top + 14}px)`;
      } else {
        tooltip.style.opacity = "0";
      }

      if (reduceMotion) renderFrame();
    };
    const handlePointerLeave = () => {
      if (hoveredEntry) {
        hoveredEntry.hovered = false;
        hoveredEntry = null;
      }
      tooltip.style.opacity = "0";
      if (reduceMotion) renderFrame();
    };
    if (canHover) {
      container.addEventListener("pointermove", handlePointerMove);
      container.addEventListener("pointerleave", handlePointerLeave);
    }

    renderFrame();

    let frameId = 0;
    let running = true;
    const loop = () => {
      if (!running) return;
      renderFrame();
      frameId = requestAnimationFrame(loop);
    };
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
      if (canHover) {
        container.removeEventListener("pointermove", handlePointerMove);
        container.removeEventListener("pointerleave", handlePointerLeave);
      }
      resizeObserver.disconnect();
      disposeObject3D(scene);
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [inView, progress]);

  return (
    <div ref={containerRef} className={className} aria-hidden="true">
      <div
        ref={tooltipRef}
        className="pointer-events-none absolute top-0 left-0 z-10 rounded-full bg-deep px-3 py-1 text-xs font-semibold whitespace-nowrap text-deep-foreground opacity-0 shadow-lg transition-opacity duration-150"
      />
    </div>
  );
}
