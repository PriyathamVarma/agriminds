import * as THREE from "three";

/**
 * The low-poly asset library for /launch — every recognisable object in the
 * six-pillar world (farmers, buildings, vehicles, devices, drones...) is built
 * here from primitive Three.js geometry, grouped, and returned as a THREE.Group
 * whose `userData` exposes whatever sub-parts the orchestrating scene needs to
 * animate (an arm, a set of wheels, a propeller, a belt item). No external
 * models, no textures beyond flat colour — the diorama look comes entirely from
 * flat-shaded low-segment primitives + real lights/shadows.
 */

// ---------------------------------------------------------------------------
// Palette — warm, natural, matching the site's brand (deep green / soil brown
// / warm gold) extended with just enough practical variety (sky, water, steel,
// produce colours) to keep every object readable at a glance.
// ---------------------------------------------------------------------------
export const PALETTE = {
  soil: 0x4a3320,
  soilLight: 0x7a5533,
  grass: 0x3f8f5c,
  grassLight: 0x6bbf82,
  leaf: 0x4fa568,
  leafLight: 0x8fe0a8,
  bark: 0x5c4128,
  skin: 0xc9895f,
  skinLight: 0xdba474,
  shirtBlue: 0xdbe4e8,
  shirtCheck: 0xb8c4c9,
  saree: 0xc1712f,
  sareeAlt: 0x2f6b5e,
  turban: 0xe0a05a,
  gold: 0xe0a05a,
  goldBright: 0xf3e1cc,
  cream: 0xfaf6ee,
  steel: 0x8a95a0,
  steelDark: 0x5a6570,
  wood: 0x8a6a3c,
  crate: 0x3a6b8a,
  crateDark: 0x2a4b5f,
  tomato: 0xd94f3a,
  onion: 0xd9a06a,
  produceGreen: 0x7ab55c,
  truckOrange: 0xe0793f,
  truckCab: 0xf3e1cc,
  water: 0x3f7f8f,
  waterLight: 0x6fb0c0,
  sky: 0xbfd9d6,
  glass: 0xa9d9d0,
  solarBlue: 0x1f4d3a,
  bankStone: 0xd8cdb0,
  brandGold: 0xf0c975,
  screenDark: 0x14201a,
  roadDark: 0x3a2c1c,
  roofRed: 0xa8563f,
  roofGreen: 0x2f6b45,
} as const;

const mat = (color: number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, metalness: 0.05, ...opts });

function shadowed(mesh: THREE.Object3D, cast = true, receive = true) {
  mesh.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.castShadow = cast;
      m.receiveShadow = receive;
    }
  });
  return mesh;
}

// ---------------------------------------------------------------------------
// People — a small rig of capsule/sphere/cone parts, animatable via userData
// references to the limb groups (each pivoted at the shoulder/hip so it can be
// rotated for a simple walk/wave cycle).
// ---------------------------------------------------------------------------
export type PersonOptions = {
  skinColor?: number;
  outfitColor?: number;
  headwear?: "turban" | "cap" | "none";
  scale?: number;
};

export function createPerson(opts: PersonOptions = {}): THREE.Group {
  const { skinColor = PALETTE.skin, outfitColor = PALETTE.shirtBlue, headwear = "none", scale = 1 } = opts;
  const group = new THREE.Group();
  const skinMat = mat(skinColor);
  const outfitMat = mat(outfitColor);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.28, 2, 6), outfitMat);
  torso.position.y = 0.42;
  group.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), skinMat);
  head.position.y = 0.72;
  group.add(head);

  if (headwear === "turban") {
    const turban = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.65), mat(PALETTE.turban));
    turban.position.y = 0.77;
    group.add(turban);
  } else if (headwear === "cap") {
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.09, 8), mat(PALETTE.gold));
    cap.position.y = 0.8;
    group.add(cap);
  }

  const armGeo = new THREE.CapsuleGeometry(0.04, 0.22, 2, 5);
  const legGeo = new THREE.CapsuleGeometry(0.05, 0.24, 2, 5);
  const legMat = mat(0x2a3b30);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.16, 0.55, 0);
  const leftArmMesh = new THREE.Mesh(armGeo, skinMat);
  leftArmMesh.position.y = -0.13;
  leftArm.add(leftArmMesh);
  group.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.16, 0.55, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, skinMat);
  rightArmMesh.position.y = -0.13;
  rightArm.add(rightArmMesh);
  group.add(rightArm);

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.06, 0.28, 0);
  const leftLegMesh = new THREE.Mesh(legGeo, legMat);
  leftLegMesh.position.y = -0.13;
  leftLeg.add(leftLegMesh);
  group.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.06, 0.28, 0);
  const rightLegMesh = new THREE.Mesh(legGeo, legMat);
  rightLegMesh.position.y = -0.13;
  rightLeg.add(rightLegMesh);
  group.add(rightLeg);

  group.scale.setScalar(scale);
  group.userData = { leftArm, rightArm, leftLeg, rightLeg, head };
  shadowed(group);
  return group;
}

