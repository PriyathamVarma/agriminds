"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  varying float vHeight;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float wave =
      sin(pos.x * 0.9 + uTime * 0.55) * 0.22 +
      sin(pos.x * 2.1 - uTime * 0.85) * 0.07 +
      sin(pos.y * 1.3 + uTime * 0.35) * 0.14;
    pos.z += wave;
    vHeight = wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision mediump float;
  uniform vec3 uColorLow;
  uniform vec3 uColorHigh;
  uniform float uOpacity;
  varying float vHeight;
  varying vec2 vUv;

  void main() {
    float h = clamp(vHeight * 2.2 + 0.5, 0.0, 1.0);
    vec3 color = mix(uColorLow, uColorHigh, h);

    float vFade = smoothstep(0.0, 0.4, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
    float hFade = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);

    gl_FragColor = vec4(color, uOpacity * vFade * hFade);
  }
`;

export default function CropFieldScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 50);
    camera.position.set(0, 1.6, 4.4);
    camera.lookAt(0, -0.4, -2);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    container.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    const geometry = new THREE.PlaneGeometry(14, 9, 90, 56);
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uColorLow: { value: new THREE.Color("#173327") },
        uColorHigh: { value: new THREE.Color("#c9a24a") },
        uOpacity: { value: 0.85 },
      },
    });

    const field = new THREE.Mesh(geometry, material);
    field.rotation.x = -Math.PI * 0.38;
    field.position.set(0, -1.1, -2.4);
    scene.add(field);

    // Drifting seed/pollen particles catching warm light
    const particleCount = 90;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 8;
      particlePositions[i * 3 + 1] = Math.random() * 3 - 1;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
      particleSpeeds[i] = 0.08 + Math.random() * 0.14;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: new THREE.Color("#e8c98a"),
      size: 0.045,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    let frameId = 0;
    let running = true;
    const clock = new THREE.Clock();

    const renderFrame = () => {
      const t = clock.getElapsedTime();
      material.uniforms.uTime.value = t;

      const posAttr = particleGeometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        const y = posAttr.getY(i) + particleSpeeds[i] * 0.01;
        posAttr.setY(i, y > 2.2 ? -1 : y);
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    // Always render one frame so the scene is visible even under reduced-motion.
    renderFrame();

    const loop = () => {
      if (!running) return;
      renderFrame();
      frameId = requestAnimationFrame(loop);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frameId);
      } else if (!reduceMotion) {
        frameId = requestAnimationFrame(loop);
      }
    };

    if (!reduceMotion) {
      frameId = requestAnimationFrame(loop);
      document.addEventListener("visibilitychange", handleVisibility);
    }

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      document.removeEventListener("visibilitychange", handleVisibility);
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" aria-hidden="true" />;
}
