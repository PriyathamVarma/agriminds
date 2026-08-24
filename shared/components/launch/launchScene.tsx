"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createLowPowerRenderer, disposeObject3D, isLowPowerDevice } from "@/shared/components/three/webgl";

/**
 * The one-shot cinematic played after "Launch" is clicked: a patch of soil cracks
 * open, a sprout emerges and unfurls into a sapling, the trunk thickens and
 * branches spread into a full, leafy canopy, then the camera pushes forward
 * through the leaves as a full-bleed overlay (matching the homepage hero's
 * --color-deep backdrop) fades to opaque — at which point `onComplete` fires and
 * the parent navigates, so the route swap lands on an already-matching solid
 * frame instead of a visible cut.
 *
 * Entirely time-driven from a single elapsed-seconds clock (paused while the tab
 * is hidden). The trunk's height is the root driver — branches and leaves don't
 * run on their own fixed timers, each is gated on the trunk (or its parent
 * branch) having actually grown past its attach point, so nothing appears to
 * sprout out of thin air ahead of the growth that should have produced it.
 */

const TOTAL_DURATION = 5.0;
const SOIL_START = 0,
  SOIL_END = 0.6;
const CRACK_START = 0.45,
  CRACK_END = 0.85;
const GROW_START = 0.55,
  TRUNK_GROW_END = 3.7;
const PUSH_START = 4.0,
  PUSH_END = TOTAL_DURATION;
const LEAF_REVEAL_DURATION = 0.35;
const BRANCH_REVEAL_DURATION = 0.8;

const SOIL_TOP_Y = -0.85;
const FINAL_TRUNK_HEIGHT = 1.9;

const DEEP = new THREE.Color("#0f1d16");
const SOIL_BROWN = new THREE.Color("#4a3320");
const SOIL_BROWN_LIGHT = new THREE.Color("#7a5533");
const BARK = new THREE.Color("#5c4128");
const SPROUT_GREEN = new THREE.Color("#7fd39a");
const LEAF_GREEN = new THREE.Color("#3f8f5c");
const LEAF_GREEN_LIGHT = new THREE.Color("#8fe0a8");
const GOLD_ACCENT = new THREE.Color("#e0a05a");
const GOLD_BRIGHT = new THREE.Color("#f3e1cc");

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
function remap(t: number, inMin: number, inMax: number): number {
  return clamp01((t - inMin) / (inMax - inMin));
}
function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

const PARTICLE_VERTEX = /* glsl */ `
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

const PARTICLE_FRAGMENT = /* glsl */ `
  precision mediump float;
  uniform float uGlobalAlpha;
  varying vec3 vColor;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float alpha = smoothstep(0.5, 0.05, d) * uGlobalAlpha;
    if (alpha <= 0.01) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

function makePointsMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: PARTICLE_VERTEX,
    fragmentShader: PARTICLE_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.75) },
      uGlobalAlpha: { value: 0 },
    },
  });
}

type Branch = {
  geometry: THREE.BufferGeometry;
  material: THREE.LineBasicMaterial;
  segments: number;
  points: THREE.Vector3[];
  originHeightFrac: number;
  stagger: number;
  revealStart: number;
};