// ---------------------------------------------------------------------------
// Crop field — an InstancedMesh of small cone "plants" over a ground patch.
// ---------------------------------------------------------------------------
export function createCropField(width: number, depth: number, rows: number, cols: number, lowPower: boolean): THREE.Group {
  const group = new THREE.Group();
  const count = lowPower ? Math.min(rows * cols, 40) : rows * cols;
  const geo = new THREE.ConeGeometry(0.08, 0.26, 5);
  const plants = new THREE.InstancedMesh(geo, mat(PALETTE.grassLight), count);
  plants.castShadow = true;
  plants.receiveShadow = true;
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3(1, 1, 1);
  let i = 0;
  for (let r = 0; r < rows && i < count; r++) {
    for (let c = 0; c < cols && i < count; c++) {
      const x = (c / (cols - 1) - 0.5) * width + (Math.random() - 0.5) * 0.12;
      const z = (r / (rows - 1) - 0.5) * depth + (Math.random() - 0.5) * 0.12;
      const sc = 0.8 + Math.random() * 0.5;
      s.set(sc, sc, sc);
      m4.compose(new THREE.Vector3(x, 0.13 * sc, z), q, s);
      plants.setMatrixAt(i++, m4);
    }
  }
  plants.instanceMatrix.needsUpdate = true;
  group.add(plants);
  return group;
}

// ---------------------------------------------------------------------------
// Produce — a small pile/basket of "fruit" spheres, and crate stacks.
// ---------------------------------------------------------------------------
export function createProduceBasket(color: number = PALETTE.tomato, count = 7): THREE.Group {
  const group = new THREE.Group();
  const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.22, 10, 1, true), mat(PALETTE.wood, { side: THREE.DoubleSide }));
  basket.position.y = 0.11;
  group.add(basket);
  const fruitGeo = new THREE.SphereGeometry(0.06, 6, 5);
  const fruitMat = mat(color);
  for (let i = 0; i < count; i++) {
    const f = new THREE.Mesh(fruitGeo, fruitMat);
    const a = (i / count) * Math.PI * 2;
    const r = Math.random() * 0.1;
    f.position.set(Math.cos(a) * r, 0.2 + Math.random() * 0.08, Math.sin(a) * r);
    group.add(f);
  }
  // Small, numerous, and repeated across pods — cast=false keeps the shadow depth pass
  // (and GPU/driver load) down without a visible loss at this scale.
  shadowed(group, false, true);
  return group;
}

export function createCrate(color: number = PALETTE.crate): THREE.Group {
  const group = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.24, 0.34), mat(color));
  box.position.y = 0.12;
  group.add(box);
  const rim = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.03, 0.36), mat(PALETTE.crateDark));
  rim.position.y = 0.24;
  group.add(rim);
  shadowed(group, false, true);
  return group;
}

