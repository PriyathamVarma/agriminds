"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createLowPowerRenderer, disposeObject3D, isLowPowerDevice } from "@/shared/components/three/webgl";
import { LAUNCH_TOTAL_DURATION, LAUNCH_SCENE_MARKS, PILLAR_SCENES, phaseAt, type LaunchPhase } from "./launchTimeline";
import {
  PALETTE,
  createPerson,
  createCropField,
  createProduceBasket,
  createCrate,
  createStall,
  createBuilding,
  createProcessingFacility,
  createConveyorBelt,
  createTruck,
  createCargoShip,
  createSmartphone,
  createBank,
  createDrone,
  createSoilSensor,
  createIrrigationSystem,
  createSolarPanel,
  createWindTurbine,
  createRoad,
  createGroundPad,
  type WindTurbine as WindTurbineRig,
} from "./launchLowPoly";

/**
 * /launch — one continuous low-poly Three.js diorama: a seed germinates at the
 * centre, and the camera then flies to five surrounding pillar dioramas (built
 * entirely from shared/components/launch/launchLowPoly.ts primitives — real
 * farmers, buildings, a conveyor belt, a truck, a cargo ship, a phone, a bank,
 * a drone...), each assembling as the camera arrives. The tree keeps growing
 * throughout. A wide pull-back then reveals everything connected as one
 * agritech ecosystem, before the camera dives back into the canopy and an
 * expanding light dissolves straight to the exact --color-deep hex the
 * homepage hero starts on — landing the route swap on an already-matching
 * frame, never a visible cut. No text, logo, or wordmark ever appears.
 */

const { CRACK_START, CRACK_END, ROOTS_END, GROW_START, TRUNK_GROW_END, MOOD_START, MOOD_END, TRANSITION_START } =
  LAUNCH_SCENE_MARKS;
const POD_WINDOWS = [
  PILLAR_SCENES.enterprise,
  PILLAR_SCENES.valueAdd,
  PILLAR_SCENES.market,
  PILLAR_SCENES.finance,
  PILLAR_SCENES.tech,
];

const SOIL_TOP_Y = -0.85;
const FINAL_TRUNK_HEIGHT = 2.2;
const CANOPY_CENTER_Y = SOIL_TOP_Y + FINAL_TRUNK_HEIGHT * 0.78;
const POD_RADIUS = 8.5;
const POD_REVEAL_LEAD = 1.5;

const NIGHT_SOIL = new THREE.Color("#0f1d16");
const SEED_TAN = new THREE.Color("#c9a06a");
const ROOT_PALE = new THREE.Color("#d8c79a");
const BARK = new THREE.Color("#5c4128");
const SPROUT_GREEN = new THREE.Color("#7fd39a");
const LEAF_GREEN = new THREE.Color("#3f8f5c");
const LEAF_GREEN_LIGHT = new THREE.Color("#8fe0a8");
const GOLD_ACCENT = new THREE.Color("#e0a05a");
const GOLD_BRIGHT = new THREE.Color("#f3e1cc");
const SKY_DARK = new THREE.Color("#0a1512");
const SKY_SUNRISE = new THREE.Color("#e9b878");

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
function easeInCubic(t: number): number {
  return t * t * t;
}
/** A soft "in and back out" pulse, 0 at both ends, 1 in the middle — for held reveals. */
function pulseWindow(t: number, start: number, end: number, fadeIn: number, fadeOut: number): number {
  return remap(t, start, start + fadeIn) * (1 - remap(t, end - fadeOut, end));
}

function podPosition(index: number): THREE.Vector3 {
  const angle = (index / 5) * Math.PI * 2;
  return new THREE.Vector3(Math.sin(angle) * POD_RADIUS, 0, -Math.cos(angle) * POD_RADIUS);
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
    uniforms: { uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.75) }, uGlobalAlpha: { value: 0 } },
  });
}
function makeUncullablePoints(geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Points {
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return points;
}

type GrowLine = {
  geometry: THREE.BufferGeometry;
  material: THREE.LineBasicMaterial;
  segments: number;
  points: THREE.Vector3[];
  originHeightFrac: number;
  stagger: number;
  revealStart: number;
};

function buildGrowLine(
  origin: THREE.Vector3,
  dir: THREE.Vector3,
  length: number,
  segments: number,
  wobbleSeed: number,
  originHeightFrac: number,
  stagger: number,
  color: THREE.Color,
): GrowLine {
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
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9, depthWrite: false });
  return { geometry, material, segments, points, originHeightFrac, stagger, revealStart: -1 };
}

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
  gatedOn: "trunk" | number;
  heightFrac: number;
  revealStart: number;
};