function buildBranch(origin: THREE.Vector3, dir: THREE.Vector3, length: number, segments: number, wobbleSeed: number, originHeightFrac: number, stagger: number): Branch {
  const positions = new Float32Array((segments + 1) * 3);
  const perp = new THREE.Vector3(-dir.y, dir.x, 0.3).normalize();
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const wobble = Math.sin(t * Math.PI * 2.4 + wobbleSeed * 6.28) * 0.1 * t;
    const p = origin.clone().addScaledVector(dir, t * length).addScaledVector(perp, wobble);
    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;
    points.push(p);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setDrawRange(0, 0);
  const material = new THREE.LineBasicMaterial({
    color: BARK,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  return { geometry, material, segments, points, originHeightFrac, stagger, revealStart: -1 };
}

/** A small pointed-oval leaf silhouette, pivoted at its base so it "unfurls" outward from (0,0). */
function buildLeafGeometry(): THREE.ShapeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.quadraticCurveTo(0.09, 0.06, 0.11, 0.17);
  shape.quadraticCurveTo(0.1, 0.29, 0, 0.38);
  shape.quadraticCurveTo(-0.1, 0.29, -0.11, 0.17);
  shape.quadraticCurveTo(-0.09, 0.06, 0, 0);
  return new THREE.ShapeGeometry(shape, 6);
}

type LeafSlot = {
  base: THREE.Vector3;
  outward: THREE.Vector3;
  scale: number;
  rotZ: number;
  swayPhase: number;
  swayAmount: number;
  color: THREE.Color;
  gatedOn: "trunk" | number; // "trunk" = trunk height fraction, or a branch index
  heightFrac: number; // fraction of trunk (or branch) that must be grown before this leaf reveals
  revealStart: number;
};

export default function LaunchScene({ onComplete, className }: { onComplete: () => void; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;
    if (!container || !overlay) return;

    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      overlay.style.opacity = "1";
      overlay.style.backgroundColor = `#${DEEP.getHexString()}`;
      onCompleteRef.current();
    };

    const renderer = createLowPowerRenderer();
    if (!renderer) {
      finish();
      return;
    }
    container.appendChild(renderer.domElement);
    const onContextLost = (e: Event) => {
      e.preventDefault();
      finish();
    };
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);

    const lowPower = isLowPowerDevice();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.25, 5.2);
    camera.lookAt(0, 0.35, 0);

    // Soil mound — a flattened dome so it reads as ground from a near-front camera.
    const soilGeometry = new THREE.SphereGeometry(0.62, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const soilPos = soilGeometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < soilPos.count; i++) {
      const jitter = 1 + (Math.random() - 0.5) * 0.08;
      soilPos.setXYZ(i, soilPos.getX(i) * jitter, soilPos.getY(i), soilPos.getZ(i) * jitter);
    }
    soilGeometry.scale(1, 0.4, 1);
    const soilMaterial = new THREE.MeshBasicMaterial({ color: SOIL_BROWN, transparent: true, opacity: 0 });
    const soilMesh = new THREE.Mesh(soilGeometry, soilMaterial);
    soilMesh.position.set(0, -1.02, 0);
    scene.add(soilMesh);

    // Trunk — a tapered cylinder pivoted at its base, grown by scaling height + radius.
    const trunkGeometry = new THREE.CylinderGeometry(0.05, 0.09, 1, 8, 1);
    trunkGeometry.translate(0, 0.5, 0);
    const trunkMaterial = new THREE.MeshBasicMaterial({ color: SPROUT_GREEN, transparent: true, opacity: 0 });
    const trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunkMesh.position.set(0, SOIL_TOP_Y, 0);
    trunkMesh.scale.set(0.001, 0.001, 0.001);
    scene.add(trunkMesh);

    // Branches — reveal gated on the trunk's current height, not a fixed timer.
    const branchSegments = lowPower ? 12 : 18;
    const branchDefs: { dir: THREE.Vector3; length: number; seed: number; heightFrac: number }[] = [
      { dir: new THREE.Vector3(-0.55, 0.7, 0.1).normalize(), length: 1.0, seed: 0.15, heightFrac: 0.55 },
      { dir: new THREE.Vector3(0.6, 0.65, -0.15).normalize(), length: 0.95, seed: 0.4, heightFrac: 0.62 },
      { dir: new THREE.Vector3(-0.35, 0.85, -0.3).normalize(), length: 0.85, seed: 0.65, heightFrac: 0.74 },
      { dir: new THREE.Vector3(0.4, 0.9, 0.25).normalize(), length: 0.8, seed: 0.85, heightFrac: 0.83 },
      { dir: new THREE.Vector3(0, 1, 0).normalize(), length: 0.75, seed: 0.3, heightFrac: 0.93 },
    ];
    const branches = branchDefs.map((b, i) => {
      const origin = new THREE.Vector3(0, SOIL_TOP_Y + b.heightFrac * FINAL_TRUNK_HEIGHT, 0);
      return buildBranch(origin, b.dir, b.length, branchSegments, b.seed, b.heightFrac, i * 0.08);
    });
    const branchGroup = new THREE.Group();
    branches.forEach((b) => branchGroup.add(new THREE.Line(b.geometry, b.material)));
    scene.add(branchGroup);

    // Leaves — one InstancedMesh for both the sapling's first leaves and the full canopy.
    const leafGeometry = buildLeafGeometry();
    const leafMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const saplingLeafCount = 5;
    const canopyPerBranch = lowPower ? 4 : 8;
    const leafSlots: LeafSlot[] = [];
    for (let i = 0; i < saplingLeafCount; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const heightFrac = 0.22 + (i / saplingLeafCount) * 0.28;
      leafSlots.push({
        base: new THREE.Vector3(0, 0, 0),
        outward: new THREE.Vector3(side * 0.5, 0.25, (Math.random() - 0.5) * 0.4).normalize(),
        scale: 0.55 + Math.random() * 0.2,
        rotZ: Math.random() * Math.PI * 2,
        swayPhase: Math.random() * Math.PI * 2,
        swayAmount: 0.05 + Math.random() * 0.05,
        color: SPROUT_GREEN.clone().lerp(LEAF_GREEN_LIGHT, Math.random()),
        gatedOn: "trunk",
        heightFrac,
        revealStart: -1,
      });
    }
    branches.forEach((branch, bi) => {
      for (let i = 0; i < canopyPerBranch; i++) {
        const t = 0.45 + (i / canopyPerBranch) * 0.55;
        const idx = Math.min(branch.points.length - 1, Math.round(t * branch.segments));
        const outward = new THREE.Vector3((Math.random() - 0.5) * 1.4, 0.3 + Math.random() * 0.7, (Math.random() - 0.5) * 1.4).normalize();
        const isGold = Math.random() < 0.16;
        leafSlots.push({
          base: branch.points[idx],
          outward,
          scale: 0.7 + Math.random() * 0.45,
          rotZ: Math.random() * Math.PI * 2,
          swayPhase: Math.random() * Math.PI * 2,
          swayAmount: 0.06 + Math.random() * 0.07,
          color: isGold ? GOLD_ACCENT.clone().lerp(GOLD_BRIGHT, Math.random()) : LEAF_GREEN.clone().lerp(LEAF_GREEN_LIGHT, Math.random()),
          gatedOn: bi,
          heightFrac: t,
          revealStart: -1,
        });
      }
    });
    const leafMesh = new THREE.InstancedMesh(leafGeometry, leafMaterial, leafSlots.length);
    leafMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    leafSlots.forEach((slot, i) => leafMesh.setColorAt(i, slot.color));
    scene.add(leafMesh);

    // Warm backlight glow behind the canopy (reuses the particle-point shader as a single soft sprite).
    const glowMaterial = makePointsMaterial();
    const glowGeometry = new THREE.BufferGeometry();
    glowGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array([0, 0.9, -0.6]), 3));
    glowGeometry.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array([120]), 1));
    glowGeometry.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array([GOLD_BRIGHT.r, GOLD_BRIGHT.g, GOLD_BRIGHT.b]), 3));
    const backlight = new THREE.Points(glowGeometry, glowMaterial);
    scene.add(backlight);

    // Soil dust — a brief puff at the crack moment.
    const dustCount = lowPower ? 14 : 22;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);
    const dustSizes = new Float32Array(dustCount);
    const dustDirs: THREE.Vector3[] = [];
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = 0;
      dustPositions[i * 3 + 1] = SOIL_TOP_Y;
      dustPositions[i * 3 + 2] = 0;
      const c = SOIL_BROWN_LIGHT.clone().lerp(GOLD_ACCENT, Math.random() * 0.4);
      dustColors[i * 3] = c.r;
      dustColors[i * 3 + 1] = c.g;
      dustColors[i * 3 + 2] = c.b;
      dustSizes[i] = 4 + Math.random() * 5;
      dustDirs.push(new THREE.Vector3((Math.random() - 0.5) * 0.7, 0.25 + Math.random() * 0.35, (Math.random() - 0.5) * 0.7));
    }
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute("aColor", new THREE.BufferAttribute(dustColors, 3));
    dustGeometry.setAttribute("aSize", new THREE.BufferAttribute(dustSizes, 1));
    const dustMaterial = makePointsMaterial();
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dust);

    // Ambient floating gold light motes — present for the whole sequence.
    const moteCount = lowPower ? 14 : 26;
    const moteGeometry = new THREE.BufferGeometry();
    const motePositions = new Float32Array(moteCount * 3);
    const moteColors = new Float32Array(moteCount * 3);
    const moteSizes = new Float32Array(moteCount);
    const moteBase: number[] = [];
    const moteSpeed: number[] = [];
    const motePhase: number[] = [];
    for (let i = 0; i < moteCount; i++) {
      const x = (Math.random() - 0.5) * 3.2;
      const y = -1 + Math.random() * 2.6;
      const z = (Math.random() - 0.5) * 1.6;
      motePositions[i * 3] = x;
      motePositions[i * 3 + 1] = y;
      motePositions[i * 3 + 2] = z;
      moteBase.push(x, y, z);
      const c = GOLD_BRIGHT.clone().lerp(GOLD_ACCENT, Math.random());
      moteColors[i * 3] = c.r;
      moteColors[i * 3 + 1] = c.g;
      moteColors[i * 3 + 2] = c.b;
      moteSizes[i] = 3 + Math.random() * 3;
      moteSpeed.push(0.04 + Math.random() * 0.05);
      motePhase.push(Math.random() * Math.PI * 2);
    }
    moteGeometry.setAttribute("position", new THREE.BufferAttribute(motePositions, 3));
    moteGeometry.setAttribute("aColor", new THREE.BufferAttribute(moteColors, 3));
    moteGeometry.setAttribute("aSize", new THREE.BufferAttribute(moteSizes, 1));
    const moteMaterial = makePointsMaterial();
    const motes = new THREE.Points(moteGeometry, moteMaterial);
    scene.add(motes);

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const dustPosAttr = dustGeometry.attributes.position as THREE.BufferAttribute;
    const motePosAttr = moteGeometry.attributes.position as THREE.BufferAttribute;
    const tmpMatrix = new THREE.Matrix4();
    const tmpQuat = new THREE.Quaternion();
    const tmpPos = new THREE.Vector3();
    const tmpScale = new THREE.Vector3();
    const upAxis = new THREE.Vector3(0, 1, 0);

    const render = (elapsed: number) => {
      try {
        // Soil — settles in with a small bounce.
        const soilT = easeOutBack(remap(elapsed, SOIL_START, SOIL_END));
        soilMesh.scale.setScalar(Math.max(0, soilT));
        soilMaterial.opacity = remap(elapsed, SOIL_START, SOIL_START + 0.2) * 0.95;

        // Crack dust puff.
        const dustT = easeOutCubic(remap(elapsed, CRACK_START, CRACK_END));
        const dustAlpha = remap(elapsed, CRACK_START, CRACK_START + 0.1) * (1 - remap(elapsed, CRACK_END, CRACK_END + 0.3));
        for (let i = 0; i < dustCount; i++) {
          dustPosAttr.setXYZ(i, dustDirs[i].x * dustT, SOIL_TOP_Y + dustDirs[i].y * dustT, dustDirs[i].z * dustT);
        }
        dustPosAttr.needsUpdate = true;
        dustMaterial.uniforms.uGlobalAlpha.value = Math.max(0, dustAlpha) * 0.8;

        // Trunk — the root growth driver. Height in world units, radius as a 0..1-ish multiplier.
        const growT = easeOutCubic(remap(elapsed, GROW_START, TRUNK_GROW_END));
        const trunkHeightNow = growT * FINAL_TRUNK_HEIGHT;
        const radiusNow = 0.35 + growT * 0.75;
        trunkMesh.scale.set(radiusNow, Math.max(0.001, trunkHeightNow), radiusNow);
        trunkMaterial.opacity = remap(elapsed, GROW_START, GROW_START + 0.15) * 0.98;
        trunkMaterial.color.copy(SPROUT_GREEN).lerp(BARK, smooth(growT));

        // Branches — each starts growing only once the trunk has actually reached its attach height.
        branches.forEach((b) => {
          if (b.revealStart < 0 && trunkHeightNow >= b.originHeightFrac * FINAL_TRUNK_HEIGHT) {
            b.revealStart = elapsed;
          }
          const t = b.revealStart < 0 ? 0 : smooth(remap(elapsed, b.revealStart + b.stagger, b.revealStart + b.stagger + BRANCH_REVEAL_DURATION));
          b.geometry.setDrawRange(0, Math.floor(t * b.segments));
          b.material.opacity = 0.9 * remap(elapsed, GROW_START, GROW_START + 0.3);
        });

        // Leaves — gated on trunk height (sapling leaves) or their parent branch's growth (canopy).
        for (let i = 0; i < leafSlots.length; i++) {
          const slot = leafSlots[i];
          let originNow: THREE.Vector3;
          let grownEnough: boolean;
          if (slot.gatedOn === "trunk") {
            grownEnough = trunkHeightNow >= slot.heightFrac * FINAL_TRUNK_HEIGHT;
            originNow = new THREE.Vector3(0, SOIL_TOP_Y + Math.min(trunkHeightNow, slot.heightFrac * FINAL_TRUNK_HEIGHT), 0);
          } else {
            const branch = branches[slot.gatedOn];
            const branchT = branch.revealStart < 0 ? 0 : smooth(remap(elapsed, branch.revealStart + branch.stagger, branch.revealStart + branch.stagger + BRANCH_REVEAL_DURATION));
            grownEnough = branchT >= slot.heightFrac;
            originNow = slot.base;
          }
          if (slot.revealStart < 0 && grownEnough) slot.revealStart = elapsed;
          const leafT = slot.revealStart < 0 ? 0 : smooth(remap(elapsed, slot.revealStart, slot.revealStart + LEAF_REVEAL_DURATION));

          if (leafT <= 0) {
            tmpScale.setScalar(0.0001);
            tmpMatrix.compose(originNow, tmpQuat, tmpScale);
          } else {
            const sway = slot.revealStart >= 0 ? Math.sin(elapsed * 1.4 + slot.swayPhase) * slot.swayAmount * Math.min(1, leafT * 3) : 0;
            tmpPos.copy(originNow).addScaledVector(slot.outward, 0.02 + leafT * 0.05);
            tmpQuat.setFromUnitVectors(upAxis, slot.outward);
            const spin = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), slot.rotZ + sway);
            tmpQuat.multiply(spin);
            tmpScale.setScalar(slot.scale * leafT);
            tmpMatrix.compose(tmpPos, tmpQuat, tmpScale);
          }
          leafMesh.setMatrixAt(i, tmpMatrix);
        }
        leafMesh.instanceMatrix.needsUpdate = true;

        // Backlight glow — steady warm presence once the canopy starts filling in.
        glowMaterial.uniforms.uGlobalAlpha.value = remap(elapsed, GROW_START + 1.2, GROW_START + 2.0) * 0.5;

        // Ambient gold motes — gentle upward drift with sway, present throughout.
        for (let i = 0; i < moteCount; i++) {
          const bx = moteBase[i * 3];
          const by = moteBase[i * 3 + 1];
          const bz = moteBase[i * 3 + 2];
          const rise = ((elapsed * moteSpeed[i] * 0.6) % 1) * 2.4;
          let y = by + rise;
          if (y > 1.5) y -= 2.4;
          const sway = Math.sin(elapsed * 0.6 + motePhase[i]) * 0.12;
          motePosAttr.setXYZ(i, bx + sway, y, bz);
        }
        motePosAttr.needsUpdate = true;
        moteMaterial.uniforms.uGlobalAlpha.value = remap(elapsed, SOIL_START, SOIL_START + 1) * 0.55;

        // Camera push through the leaves into the homepage.
        const pushT = smooth(remap(elapsed, PUSH_START, PUSH_END));
        camera.position.z = 5.2 - pushT * 5.6;
        camera.position.y = 0.25 + pushT * 0.35;
        camera.fov = 45 + pushT * 22;
        camera.updateProjectionMatrix();
        camera.lookAt(0, 0.35 + pushT * 0.3, -1);

        // Seamless hand-off overlay — a brief warm flash as we "pass through the leaves,"
        // settling on --color-deep to match the homepage hero's backdrop.
        const overlayIn = remap(elapsed, PUSH_START + 0.35, PUSH_END);
        const flash = 1 - remap(elapsed, PUSH_START + 0.35, PUSH_END - 0.15);
        const overlayColor = LEAF_GREEN_LIGHT.clone().lerp(DEEP, 1 - flash * 0.6);
        overlay.style.backgroundColor = `#${overlayColor.getHexString()}`;
        overlay.style.opacity = String(overlayIn);

        renderer.render(scene, camera);
      } catch {
        finish();
      }
    };

    render(0);

    let frameId = 0;
    let running = true;
    let lastTs = performance.now();
    let elapsed = 0;
    let paused = document.hidden;

    const loop = (now: number) => {
      if (!running) return;
      if (paused) {
        lastTs = now;
        frameId = requestAnimationFrame(loop);
        return;
      }
      // Only clamp genuinely pathological stalls — a tight clamp here would make the
      // whole sequence run in slow motion under normal frame jank on slower devices.
      const dt = Math.min((now - lastTs) / 1000, 0.25);
      lastTs = now;
      elapsed += dt;
      render(elapsed);
      if (elapsed >= TOTAL_DURATION) {
        finish();
        return;
      }
      frameId = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      paused = document.hidden;
      if (!paused) lastTs = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);
    frameId = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      resizeObserver.disconnect();
      disposeObject3D(scene);
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={className}>
      <div ref={containerRef} className="absolute inset-0" aria-hidden="true" />
      <div
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{ background: `#${DEEP.getHexString()}` }}
        aria-hidden="true"
      />
    </div>
  );
}