// ---------------------------------------------------------------------------
// Small stall / workspace — a startup kiosk that "assembles" for Pillar 1.
// ---------------------------------------------------------------------------
export function createStall(): THREE.Group {
  const group = new THREE.Group();
  const counter = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.5, 0.5), mat(PALETTE.wood));
  counter.position.y = 0.25;
  group.add(counter);
  const postGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6);
  [
    [-0.5, -0.2],
    [0.5, -0.2],
    [-0.5, 0.2],
    [0.5, 0.2],
  ].forEach(([x, z]) => {
    const post = new THREE.Mesh(postGeo, mat(PALETTE.bark));
    post.position.set(x, 0.9, z);
    group.add(post);
  });
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.4, 4), mat(PALETTE.gold));
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 1.6;
  group.add(roof);
  shadowed(group);
  return group;
}

// ---------------------------------------------------------------------------
// Buildings — a generic parametrised low-poly building for facilities,
// warehouses, banks, labs, greenhouses, etc.
// ---------------------------------------------------------------------------
export type BuildingKind = "warehouse" | "lab" | "bank" | "coldstorage" | "incubator" | "training";

export function createBuilding(kind: BuildingKind, w = 1.6, h = 1.4, d = 1.2): THREE.Group {
  const group = new THREE.Group();
  const bodyColor = { warehouse: PALETTE.steel, lab: PALETTE.cream, bank: PALETTE.bankStone, coldstorage: PALETTE.glass, incubator: PALETTE.grassLight, training: PALETTE.gold }[kind];
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(bodyColor));
  body.position.y = h / 2;
  group.add(body);

  if (kind === "bank") {
    const pediment = new THREE.Mesh(new THREE.ConeGeometry(w * 0.72, h * 0.28, 4), mat(PALETTE.bankStone));
    pediment.rotation.y = Math.PI / 4;
    pediment.position.y = h + h * 0.1;
    group.add(pediment);
    const colGeo = new THREE.CylinderGeometry(0.05, 0.05, h * 0.85, 6);
    for (let i = 0; i < 4; i++) {
      const col = new THREE.Mesh(colGeo, mat(PALETTE.cream));
      col.position.set(-w / 2 + 0.15 + (i * (w - 0.3)) / 3, h * 0.42, d / 2 + 0.05);
      group.add(col);
    }
  } else if (kind === "coldstorage" || kind === "lab") {
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w * 1.02, 0.08, d * 1.02), mat(PALETTE.steelDark));
    roof.position.y = h + 0.04;
    group.add(roof);
    for (let i = 0; i < 3; i++) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.02), mat(PALETTE.glass, { emissive: 0xf3e1cc, emissiveIntensity: 0.15 }));
      win.position.set(-w / 2 + 0.3 + i * 0.4, h * 0.6, d / 2 + 0.01);
      group.add(win);
    }
  } else {
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.78, h * 0.32, 4), mat(kind === "training" ? PALETTE.roofGreen : PALETTE.roofRed));
    roof.rotation.y = Math.PI / 4;
    roof.position.y = h + h * 0.12;
    group.add(roof);
  }

  const door = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.32, 0.03), mat(PALETTE.bark));
  door.position.set(0, 0.16, d / 2 + 0.01);
  group.add(door);

  shadowed(group);
  return group;
}

// ---------------------------------------------------------------------------
// Processing facility — a larger building + a conveyor belt with travelling
// package instances (their offsets exposed via userData for animation).
// ---------------------------------------------------------------------------
export function createProcessingFacility(): THREE.Group {
  const group = createBuilding("warehouse", 2.2, 1.5, 1.6);
  const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.4, 8), mat(PALETTE.steelDark));
  vent.position.set(0.6, 1.7, 0);
  group.add(vent);
  return group;
}

export type ConveyorBelt = {
  group: THREE.Group;
  packages: THREE.Mesh[];
  length: number;
};

