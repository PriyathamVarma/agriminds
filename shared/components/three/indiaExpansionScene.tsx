"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { createLowPowerRenderer, disposeObject3D, isLowPowerDevice, prefersReducedMotion } from "./webgl";
import { useInViewport } from "./useInViewport";
import { GEO_NODES, INDIA_OUTLINE, projectGeo, type NodeCategory } from "./indiaGeo";

/**
 * A minimal, stylized point/line map of India, ambient and low-opacity, sitting behind
 * the Chapter Model section's photo and copy. Nodes and connections activate outward
 * from Vizag as `progress` (0..1, scroll-through of the section) advances.
 */

const CATEGORY_INDEX: Record<NodeCategory, number> = { origin: 0, phase1: 1, phase2: 2, network: 3 };

const NODE_VERTEX_SHADER = /* glsl */ `
  attribute float aThreshold;
  attribute float aCategory;
  uniform float uProgress;
  uniform float uPixelRatio;
  varying float vActive;
  varying float vCategory;

  void main() {
    float activation = smoothstep(aThreshold - 0.06, aThreshold, uProgress);
    vActive = activation;
    vCategory = aCategory;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float baseSize = aCategory < 0.5 ? 15.0 : aCategory < 1.5 ? 10.0 : aCategory < 2.5 ? 8.0 : 6.0;
    gl_PointSize = baseSize * (0.35 + 0.65 * activation) * uPixelRatio;
    gl_Position = projectionMatrix * mv;
  }
`;

const NODE_FRAGMENT_SHADER = /* glsl */ `
  precision mediump float;
  uniform vec3 uColorOrigin;
  uniform vec3 uColorPhase1;
  uniform vec3 uColorPhase2;
  uniform vec3 uColorNetwork;
  uniform float uOriginBoost;
  varying float vActive;
  varying float vCategory;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float core = smoothstep(0.5, 0.15, d);
    float glow = smoothstep(0.5, 0.0, d) * 0.5;

    vec3 color = vCategory < 0.5 ? uColorOrigin
               : vCategory < 1.5 ? uColorPhase1
               : vCategory < 2.5 ? uColorPhase2
               : uColorNetwork;

    float boost = vCategory < 0.5 ? uOriginBoost * 0.4 : 0.0;
    float alpha = (core + glow * 0.6) * vActive + boost * glow;
    if (alpha <= 0.01) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

const LINE_VERTEX_SHADER = /* glsl */ `
  attribute float aThreshold;
  attribute float aT;
  uniform float uProgress;
  varying float vAlpha;

  void main() {
    float drawn = smoothstep(aThreshold - 0.14, aThreshold, uProgress);
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
    gl_FragColor = vec4(uColor, vAlpha * 0.5);
  }
`;

export default function IndiaExpansionScene({
  progress,
  className,
}: {
  progress: MotionValue<number>;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInViewport(containerRef, "20% 0px");

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !inView) return;

    const reduceMotion = prefersReducedMotion();
    const lowPower = isLowPowerDevice();
    const nodes = lowPower ? GEO_NODES.filter((n) => n.category !== "network") : GEO_NODES;

    const renderer = createLowPowerRenderer();
    if (!renderer) return;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
    camera.position.z = 1;

    // Faint outline watermark of India's silhouette.
    const outlinePoints = INDIA_OUTLINE.map(([lon, lat]) => {
      const { x, y } = projectGeo(lat, lon);
      return new THREE.Vector3(x, y, -0.01);
    });
    const outlineGeometry = new THREE.BufferGeometry().setFromPoints(outlinePoints);
    const outlineMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color("#1f4d3a"),
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
    });
    const outline = new THREE.LineLoop(outlineGeometry, outlineMaterial);
    scene.add(outline);

    // Connection lines, each a 2-vertex segment from its origin node to itself.
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const linkPositions: number[] = [];
    const linkThresholds: number[] = [];
    const linkT: number[] = [];
    for (const node of nodes) {
      if (!node.connectsTo) continue;
      const from = byId.get(node.connectsTo);
      if (!from) continue;
      const a = projectGeo(from.lat, from.lon);
      const b = projectGeo(node.lat, node.lon);
      linkPositions.push(a.x, a.y, 0, b.x, b.y, 0);
      linkThresholds.push(node.threshold, node.threshold);
      linkT.push(0, 1);
    }
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linkPositions, 3));
    lineGeometry.setAttribute("aThreshold", new THREE.Float32BufferAttribute(linkThresholds, 1));
    lineGeometry.setAttribute("aT", new THREE.Float32BufferAttribute(linkT, 1));
    const lineMaterial = new THREE.ShaderMaterial({
      vertexShader: LINE_VERTEX_SHADER,
      fragmentShader: LINE_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uProgress: { value: 0 },
        uColor: { value: new THREE.Color("#c1712f") },
      },
    });
    const links = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(links);

    // Nodes.
    const nodePositions: number[] = [];
    const nodeThresholds: number[] = [];
    const nodeCategories: number[] = [];
    for (const node of nodes) {
      const { x, y } = projectGeo(node.lat, node.lon);
      nodePositions.push(x, y, 0.01);
      nodeThresholds.push(node.threshold);
      nodeCategories.push(CATEGORY_INDEX[node.category]);
    }
    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute("position", new THREE.Float32BufferAttribute(nodePositions, 3));
    nodeGeometry.setAttribute("aThreshold", new THREE.Float32BufferAttribute(nodeThresholds, 1));
    nodeGeometry.setAttribute("aCategory", new THREE.Float32BufferAttribute(nodeCategories, 1));
    const nodeMaterial = new THREE.ShaderMaterial({
      vertexShader: NODE_VERTEX_SHADER,
      fragmentShader: NODE_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uProgress: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.75) },
        uOriginBoost: { value: 0 },
        uColorOrigin: { value: new THREE.Color("#c1712f") },
        uColorPhase1: { value: new THREE.Color("#e0a05a") },
        uColorPhase2: { value: new THREE.Color("#7fa38a") },
        uColorNetwork: { value: new THREE.Color("#a8b8ac") },
      },
    });
    const points = new THREE.Points(nodeGeometry, nodeMaterial);
    scene.add(points);

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      const aspect = clientWidth / clientHeight;
      camera.left = -aspect;
      camera.right = aspect;
      camera.top = 1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const renderFrame = () => {
      const p = progress.get();
      nodeMaterial.uniforms.uProgress.value = p;
      lineMaterial.uniforms.uProgress.value = p;
      nodeMaterial.uniforms.uOriginBoost.value = THREE.MathUtils.smoothstep(p, 0.16, 0.26);
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