export default function LaunchScene({
  launching,
  skip,
  onReady,
  onComplete,
  onPhaseChange,
  className,
}: {
  launching: boolean;
  skip: boolean;
  onReady: () => void;
  onComplete: () => void;
  onPhaseChange?: (phase: LaunchPhase) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const launchingRef = useRef(launching);
  const skipRef = useRef(skip);
  const onReadyRef = useRef(onReady);
  const onCompleteRef = useRef(onComplete);
  const onPhaseChangeRef = useRef(onPhaseChange);

  useEffect(() => {
    launchingRef.current = launching;
  }, [launching]);
  useEffect(() => {
    skipRef.current = skip;
  }, [skip]);
  useEffect(() => {
    onReadyRef.current = onReady;
    onCompleteRef.current = onComplete;
    onPhaseChangeRef.current = onPhaseChange;
  }, [onReady, onComplete, onPhaseChange]);

  useEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;
    if (!container || !overlay) return;

    const debugEnabled =
      typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debugLaunch") === "1";

    // Shared crash/recovery state — declared up front since both the WebGL context-loss
    // listener (registered right after the renderer) and the render loop (defined later)
    // need to read and set it.
    let crashed = false;
    let currentPhase: LaunchPhase = "germination";
    let lastT = 0;

    let completed = false;
    const finish = (reason = "complete") => {
      if (completed) return;
      completed = true;
      if (debugEnabled) console.log(`[launch] ${reason}`);
      overlay.style.opacity = "1";
      overlay.style.backgroundColor = `#${NIGHT_SOIL.getHexString()}`;
      onCompleteRef.current();
    };

    const renderer = createLowPowerRenderer();
    if (!renderer) {
      onReadyRef.current();
      finish("complete (no renderer available)");
      return;
    }
    container.appendChild(renderer.domElement);
    // A lost WebGL context (the browser's own hard cap on simultaneously-live contexts,
    // GPU driver reset, etc.) is a recoverable event, not the end of the experience — Chrome
    // frequently restores it a moment later. Treating it as fatal used to silently redirect
    // home mid-sequence, which looked exactly like a successful completion. Instead: freeze
    // in place (same safe path a render() exception takes), stay on /launch, keep Skip live,
    // and resume automatically if/when "webglcontextrestored" fires.
    const onContextLost = (e: Event) => {
      e.preventDefault();
      crashed = true;
      console.error(
        `[launch] WebGL context lost at phase="${currentPhase}" t=${lastT.toFixed(2)}s — freezing the scene here instead of redirecting home. Skip is still available. Will resume automatically if the context is restored.`,
      );
    };
    const onContextRestored = () => {
      if (!crashed) return;
      crashed = false;
      console.warn(`[launch] WebGL context restored — resuming animation from phase="${currentPhase}".`);
    };
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);
    renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);

    const lowPower = isLowPowerDevice();
    // Shadows are the single biggest GPU cost in this scene (a depth pre-pass draw call per
    // caster, on top of the color pass) — disabling them on weaker/integrated GPUs cuts real
    // driver load rather than just papering over the "too many WebGL contexts"/context-loss
    // risk that heavy sustained rendering can trigger.
    renderer.shadowMap.enabled = !lowPower;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    onReadyRef.current();

    const scene = new THREE.Scene();
    scene.background = SKY_DARK.clone();
    scene.fog = new THREE.Fog(SKY_DARK.getHex(), 8, 30);
    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
    const IDLE_CAM = { z: 5.4, y: 0.28, fov: 45 };
    camera.position.set(0, IDLE_CAM.y, IDLE_CAM.z);
    camera.lookAt(0, 0.1, 0);

    // ---- Lights (real lighting + shadows now — the diorama look depends on it) ----
    const sun = new THREE.DirectionalLight(0xffe4b8, 1.4);
    sun.position.set(6, 11, 4);
    sun.castShadow = true;
    const shadowSize = lowPower ? 512 : 1536;
    sun.shadow.mapSize.set(shadowSize, shadowSize);
    sun.shadow.camera.left = -13;
    sun.shadow.camera.right = 13;
    sun.shadow.camera.top = 13;
    sun.shadow.camera.bottom = -13;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 30;
    sun.shadow.bias = -0.002;
    scene.add(sun);
    const hemi = new THREE.HemisphereLight(0xbfe0d6, 0x3a2c1c, 0.65);
    scene.add(hemi);
    const fill = new THREE.AmbientLight(0xffffff, 0.22);
    scene.add(fill);

    // ---- Ground ----
    const groundGeometry = new THREE.CircleGeometry(16, 40);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3320, flatShading: true, roughness: 0.95 });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = SOIL_TOP_Y - 0.02;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // ================================================================
    // Tree — germination, then continuous background growth throughout.
    // ================================================================
    const seedGeometry = new THREE.SphereGeometry(0.085, 14, 10);
    seedGeometry.scale(1, 1.25, 1);
    const seedMaterial = new THREE.MeshStandardMaterial({ color: SEED_TAN, flatShading: true, transparent: true, opacity: 0 });
    const seedMesh = new THREE.Mesh(seedGeometry, seedMaterial);
    seedMesh.position.set(0, SOIL_TOP_Y + 0.03, 0);
    seedMesh.castShadow = true;
    scene.add(seedMesh);

    const seedHalfTop = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: SEED_TAN, flatShading: true, transparent: true, opacity: 0, side: THREE.DoubleSide }),
    );
    const seedHalfBottom = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: SEED_TAN.clone().lerp(BARK, 0.3), flatShading: true, transparent: true, opacity: 0, side: THREE.DoubleSide }),
    );
    seedHalfTop.scale.y = 1.25;
    seedHalfBottom.scale.y = 1.25;
    seedHalfTop.position.copy(seedMesh.position);
    seedHalfBottom.position.copy(seedMesh.position);
    scene.add(seedHalfTop, seedHalfBottom);

    const rootSegments = lowPower ? 8 : 12;
    const rootDefs: { dir: THREE.Vector3; length: number; seed: number }[] = [
      { dir: new THREE.Vector3(-0.35, -1, 0.15).normalize(), length: 0.7, seed: 0.1 },
      { dir: new THREE.Vector3(0.4, -1, -0.1).normalize(), length: 0.62, seed: 0.4 },
      { dir: new THREE.Vector3(-0.15, -1, -0.35).normalize(), length: 0.55, seed: 0.7 },
      { dir: new THREE.Vector3(0.1, -1, 0.4).normalize(), length: 0.5, seed: 0.9 },
    ];
    const roots = rootDefs.map((r, i) => buildGrowLine(seedMesh.position.clone(), r.dir, r.length, rootSegments, r.seed, 0, i * 0.1, ROOT_PALE));
    const rootGroup = new THREE.Group();
    roots.forEach((r) => rootGroup.add(new THREE.Line(r.geometry, r.material)));
    scene.add(rootGroup);

    const trunkGeometry = new THREE.CylinderGeometry(0.05, 0.09, 1, 8, 1);
    trunkGeometry.translate(0, 0.5, 0);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: SPROUT_GREEN, flatShading: true, transparent: true, opacity: 0 });
    const trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunkMesh.position.copy(seedMesh.position);
    trunkMesh.scale.set(0.001, 0.001, 0.001);
    trunkMesh.castShadow = true;
    scene.add(trunkMesh);

    const branchSegments = lowPower ? 10 : 16;
    const branchDefs: { dir: THREE.Vector3; length: number; seed: number; heightFrac: number }[] = [
      { dir: new THREE.Vector3(-0.55, 0.68, 0.1).normalize(), length: 1.0, seed: 0.12, heightFrac: 0.4 },
      { dir: new THREE.Vector3(0.6, 0.62, -0.15).normalize(), length: 0.95, seed: 0.32, heightFrac: 0.48 },
      { dir: new THREE.Vector3(-0.4, 0.78, -0.35).normalize(), length: 0.88, seed: 0.52, heightFrac: 0.6 },
      { dir: new THREE.Vector3(0.45, 0.8, 0.3).normalize(), length: 0.82, seed: 0.68, heightFrac: 0.68 },
      { dir: new THREE.Vector3(-0.3, 0.88, 0.25).normalize(), length: 0.76, seed: 0.78, heightFrac: 0.78 },
      { dir: new THREE.Vector3(0.35, 0.9, -0.28).normalize(), length: 0.72, seed: 0.88, heightFrac: 0.86 },
      { dir: new THREE.Vector3(0, 1, 0.05).normalize(), length: 0.65, seed: 0.6, heightFrac: 0.94 },
    ];
    const branches = branchDefs.map((b, i) => {
      const origin = new THREE.Vector3(0, b.heightFrac * FINAL_TRUNK_HEIGHT, 0);
      return buildGrowLine(origin, b.dir, b.length, branchSegments, b.seed, b.heightFrac, i * 0.08, BARK);
    });
    const branchGroup = new THREE.Group();
    branches.forEach((b) => branchGroup.add(new THREE.Line(b.geometry, b.material)));
    scene.add(branchGroup);

    const leafGeometry = buildLeafGeometry();
    const leafMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, transparent: true, opacity: 0.95, side: THREE.DoubleSide });
    const saplingLeafCount = 5;
    const canopyPerBranch = lowPower ? 4 : 7;
    const leafSlots: LeafSlot[] = [];
    for (let i = 0; i < saplingLeafCount; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const heightFrac = 0.16 + (i / saplingLeafCount) * 0.22;
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
        const t = 0.4 + (i / canopyPerBranch) * 0.6;
        const idx = Math.min(branch.points.length - 1, Math.round(t * branch.segments));
        const outward = new THREE.Vector3((Math.random() - 0.5) * 1.4, 0.3 + Math.random() * 0.7, (Math.random() - 0.5) * 1.4).normalize();
        const isGold = Math.random() < 0.14;
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
    leafMesh.frustumCulled = false;
    leafMesh.castShadow = true;
    const zeroScaleMatrix = new THREE.Matrix4().makeScale(0.0001, 0.0001, 0.0001);
    for (let i = 0; i < leafSlots.length; i++) {
      leafMesh.setMatrixAt(i, zeroScaleMatrix);
      leafMesh.setColorAt(i, leafSlots[i].color);
    }
    leafMesh.instanceMatrix.needsUpdate = true;
    scene.add(leafMesh);
    branchGroup.position.set(0, SOIL_TOP_Y, 0);
    leafMesh.position.set(0, SOIL_TOP_Y, 0);

    // ================================================================
    // Pod 0 — Entrepreneurship & discovery
    // ================================================================
    const pod0 = new THREE.Group();
    const pod0Pos = podPosition(0);
    pod0.position.copy(pod0Pos);
    pod0.position.y = SOIL_TOP_Y;
    pod0.visible = false;
    pod0.add(createGroundPad(2.3));
    pod0.add(createCropField(1.6, 1.2, 4, 5, lowPower).translateX(-1.3));
    const pod0Farmer = createPerson({ headwear: "turban", outfitColor: PALETTE.shirtCheck });
    pod0Farmer.position.set(-1.1, 0.09, 0.3);
    pod0.add(pod0Farmer);
    const pod0Stall = createStall();
    pod0Stall.position.set(0.6, 0.09, -0.2);
    pod0Stall.scale.setScalar(0.001);
    pod0.add(pod0Stall);
    const pod0Founder = createPerson({ outfitColor: PALETTE.saree, headwear: "none" });
    pod0Founder.position.set(0.4, 0.09, 0.5);
    pod0Founder.scale.setScalar(0.001);
    pod0.add(pod0Founder);
    const pod0Worker = createPerson({ outfitColor: PALETTE.sareeAlt });
    pod0Worker.position.set(1.0, 0.09, 0.55);
    pod0Worker.scale.setScalar(0.001);
    pod0.add(pod0Worker);
    const pod0Crates = [0, 1, 2].map((i) => {
      const c = createCrate(i === 1 ? PALETTE.crateDark : PALETTE.crate);
      c.position.set(0.55 + i * 0.24, 0.09, 0.15);
      c.scale.setScalar(0.001);
      pod0.add(c);
      return c;
    });
    scene.add(pod0);

    // ================================================================
    // Pod 1 — Value addition & export
    // ================================================================
    const pod1 = new THREE.Group();
    const pod1Pos = podPosition(1);
    pod1.position.copy(pod1Pos);
    pod1.position.y = SOIL_TOP_Y;
    pod1.visible = false;
    pod1.add(createGroundPad(2.6));
    const pod1Facility = createProcessingFacility();
    pod1Facility.position.set(-1.0, 0.09, -0.3);
    pod1Facility.scale.setScalar(0.001);
    pod1.add(pod1Facility);
    const pod1Belt = createConveyorBelt(1.3, 4);
    pod1Belt.group.position.set(0.1, 0.09, 0.4);
    pod1Belt.group.rotation.y = 0.2;
    pod1Belt.group.scale.setScalar(0.001);
    pod1.add(pod1Belt.group);
    const pod1Truck = createTruck();
    pod1Truck.group.position.set(2.6, 0.09, 0.6);
    pod1Truck.group.rotation.y = Math.PI;
    pod1Truck.group.scale.setScalar(0.001);
    pod1.add(pod1Truck.group);
    const pod1Water = new THREE.Mesh(
      new THREE.CircleGeometry(1.5, 24),
      new THREE.MeshStandardMaterial({ color: PALETTE.water, flatShading: true, transparent: true, opacity: 0 }),
    );
    pod1Water.rotation.x = -Math.PI / 2;
    pod1Water.position.set(1.6, 0.005, -1.1);
    pod1Water.receiveShadow = true;
    pod1.add(pod1Water);
    const pod1Ship = createCargoShip();
    pod1Ship.group.position.set(3.5, 0.09, -1.1);
    pod1Ship.group.scale.setScalar(0.001);
    pod1.add(pod1Ship.group);
    scene.add(pod1);

    // ================================================================
    // Pod 2 — Digital market access
    // ================================================================
    const pod2 = new THREE.Group();
    const pod2Pos = podPosition(2);
    pod2.position.copy(pod2Pos);
    pod2.position.y = SOIL_TOP_Y;
    pod2.visible = false;
    pod2.add(createGroundPad(2.2));
    const pod2Customer = createPerson({ outfitColor: PALETTE.sareeAlt, skinColor: PALETTE.skinLight });
    pod2Customer.position.set(-0.7, 0.09, 0.2);
    pod2.add(pod2Customer);
    const pod2Phone = createSmartphone();
    pod2Phone.group.position.set(-0.35, 0.75, 0.2);
    pod2Phone.group.rotation.set(0, 0.4, 0);
    pod2Phone.group.scale.setScalar(1.1);
    pod2.add(pod2Phone.group);
    const pod2Product = createProduceBasket(PALETTE.tomato, 6);
    pod2Product.position.set(0.5, 0.09, -0.3);
    pod2Product.scale.setScalar(0.001);
    pod2.add(pod2Product);
    const pod2Delivery = createTruck();
    pod2Delivery.group.scale.set(0.65, 0.65, 0.65);
    pod2Delivery.group.position.set(1.8, 0.09, 0.4);
    pod2Delivery.group.rotation.y = -Math.PI / 2;
    pod2.add(pod2Delivery.group);
    const pod2Farmer = createPerson({ headwear: "cap", outfitColor: PALETTE.shirtCheck });
    pod2Farmer.position.set(1.15, 0.09, 0.75);
    pod2Farmer.scale.setScalar(0.001);
    pod2.add(pod2Farmer);
    scene.add(pod2);

    // ================================================================
    // Pod 3 — Finance & investment
    // ================================================================
    const pod3 = new THREE.Group();
    const pod3Pos = podPosition(3);
    pod3.position.copy(pod3Pos);
    pod3.position.y = SOIL_TOP_Y;
    pod3.visible = false;
    pod3.add(createGroundPad(2.3));
    const pod3Bank = createBank();
    pod3Bank.position.set(-1.1, 0.09, -0.3);
    pod3Bank.scale.setScalar(0.001);
    pod3.add(pod3Bank);
    const pod3Farmer = createPerson({ headwear: "turban", outfitColor: PALETTE.shirtCheck });
    pod3Farmer.position.set(1.35, 0.09, 0.5);
    pod3.add(pod3Farmer);
    const pod3Phone = createSmartphone();
    pod3Phone.group.position.set(0.9, 0.72, 0.55);
    pod3Phone.group.rotation.set(0, -0.5, 0);
    pod3.add(pod3Phone.group);
    const pod3Irrigation = createIrrigationSystem(1.2);
    pod3Irrigation.group.position.set(0.2, 0.09, 1.1);
    pod3Irrigation.group.scale.setScalar(0.001);
    pod3.add(pod3Irrigation.group);
    const pod3PulseGeometry = new THREE.BufferGeometry();
    pod3PulseGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array([0, 0.6, 0]), 3));
    pod3PulseGeometry.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array([10]), 1));
    pod3PulseGeometry.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array([GOLD_BRIGHT.r, GOLD_BRIGHT.g, GOLD_BRIGHT.b]), 3));
    const pod3PulseMaterial = makePointsMaterial();
    const pod3Pulse = makeUncullablePoints(pod3PulseGeometry, pod3PulseMaterial);
    pod3.add(pod3Pulse);
    scene.add(pod3);

    // ================================================================
    // Pod 4 — Technology & AI
    // ================================================================
    const pod4 = new THREE.Group();
    const pod4Pos = podPosition(4);
    pod4.position.copy(pod4Pos);
    pod4.position.y = SOIL_TOP_Y;
    pod4.visible = false;
    pod4.add(createGroundPad(2.5));
    pod4.add(createCropField(1.8, 1.6, 5, 6, lowPower).translateX(-0.4).translateZ(0.4));
    const pod4Drone = createDrone();
    pod4Drone.group.position.set(0, 1.3, 0);
    pod4Drone.group.scale.setScalar(0.001);
    pod4.add(pod4Drone.group);
    const pod4Sensors = [
      [-0.9, 0.9],
      [-0.3, 1.0],
      [0.4, 0.6],
    ].map(([x, z]) => {
      const s = createSoilSensor();
      s.position.set(x, 0.09, z);
      s.scale.setScalar(0.001);
      pod4.add(s);
      return s;
    });
    const pod4Farmer = createPerson({ headwear: "cap", outfitColor: PALETTE.shirtCheck });
    pod4Farmer.position.set(1.3, 0.09, -0.5);
    pod4.add(pod4Farmer);
    const pod4Phone = createSmartphone();
    pod4Phone.group.scale.setScalar(0.55);
    pod4Phone.group.position.set(1.45, 0.65, -0.35);
    pod4Phone.group.rotation.set(-0.3, -0.6, 0);
    pod4.add(pod4Phone.group);
    const pod4Irrigation = createIrrigationSystem(1.4);
    pod4Irrigation.group.position.set(-0.4, 0.09, -0.9);
    pod4Irrigation.group.scale.setScalar(0.001);
    pod4.add(pod4Irrigation.group);
    const pod4ScanGeometry = new THREE.PlaneGeometry(1.6, 0.05);
    const pod4ScanMaterial = new THREE.MeshBasicMaterial({ color: 0x8fd9d0, transparent: true, opacity: 0, side: THREE.DoubleSide });
    const pod4Scan = new THREE.Mesh(pod4ScanGeometry, pod4ScanMaterial);
    pod4Scan.rotation.x = -Math.PI / 2;
    pod4Scan.position.set(-0.4, 0.1, 0.4);
    pod4.add(pod4Scan);
    scene.add(pod4);

    // ================================================================
    // Ecosystem extras — additional buildings/roads/solar/turbines that fill
    // in around all five pods for the wide Pillar-6 reveal, connecting them.
    // ================================================================
    const ecosystemGroup = new THREE.Group();
    const extraKinds: Array<"lab" | "warehouse" | "coldstorage" | "incubator" | "training"> = ["lab", "warehouse", "coldstorage", "incubator", "training"];
    const extraBuildings: THREE.Group[] = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + Math.PI / 5;
      const r = POD_RADIUS * 0.62;
      const b = createBuilding(extraKinds[i], 1.1 + Math.random() * 0.5, 1.0 + Math.random() * 0.8, 1.0);
      b.position.set(Math.sin(angle) * r, SOIL_TOP_Y, -Math.cos(angle) * r);
      b.scale.setScalar(0.001);
      ecosystemGroup.add(b);
      extraBuildings.push(b);
    }
    const extraSolar: THREE.Group[] = [];
    const extraTurbines: WindTurbineRig[] = [];
    for (let i = 0; i < (lowPower ? 3 : 6); i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = POD_RADIUS * (0.3 + Math.random() * 0.25);
      if (i % 2 === 0) {
        const s = createSolarPanel();
        s.position.set(Math.sin(angle) * r, SOIL_TOP_Y, -Math.cos(angle) * r);
        s.rotation.y = angle;
        s.scale.setScalar(0.001);
        ecosystemGroup.add(s);
        extraSolar.push(s);
      } else {
        const w = createWindTurbine();
        w.group.position.set(Math.sin(angle) * r, SOIL_TOP_Y, -Math.cos(angle) * r);
        w.group.scale.setScalar(0.001);
        ecosystemGroup.add(w.group);
        extraTurbines.push(w);
      }
    }
    const ecosystemRoads: THREE.Group[] = [];
    for (let i = 0; i < 5; i++) {
      const a = podPosition(i);
      const b = podPosition((i + 1) % 5);
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const dist = a.distanceTo(b);
      const road = createRoad(dist * 0.72, 0.4);
      road.position.set(mid.x, SOIL_TOP_Y + 0.011, mid.z);
      road.rotation.y = Math.atan2(b.x - a.x, b.z - a.z) + Math.PI / 2;
      road.scale.x = 0.001;
      ecosystemGroup.add(road);
      ecosystemRoads.push(road);
    }
    scene.add(ecosystemGroup);

    // Warm backlight glow behind the canopy + ambient gold motes (unchanged ambient dressing).
    const glowMaterial = makePointsMaterial();
    const glowGeometry = new THREE.BufferGeometry();
    glowGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array([0, 0.95, -0.7]), 3));
    glowGeometry.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array([130]), 1));
    glowGeometry.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array([GOLD_BRIGHT.r, GOLD_BRIGHT.g, GOLD_BRIGHT.b]), 3));
    const backlight = new THREE.Points(glowGeometry, glowMaterial);
    scene.add(backlight);

    const dustCount = lowPower ? 10 : 18;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);
    const dustSizes = new Float32Array(dustCount);
    const dustDirs: THREE.Vector3[] = [];
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = seedMesh.position.x;
      dustPositions[i * 3 + 1] = seedMesh.position.y;
      dustPositions[i * 3 + 2] = seedMesh.position.z;
      const c = GOLD_ACCENT.clone().lerp(GOLD_BRIGHT, Math.random() * 0.5);
      dustColors[i * 3] = c.r;
      dustColors[i * 3 + 1] = c.g;
      dustColors[i * 3 + 2] = c.b;
      dustSizes[i] = 4 + Math.random() * 5;
      dustDirs.push(new THREE.Vector3((Math.random() - 0.5) * 0.7, 0.2 + Math.random() * 0.3, (Math.random() - 0.5) * 0.7));
    }
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute("aColor", new THREE.BufferAttribute(dustColors, 3));
    dustGeometry.setAttribute("aSize", new THREE.BufferAttribute(dustSizes, 1));
    const dustMaterial = makePointsMaterial();
    const dust = makeUncullablePoints(dustGeometry, dustMaterial);
    scene.add(dust);

    const moteCount = lowPower ? 14 : 26;
    const moteGeometry = new THREE.BufferGeometry();
    const motePositions = new Float32Array(moteCount * 3);
    const moteColors = new Float32Array(moteCount * 3);
    const moteSizes = new Float32Array(moteCount);
    const moteBase: number[] = [];
    const moteSpeed: number[] = [];
    const motePhase: number[] = [];
    for (let i = 0; i < moteCount; i++) {
      const x = (Math.random() - 0.5) * 3.4;
      const y = -1 + Math.random() * 2.8;
      const z = (Math.random() - 0.5) * 1.8;
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
    const motes = makeUncullablePoints(moteGeometry, moteMaterial);
    scene.add(motes);

    const burstMaterial = makePointsMaterial();
    const burstGeometry = new THREE.BufferGeometry();
    burstGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array([0, CANOPY_CENTER_Y, 0.3]), 3));
    burstGeometry.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array([90]), 1));
    burstGeometry.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array([GOLD_BRIGHT.r, GOLD_BRIGHT.g, GOLD_BRIGHT.b]), 3));
    const burst = new THREE.Points(burstGeometry, burstMaterial);
    scene.add(burst);

    // ---- Camera keyframes: germination → pod0..pod4 (arrived) → wide → dive ----
    const camKeys: THREE.Vector3[] = [new THREE.Vector3(0, 3, 6)];
    const lookKeys: THREE.Vector3[] = [new THREE.Vector3(0, 1, 0)];
    for (let i = 0; i < 5; i++) {
      const p = podPosition(i);
      const outward = p.clone().normalize();
      camKeys.push(p.clone().addScaledVector(outward, 5.5).add(new THREE.Vector3(0, 3.0, 0)));
      lookKeys.push(p.clone().add(new THREE.Vector3(0, 0.7, 0)));
    }
    const WIDE_CAM = new THREE.Vector3(0, 15, 17);
    const WIDE_LOOK = new THREE.Vector3(0, 0.6, 0);

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
    const bgColor = SKY_DARK.clone();
    const camPos = new THREE.Vector3();
    const camLook = new THREE.Vector3();

    let frameId = 0;
    let running = true;
    let launchStart: number | null = null;
    let skipStart: number | null = null;
    let lastDebugSecond = -1;

    const round = (n: number, d = 2) => Number(n.toFixed(d));
    const logDiagnostics = (label: string, t: number) => {
      if (!debugEnabled) return;
      console.log(`[launch] ${label}`, {
        phase: currentPhase,
        t: round(t),
        camera: { x: round(camera.position.x), y: round(camera.position.y), z: round(camera.position.z), fov: round(camera.fov, 1) },
        lookAt: { x: round(camLook.x), y: round(camLook.y), z: round(camLook.z) },
        pods: { entrepreneurship: pod0.visible, valueAddition: pod1.visible, marketLinkages: pod2.visible, finance: pod3.visible, technologyAI: pod4.visible },
        roadsReveal: ecosystemRoads.map((r) => round(r.scale.x, 3)),
        loopActive: running,
      });
    };

    const setPhase = (phase: LaunchPhase, t: number) => {
      if (phase === currentPhase) return;
      currentPhase = phase;
      if (debugEnabled) console.log(`[launch] phase: ${phase}`);
      logDiagnostics("phase-change", t);
      onPhaseChangeRef.current?.(phase);
    };

    const render = (elapsed: number) => {
      const isLaunching = launchStart !== null;
      const t = isLaunching ? elapsed - (launchStart as number) : 0;
      lastT = t;
      try {
        if (skipStart !== null) {
          const skT = clamp01((elapsed - skipStart) / 0.45);
          overlay.style.backgroundColor = `#${NIGHT_SOIL.getHexString()}`;
          overlay.style.opacity = String(skT);
          if (skT >= 1) finish("complete (skipped)");
          return;
        }
        if (skipRef.current && isLaunching) {
          skipStart = elapsed;
          setPhase("transition", t);
          if (debugEnabled) console.log("[launch] skip requested — fading out and completing early");
          return;
        }
        if (crashed) return;

        const sway = Math.sin(elapsed * 0.22) * 0.035;
        const swayY = Math.sin(elapsed * 0.17 + 1.4) * 0.02;

        if (!isLaunching) {
          camera.position.set(sway * 0.6, IDLE_CAM.y + swayY, IDLE_CAM.z);
          camera.fov = IDLE_CAM.fov;
          camera.updateProjectionMatrix();
          camera.lookAt(sway * 0.3, 0.1, 0);
          seedMaterial.opacity = 0.95;
          const idleBob = Math.sin(elapsed * 0.9) * 0.01;
          seedMesh.position.y = SOIL_TOP_Y + 0.03 + idleBob;
          moteMaterial.uniforms.uGlobalAlpha.value = 0.4;
          for (let i = 0; i < moteCount; i++) {
            const bx = moteBase[i * 3];
            const by = moteBase[i * 3 + 1];
            const bz = moteBase[i * 3 + 2];
            const rise = ((elapsed * moteSpeed[i] * 0.6) % 1) * 2.4;
            let y = by + rise;
            if (y > 1.5) y -= 2.4;
            const moteSway = Math.sin(elapsed * 0.6 + motePhase[i]) * 0.12;
            motePosAttr.setXYZ(i, bx + moteSway, y, bz);
          }
          motePosAttr.needsUpdate = true;
          renderer.render(scene, camera);
          return;
        }

        setPhase(phaseAt(t), t);

        // ---- Germination ----
        const preCrack = 1 - remap(t, CRACK_START, CRACK_START + 0.08);
        seedMaterial.opacity = Math.max(0, preCrack) * 0.95;
        const crackT = easeOutBack(remap(t, CRACK_START, CRACK_END));
        const crackFade = 1 - remap(t, CRACK_END, CRACK_END + 0.5);
        seedHalfTop.position.set(seedMesh.position.x, seedMesh.position.y + crackT * 0.09, seedMesh.position.z - crackT * 0.02);
        seedHalfTop.rotation.x = -crackT * 0.9;
        seedHalfBottom.position.set(seedMesh.position.x, seedMesh.position.y - crackT * 0.02, seedMesh.position.z + crackT * 0.03);
        seedHalfBottom.rotation.x = crackT * 0.5;
        const halfAlpha = remap(t, CRACK_START, CRACK_START + 0.1) * Math.max(0, crackFade) * 0.95;
        (seedHalfTop.material as THREE.MeshStandardMaterial).opacity = halfAlpha;
        (seedHalfBottom.material as THREE.MeshStandardMaterial).opacity = halfAlpha;

        const dustT = easeOutCubic(remap(t, CRACK_START, CRACK_END));
        const dustAlpha = remap(t, CRACK_START, CRACK_START + 0.1) * (1 - remap(t, CRACK_END, CRACK_END + 0.3));
        for (let i = 0; i < dustCount; i++) {
          dustPosAttr.setXYZ(i, seedMesh.position.x + dustDirs[i].x * dustT, seedMesh.position.y + dustDirs[i].y * dustT, seedMesh.position.z + dustDirs[i].z * dustT);
        }
        dustPosAttr.needsUpdate = true;
        dustMaterial.uniforms.uGlobalAlpha.value = Math.max(0, dustAlpha) * 0.8;

        roots.forEach((r) => {
          const localT = smooth(remap(t, CRACK_END - 0.1 + r.stagger, ROOTS_END + r.stagger * 0.5));
          r.geometry.setDrawRange(0, Math.floor(localT * r.segments));
          r.material.opacity = 0.85 * remap(t, CRACK_END - 0.1, CRACK_END + 0.1);
        });

        // ---- Tree — grows continuously across the whole sequence ----
        const growT = smooth(remap(t, GROW_START, TRUNK_GROW_END));
        const trunkHeightNow = growT * FINAL_TRUNK_HEIGHT;
        const radiusNow = 0.28 + growT * 0.9;
        trunkMesh.scale.set(radiusNow, Math.max(0.001, trunkHeightNow), radiusNow);
        trunkMaterial.opacity = remap(t, GROW_START, GROW_START + 0.15) * 0.98;
        trunkMaterial.color.copy(SPROUT_GREEN).lerp(BARK, smooth(remap(t, GROW_START, GROW_START + 3)));

        const windAmount = remap(t, GROW_START + 0.5, GROW_START + 2.5) * 0.05;
        const wind = Math.sin(elapsed * 0.7) * windAmount;
        branchGroup.rotation.z = wind;
        leafMesh.rotation.z = wind;

        branches.forEach((b) => {
          if (b.revealStart < 0 && trunkHeightNow >= b.originHeightFrac * FINAL_TRUNK_HEIGHT) b.revealStart = t;
          const bt = b.revealStart < 0 ? 0 : smooth(remap(t, b.revealStart + b.stagger, b.revealStart + b.stagger + 0.9));
          b.geometry.setDrawRange(0, Math.floor(bt * b.segments));
          b.material.opacity = 0.9 * remap(t, GROW_START, GROW_START + 0.3);
        });

        for (let i = 0; i < leafSlots.length; i++) {
          const slot = leafSlots[i];
          let originNow: THREE.Vector3;
          let grownEnough: boolean;
          if (slot.gatedOn === "trunk") {
            grownEnough = trunkHeightNow >= slot.heightFrac * FINAL_TRUNK_HEIGHT;
            originNow = new THREE.Vector3(0, Math.min(trunkHeightNow, slot.heightFrac * FINAL_TRUNK_HEIGHT), 0);
          } else {
            const branch = branches[slot.gatedOn];
            const branchT = branch.revealStart < 0 ? 0 : smooth(remap(t, branch.revealStart + branch.stagger, branch.revealStart + branch.stagger + 0.9));
            grownEnough = branchT >= slot.heightFrac;
            originNow = slot.base;
          }
          if (slot.revealStart < 0 && grownEnough) slot.revealStart = t;
          const leafT = slot.revealStart < 0 ? 0 : smooth(remap(t, slot.revealStart, slot.revealStart + 0.4));
          if (leafT <= 0) {
            tmpScale.setScalar(0.0001);
            tmpMatrix.compose(originNow, tmpQuat, tmpScale);
          } else {
            const leafSway = slot.revealStart >= 0 ? Math.sin(elapsed * 1.4 + slot.swayPhase) * slot.swayAmount * Math.min(1, leafT * 3) : 0;
            tmpPos.copy(originNow).addScaledVector(slot.outward, 0.02 + leafT * 0.05);
            tmpQuat.setFromUnitVectors(upAxis, slot.outward);
            const spin = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), slot.rotZ + leafSway);
            tmpQuat.multiply(spin);
            tmpScale.setScalar(slot.scale * leafT);
            tmpMatrix.compose(tmpPos, tmpQuat, tmpScale);
          }
          leafMesh.setMatrixAt(i, tmpMatrix);
        }
        leafMesh.instanceMatrix.needsUpdate = true;

        const moodT = smooth(remap(t, MOOD_START, MOOD_END));
        bgColor.copy(SKY_DARK).lerp(SKY_SUNRISE, moodT * 0.85);
        scene.background = bgColor;
        if (scene.fog) (scene.fog as THREE.Fog).color.copy(bgColor);
        groundMaterial.color.copy(new THREE.Color(0x4a3320)).lerp(new THREE.Color(0x8a6a3c), moodT);
        sun.color.copy(new THREE.Color(0x9fb0c0)).lerp(new THREE.Color(0xffe4b8), moodT);
        sun.intensity = 0.9 + moodT * 0.6;

        glowMaterial.uniforms.uGlobalAlpha.value = remap(t, GROW_START + 1.2, GROW_START + 2.2) * 0.4;
        for (let i = 0; i < moteCount; i++) {
          const bx = moteBase[i * 3];
          const by = moteBase[i * 3 + 1];
          const bz = moteBase[i * 3 + 2];
          const rise = ((elapsed * moteSpeed[i] * 0.6) % 1) * 2.4;
          let y = by + rise;
          if (y > 1.5) y -= 2.4;
          const moteSway = Math.sin(elapsed * 0.6 + motePhase[i]) * 0.12;
          motePosAttr.setXYZ(i, bx + moteSway, y, bz);
        }
        motePosAttr.needsUpdate = true;
        moteMaterial.uniforms.uGlobalAlpha.value = 0.4;

        // ================================================================
        // Pod 0 — Entrepreneurship: farmer tends crops, a stall assembles,
        // a founder + worker and packaged crates appear.
        // ================================================================
        {
          const w = POD_WINDOWS[0];
          pod0.visible = t > w.start - POD_REVEAL_LEAD;
          const armSwing = Math.sin(elapsed * 2.2) * 0.5;
          pod0Farmer.userData.rightArm.rotation.x = -0.6 + armSwing * 0.4;
          pod0Farmer.userData.leftArm.rotation.x = 0.3 - armSwing * 0.3;
          const assembleT = easeOutBack(pulseWindow(t, w.start + 0.4, w.end, 0.5, 0) || remap(t, w.start + 0.4, w.start + 1.3));
          const scaleT = smooth(remap(t, w.start + 0.4, w.start + 1.3));
          pod0Stall.scale.setScalar(Math.max(0.001, scaleT));
          const founderT = smooth(remap(t, w.start + 1.1, w.start + 1.9));
          pod0Founder.scale.setScalar(Math.max(0.001, founderT));
          const workerT = smooth(remap(t, w.start + 1.6, w.start + 2.3));
          pod0Worker.scale.setScalar(Math.max(0.001, workerT));
          pod0Crates.forEach((c, i) => {
            const ct = smooth(remap(t, w.start + 1.8 + i * 0.15, w.start + 2.4 + i * 0.15));
            c.scale.setScalar(Math.max(0.001, ct));
          });
          void assembleT;
        }

        // ================================================================
        // Pod 1 — Value addition: facility + belt assemble, packages travel,
        // the truck drives up, water fades in and the ship sails on.
        // ================================================================
        {
          const w = POD_WINDOWS[1];
          pod1.visible = t > w.start - POD_REVEAL_LEAD;
          const facilityT = smooth(remap(t, w.start, w.start + 0.9));
          pod1Facility.scale.setScalar(Math.max(0.001, facilityT));
          const beltT = smooth(remap(t, w.start + 0.5, w.start + 1.2));
          pod1Belt.group.scale.setScalar(Math.max(0.001, beltT));
          if (beltT > 0.3) {
            pod1Belt.packages.forEach((pkg, i) => {
              const cycle = ((elapsed * 0.3 + i / pod1Belt.packages.length) % 1) * pod1Belt.length - pod1Belt.length / 2;
              pkg.position.x = cycle;
            });
          }
          const truckArriveT = easeOutCubic(remap(t, w.start + 1.3, w.start + 2.4));
          pod1Truck.group.scale.setScalar(Math.max(0.001, smooth(remap(t, w.start + 1.2, w.start + 1.5))));
          pod1Truck.group.position.x = 2.6 - truckArriveT * 1.6;
          pod1Truck.wheels.forEach((wheel) => (wheel.rotation.y = elapsed * 4));
          const waterT = remap(t, w.start + 1.8, w.start + 2.4);
          (pod1Water.material as THREE.MeshStandardMaterial).opacity = waterT * 0.85;
          const shipT = smooth(remap(t, w.start + 2.2, w.end - 0.2));
          pod1Ship.group.scale.setScalar(Math.max(0.001, shipT));
          pod1Ship.group.position.x = 3.5 - shipT * 1.5;
          pod1Ship.group.position.y = 0.09 + Math.sin(elapsed * 1.4) * 0.02 * shipT;
          pod1Ship.group.rotation.z = Math.sin(elapsed * 1.1) * 0.02 * shipT;
        }

        // ================================================================
        // Pod 2 — Market access: customer browses the phone, orders, product
        // + delivery vehicle animate toward the farmer receiving it.
        // ================================================================
        {
          const w = POD_WINDOWS[2];
          pod2.visible = t > w.start - POD_REVEAL_LEAD;
          const cardCycle = Math.floor(remap(t, w.start + 0.3, w.start + 1.6) * 3);
          pod2Phone.cards.forEach((card, i) => {
            const active = i === cardCycle % 3;
            const s = active ? 1.08 : 1;
            card.scale.setScalar(s);
          });
          const orderT = pulseWindow(t, w.start + 1.6, w.start + 2.2, 0.3, 0);
          pod2Phone.group.position.y = 0.75 + orderT * 0.06;
          const productT = smooth(remap(t, w.start + 1.8, w.start + 2.3));
          pod2Product.scale.setScalar(Math.max(0.001, productT));
          const deliveryT = easeOutCubic(remap(t, w.start + 2.1, w.end - 0.2));
          pod2Delivery.group.position.z = 0.4 - deliveryT * 1.0;
          const farmerT = smooth(remap(t, w.end - 0.6, w.end - 0.1));
          pod2Farmer.scale.setScalar(Math.max(0.001, farmerT));
        }

        // ================================================================
        // Pod 3 — Finance: bank assembles, a light-trail pulse travels from
        // the bank to the farmer's phone, then irrigation infrastructure
        // rises as the investment shows up on the farm.
        // ================================================================
        {
          const w = POD_WINDOWS[3];
          pod3.visible = t > w.start - POD_REVEAL_LEAD;
          const bankT = smooth(remap(t, w.start, w.start + 0.9));
          pod3Bank.scale.setScalar(Math.max(0.001, bankT));
          const pulseAlpha = pulseWindow(t, w.start + 0.9, w.start + 2.0, 0.3, 0.3);
          const pulseCycle = remap(t, w.start + 0.9, w.start + 2.0);
          const bankWorldX = pod3Bank.position.x;
          const phoneWorldX = pod3Phone.group.position.x;
          const px = bankWorldX + (phoneWorldX - bankWorldX) * pulseCycle;
          const py = 0.5 + Math.sin(pulseCycle * Math.PI) * 0.4;
          const pz = pod3Bank.position.z + (pod3Phone.group.position.z - pod3Bank.position.z) * pulseCycle;
          (pod3Pulse.geometry.attributes.position as THREE.BufferAttribute).setXYZ(0, px, py, pz);
          (pod3Pulse.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
          pod3PulseMaterial.uniforms.uGlobalAlpha.value = Math.max(0, pulseAlpha);
          const creditT = pulseWindow(t, w.start + 1.9, w.start + 2.6, 0.25, 0);
          pod3Phone.group.scale.setScalar(1 + creditT * 0.15);
          const irrigationT = smooth(remap(t, w.start + 2.2, w.end - 0.3));
          pod3Irrigation.group.scale.setScalar(Math.max(0.001, irrigationT));
        }

        // ================================================================
        // Pod 4 — Technology & AI: drone flies and scans, sensors + irrigation
        // appear, the farmer's phone shows the recommendation.
        // ================================================================
        {
          const w = POD_WINDOWS[4];
          pod4.visible = t > w.start - POD_REVEAL_LEAD;
          const droneT = smooth(remap(t, w.start, w.start + 0.8));
          pod4Drone.group.scale.setScalar(Math.max(0.001, droneT));
          const flyPhase = remap(t, w.start, w.end);
          pod4Drone.group.position.x = Math.sin(flyPhase * Math.PI * 2.2) * 0.9;
          pod4Drone.group.position.z = Math.cos(flyPhase * Math.PI * 1.6) * 0.6 - 0.1;
          pod4Drone.group.position.y = 1.3 + Math.sin(elapsed * 2) * 0.05;
          pod4Drone.propellers.forEach((p) => (p.rotation.y = elapsed * 40));
          pod4Sensors.forEach((s, i) => {
            const st = smooth(remap(t, w.start + 0.6 + i * 0.2, w.start + 1.2 + i * 0.2));
            s.scale.setScalar(Math.max(0.001, st));
          });
          const scanT = pulseWindow(t, w.start + 1.4, w.start + 2.4, 0.3, 0.3);
          pod4Scan.position.z = -0.6 + remap(t, w.start + 1.4, w.start + 2.4) * 1.6;
          pod4ScanMaterial.opacity = Math.max(0, scanT) * 0.7;
          const phoneT = smooth(remap(t, w.start + 2.0, w.start + 2.6));
          pod4Phone.group.scale.setScalar(Math.max(0.001, 0.55 * phoneT));
          const irrigationT = smooth(remap(t, w.start + 2.3, w.end - 0.2));
          pod4Irrigation.group.scale.setScalar(Math.max(0.001, irrigationT));
        }

        // ================================================================
        // Ecosystem — extra buildings/solar/turbines/roads rise as the
        // camera pulls back, connecting all five pods into one skyline.
        // ================================================================
        {
          const w = PILLAR_SCENES.ecosystem;
          extraBuildings.forEach((b, i) => {
            const bt = smooth(remap(t, w.start + i * 0.25, w.start + 1.0 + i * 0.25));
            b.scale.setScalar(Math.max(0.001, bt));
          });
          extraSolar.forEach((s, i) => {
            const st = smooth(remap(t, w.start + 1.2 + i * 0.15, w.start + 1.8 + i * 0.15));
            s.scale.setScalar(Math.max(0.001, st));
          });
          extraTurbines.forEach((wt, i) => {
            const tt = smooth(remap(t, w.start + 1.4 + i * 0.2, w.start + 2.0 + i * 0.2));
            wt.group.scale.setScalar(Math.max(0.001, tt));
            wt.blades.rotation.z = elapsed * 3;
          });
          ecosystemRoads.forEach((r, i) => {
            const rt = smooth(remap(t, w.start + 0.6 + i * 0.15, w.start + 1.6 + i * 0.15));
            r.scale.x = Math.max(0.001, rt);
          });
        }

        // ---- Camera: germination → pods (arrive+hold) → wide → dive ----
        let progress = 0;
        for (let i = 0; i < 5; i++) {
          const w = POD_WINDOWS[i];
          if (t <= w.end || i === 4) {
            const arriveT = smooth(remap(t, w.start, w.start + (w.end - w.start) * 0.42));
            progress = i + arriveT;
            break;
          }
        }
        const idx = Math.min(4, Math.floor(progress));
        const frac = progress - idx;
        camPos.copy(camKeys[idx]).lerp(camKeys[idx + 1], frac);
        camLook.copy(lookKeys[idx]).lerp(lookKeys[idx + 1], frac);

        const wideT = smooth(remap(t, PILLAR_SCENES.ecosystem.start - 0.4, PILLAR_SCENES.ecosystem.end - 0.6));
        camPos.lerp(WIDE_CAM, wideT);
        camLook.lerp(WIDE_LOOK, wideT);
        let fov = 46 + wideT * 12;

        const diveT = smooth(remap(t, TRANSITION_START - 0.4, LAUNCH_TOTAL_DURATION - 0.5));
        camPos.lerp(new THREE.Vector3(0, CANOPY_CENTER_Y, 0.55), diveT);
        camLook.lerp(new THREE.Vector3(0, CANOPY_CENTER_Y, 0), diveT);
        fov = fov + diveT * (62 - fov);

        camera.position.set(camPos.x + sway * 0.1 * (1 - diveT), camPos.y + swayY * 0.2, camPos.z);
        camera.fov = fov;
        camera.updateProjectionMatrix();
        camera.lookAt(camLook);

        const burstT = easeInCubic(remap(t, TRANSITION_START, LAUNCH_TOTAL_DURATION - 0.15));
        burst.scale.setScalar(1 + burstT * 26);
        burstMaterial.uniforms.uGlobalAlpha.value = remap(t, TRANSITION_START, TRANSITION_START + 0.4) * (1 - remap(t, LAUNCH_TOTAL_DURATION - 0.4, LAUNCH_TOTAL_DURATION)) * 0.9;

        const overlayIn = remap(t, TRANSITION_START + 0.3, LAUNCH_TOTAL_DURATION);
        const overlayColor = SKY_SUNRISE.clone().lerp(NIGHT_SOIL, remap(t, TRANSITION_START + 0.3, LAUNCH_TOTAL_DURATION));
        overlay.style.backgroundColor = `#${overlayColor.getHexString()}`;
        overlay.style.opacity = String(overlayIn);

        if (debugEnabled) {
          const sec = Math.floor(t);
          if (sec !== lastDebugSecond) {
            lastDebugSecond = sec;
            logDiagnostics("tick", t);
          }
        }

        renderer.render(scene, camera);
      } catch (err) {
        crashed = true;
        console.error(
          `[launch] render() threw at phase="${currentPhase}" t=${t.toFixed(2)}s — freezing the scene here instead of redirecting home. Skip is still available.`,
          err,
        );
        logDiagnostics("render-error", t);
      }
    };

    render(0);

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
      const dt = Math.min((now - lastTs) / 1000, 0.25);
      lastTs = now;
      elapsed += dt;
      if (launchingRef.current && launchStart === null) launchStart = elapsed;
      render(elapsed);

      if (launchStart !== null && skipStart === null && !crashed) {
        const t = elapsed - launchStart;
        if (t >= LAUNCH_TOTAL_DURATION) {
          // Explicit completion gate — never derive "done" from a single pod's window (e.g. finance)
          // finishing; every later stage must have genuinely completed before the redirect fires.
          const technologyAIComplete = t >= PILLAR_SCENES.tech.end;
          const ecosystemRevealComplete = t >= PILLAR_SCENES.ecosystem.end;
          const roadsRevealComplete = ecosystemRoads.every((r) => r.scale.x >= 0.999);
          const canopyTransitionComplete = t >= LAUNCH_TOTAL_DURATION - 0.5;
          if (technologyAIComplete && ecosystemRevealComplete && roadsRevealComplete && canopyTransitionComplete) {
            finish();
            return;
          }
          console.warn("[launch] reached total duration but completion flags aren't all satisfied yet — deferring finish()", {
            t: Number(t.toFixed(2)),
            technologyAIComplete,
            ecosystemRevealComplete,
            roadsRevealComplete,
            canopyTransitionComplete,
          });
        }
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
      renderer.domElement.removeEventListener("webglcontextrestored", onContextRestored);
      resizeObserver.disconnect();
      disposeObject3D(scene);
      renderer.dispose();
      // renderer.dispose() frees Three.js-side resources but does not itself release the
      // underlying WebGL context — that's left to the browser's own GC, which isn't
      // deterministic. Across repeated mounts (React Strict Mode's dev double-invoke, or a
      // user navigating to/from /launch more than once) that lets live contexts pile up until
      // the browser's hard cap on simultaneous contexts is hit and it evicts one — which
      // previously looked identical to the sequence finishing early. Force it closed now.
      renderer.getContext()?.getExtension("WEBGL_lose_context")?.loseContext();
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
        className="pointer-events-none absolute inset-0 z-20 opacity-0"
        style={{ background: `#${NIGHT_SOIL.getHexString()}` }}
        aria-hidden="true"
      />
    </div>
  );
}