export function createConveyorBelt(length = 1.6, packageCount = 4): ConveyorBelt {
  const group = new THREE.Group();
  const belt = new THREE.Mesh(new THREE.BoxGeometry(length, 0.06, 0.32), mat(PALETTE.steelDark));
  belt.position.y = 0.32;
  group.add(belt);
  const legGeo = new THREE.BoxGeometry(0.06, 0.32, 0.06);
  [-length / 2 + 0.1, length / 2 - 0.1].forEach((x) => {
    [-0.12, 0.12].forEach((z) => {
      const leg = new THREE.Mesh(legGeo, mat(PALETTE.steel));
      leg.position.set(x, 0.16, z);
      group.add(leg);
    });
  });
  const packages: THREE.Mesh[] = [];
  const pkgGeo = new THREE.BoxGeometry(0.16, 0.16, 0.16);
  const pkgColors = [PALETTE.crate, PALETTE.truckOrange, PALETTE.gold];
  for (let i = 0; i < packageCount; i++) {
    const pkg = new THREE.Mesh(pkgGeo, mat(pkgColors[i % pkgColors.length]));
    pkg.position.set(-length / 2 + (i / packageCount) * length, 0.44, 0);
    pkg.castShadow = true;
    group.add(pkg);
    packages.push(pkg);
  }
  shadowed(group, true, true);
  return { group, packages, length };
}

// ---------------------------------------------------------------------------
// Vehicles — truck, cargo ship, delivery scooter, drone.
// ---------------------------------------------------------------------------
export type Truck = { group: THREE.Group; wheels: THREE.Mesh[] };

export function createTruck(): Truck {
  const group = new THREE.Group();
  const bed = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.32, 0.34), mat(PALETTE.truckOrange));
  bed.position.set(-0.05, 0.32, 0);
  group.add(bed);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.34, 0.32), mat(PALETTE.truckCab));
  cab.position.set(0.35, 0.32, 0);
  group.add(cab);
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.16, 0.26), mat(PALETTE.glass, { transparent: true, opacity: 0.7 }));
  windshield.position.set(0.47, 0.4, 0);
  group.add(windshield);
  const wheelGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 10);
  const wheelMat = mat(0x1c1c1c);
  const wheels: THREE.Mesh[] = [];
  [
    [-0.2, 0.16],
    [0.05, 0.16],
    [0.42, 0.16],
    [-0.2, -0.16],
    [0.05, -0.16],
    [0.42, -0.16],
  ].forEach(([x, z]) => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.1, z);
    group.add(wheel);
    wheels.push(wheel);
  });
  shadowed(group);
  return { group, wheels };
}

export function createShippingContainer(color: number = PALETTE.crate): THREE.Group {
  const group = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.26, 0.22), mat(color));
  box.position.y = 0.13;
  group.add(box);
  for (let i = -1; i <= 1; i++) {
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.26, 0.22), mat(color, { roughness: 1 }));
    ridge.position.set(i * 0.16, 0.13, 0);
    group.add(ridge);
  }
  // Up to 32 of these stack up inside a single cargo ship — cast=false keeps that from
  // becoming 32 extra shadow depth-pass draw calls for a barely-visible effect.
  shadowed(group, false, true);
  return group;
}

export type CargoShip = { group: THREE.Group; hull: THREE.Mesh };

export function createCargoShip(): CargoShip {
  const group = new THREE.Group();
  const hullShape = new THREE.Shape();
  hullShape.moveTo(-1, 0);
  hullShape.lineTo(1, 0);
  hullShape.lineTo(0.85, -0.22);
  hullShape.lineTo(-0.85, -0.22);
  hullShape.lineTo(-1, 0);
  const hullGeo = new THREE.ExtrudeGeometry(hullShape, { depth: 0.5, bevelEnabled: false });
  hullGeo.rotateX(Math.PI / 2);
  hullGeo.translate(0, 0.12, -0.25);
  const hull = new THREE.Mesh(hullGeo, mat(PALETTE.steelDark));
  shadowed(hull);
  group.add(hull);
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.3, 0.24), mat(PALETTE.cream));
  bridge.position.set(-0.7, 0.35, 0);
  shadowed(bridge);
  group.add(bridge);
  const containerColors = [PALETTE.crate, PALETTE.truckOrange, PALETTE.gold, PALETTE.roofGreen];
  let ci = 0;
  for (let row = -0.55; row <= 0.4; row += 0.24) {
    for (let layer = 0; layer < 2; layer++) {
      const c = createShippingContainer(containerColors[ci++ % containerColors.length]);
      c.scale.set(0.9, 0.9, 1.1);
      c.position.set(row, 0.13 + layer * 0.18, 0);
      group.add(c);
    }
  }
  // Not a whole-group shadowed(group) here — that would re-traverse and re-enable
  // castShadow on the containers just disabled inside createShippingContainer above.
  return { group, hull };
}

// ---------------------------------------------------------------------------
// Smartphone — a stylised rounded device with a "screen" whose geometric UI
// cards (never text) are exposed via userData for scene-specific animation.
// ---------------------------------------------------------------------------
export type Smartphone = {
  group: THREE.Group;
  screen: THREE.Mesh;
  cards: THREE.Mesh[];
};

export function createSmartphone(): Smartphone {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.9, 0.06), mat(0x14201a, { roughness: 0.4 }));
  group.add(body);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.8), mat(PALETTE.cream, { roughness: 0.3 }));
  screen.position.z = 0.031;
  group.add(screen);
  const cards: THREE.Mesh[] = [];
  const cardColors = [PALETTE.produceGreen, PALETTE.tomato, PALETTE.gold];
  for (let i = 0; i < 3; i++) {
    const card = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.16), mat(cardColors[i], { roughness: 0.5 }));
    card.position.set(0, 0.24 - i * 0.22, 0.033);
    group.add(card);
    cards.push(card);
  }
  // Thin planes casting shadows read as visual noise, not depth — skip it.
  shadowed(group, false, true);
  return { group, screen, cards };
}

// ---------------------------------------------------------------------------
// Bank / financial institution
// ---------------------------------------------------------------------------
export function createBank(): THREE.Group {
  return createBuilding("bank", 1.8, 1.3, 1.3);
}

// ---------------------------------------------------------------------------
// Drone — a small quad with spinning propellers (userData.propellers).
// ---------------------------------------------------------------------------
export type Drone = { group: THREE.Group; propellers: THREE.Mesh[] };

export function createDrone(): Drone {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.16), mat(PALETTE.steelDark));
  group.add(body);
  const camera = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), mat(0x14201a));
  camera.position.y = -0.04;
  group.add(camera);
  const propellers: THREE.Mesh[] = [];
  const armGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.22, 5);
  [
    [0.13, 0.13],
    [-0.13, 0.13],
    [0.13, -0.13],
    [-0.13, -0.13],
  ].forEach(([x, z]) => {
    const arm = new THREE.Mesh(armGeo, mat(PALETTE.steel));
    arm.rotation.z = Math.PI / 2;
    arm.rotation.y = Math.atan2(z, x);
    arm.position.set(x / 2, 0, z / 2);
    group.add(arm);
    const prop = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.008, 0.02), mat(0x2a2a2a));
    prop.position.set(x, 0.02, z);
    group.add(prop);
    propellers.push(prop);
  });
  shadowed(group);
  return { group, propellers };
}

// ---------------------------------------------------------------------------
// Soil sensor + irrigation system
// ---------------------------------------------------------------------------
export function createSoilSensor(): THREE.Group {
  const group = new THREE.Group();
  const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 6), mat(PALETTE.steel));
  stake.position.y = 0.15;
  group.add(stake);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.03), mat(PALETTE.glass, { emissive: 0x8fd9d0, emissiveIntensity: 0.4 }));
  head.position.y = 0.32;
  group.add(head);
  // Small stakes scattered across a crop field — not worth a shadow depth-pass draw call each.
  shadowed(group, false, true);
  return group;
}

export type IrrigationSystem = { group: THREE.Group; sprinklerHeads: THREE.Mesh[] };

export function createIrrigationSystem(length = 1.4): IrrigationSystem {
  const group = new THREE.Group();
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, length, 8), mat(PALETTE.steel));
  pipe.rotation.z = Math.PI / 2;
  pipe.position.y = 0.12;
  group.add(pipe);
  const sprinklerHeads: THREE.Mesh[] = [];
  const count = 4;
  for (let i = 0; i < count; i++) {
    const riser = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 6), mat(PALETTE.steel));
    const x = (i / (count - 1) - 0.5) * length;
    riser.position.set(x, 0.19, 0);
    group.add(riser);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.05, 6), mat(PALETTE.waterLight));
    head.position.set(x, 0.27, 0);
    group.add(head);
    sprinklerHeads.push(head);
  }
  // Thin pipe + risers, appears in two pods — same reasoning as the soil sensor above.
  shadowed(group, false, true);
  return { group, sprinklerHeads };
}

// ---------------------------------------------------------------------------
// Greenhouse — a translucent arched tunnel over crop rows.
// ---------------------------------------------------------------------------
export function createGreenhouse(width = 1.6, length = 1.8): THREE.Group {
  const group = new THREE.Group();
  const archMat = mat(PALETTE.glass, { transparent: true, opacity: 0.45, side: THREE.DoubleSide, roughness: 0.2 });
  const archGeo = new THREE.TorusGeometry(width / 2, 0.02, 6, 12, Math.PI);
  const arches = 5;
  for (let i = 0; i < arches; i++) {
    const arch = new THREE.Mesh(archGeo, mat(PALETTE.steel));
    arch.rotation.y = Math.PI / 2;
    arch.rotation.z = Math.PI;
    arch.position.set(0, width / 2, -length / 2 + (i / (arches - 1)) * length);
    group.add(arch);
  }
  const skin = new THREE.Mesh(new THREE.CylinderGeometry(width / 2, width / 2, length, 12, 1, true, 0, Math.PI), archMat);
  skin.rotation.z = Math.PI / 2;
  skin.rotation.y = Math.PI / 2;
  skin.position.y = width / 2;
  group.add(skin);
  const field = createCropField(width * 0.8, length * 0.85, 4, 6, false);
  group.add(field);
  shadowed(group);
  return group;
}

// ---------------------------------------------------------------------------
// Solar panel + wind turbine
// ---------------------------------------------------------------------------
export function createSolarPanel(): THREE.Group {
  const group = new THREE.Group();
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6), mat(PALETTE.steelDark));
  stand.position.y = 0.2;
  group.add(stand);
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.34), mat(PALETTE.solarBlue, { metalness: 0.3, roughness: 0.4 }));
  panel.position.y = 0.42;
  panel.rotation.x = -0.35;
  group.add(panel);
  shadowed(group);
  return group;
}

export type WindTurbine = { group: THREE.Group; blades: THREE.Group };

export function createWindTurbine(): WindTurbine {
  const group = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 1.2, 8), mat(PALETTE.cream));
  pole.position.y = 0.6;
  group.add(pole);
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), mat(PALETTE.steelDark));
  hub.position.y = 1.2;
  group.add(hub);
  const blades = new THREE.Group();
  blades.position.y = 1.2;
  const bladeGeo = new THREE.BoxGeometry(0.03, 0.32, 0.015);
  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(bladeGeo, mat(PALETTE.cream));
    blade.position.y = 0.16;
    const pivot = new THREE.Group();
    pivot.add(blade);
    pivot.rotation.z = (i / 3) * Math.PI * 2;
    blades.add(pivot);
  }
  group.add(blades);
  shadowed(group);
  return { group, blades };
}

// ---------------------------------------------------------------------------
// Road segment — a flat strip with a dashed centre line.
// ---------------------------------------------------------------------------
export function createRoad(length: number, width = 0.5): THREE.Group {
  const group = new THREE.Group();
  const strip = new THREE.Mesh(new THREE.BoxGeometry(length, 0.02, width), mat(PALETTE.roadDark));
  group.add(strip);
  const dashCount = Math.max(2, Math.floor(length / 0.3));
  for (let i = 0; i < dashCount; i++) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.021, 0.03), mat(PALETTE.gold));
    dash.position.set(-length / 2 + (i + 0.5) * (length / dashCount), 0, 0);
    group.add(dash);
  }
  group.receiveShadow = true;
  shadowed(group, false, true);
  return group;
}

// ---------------------------------------------------------------------------
// Ground pad — a low rounded platform each pod sits on, matching the site's
// soil/grass palette so every pod reads as part of the same landscape.
// ---------------------------------------------------------------------------
export function createGroundPad(radius = 2.4, color: number = PALETTE.grass): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(radius, radius * 1.05, 0.18, 20);
  const pad = new THREE.Mesh(geo, mat(color));
  pad.receiveShadow = true;
  return pad;
}
