/**
 * The hero's Canvas 2D illustration: a scroll-driven agri-tech landscape that zooms
 * from a wide meadow view into a closer "ecosystem" view as the user scrolls through
 * the hero's scroll-stage. Ported from a standalone prototype into a factory function
 * so it can be driven by React refs and a Framer Motion scroll-progress value instead
 * of manual DOM queries and scroll listeners.
 *
 * All drawing is procedural (no image assets) — ridges, an eco-city skyline, wind
 * turbines, patrol drones, a solar farm, wind-swayed grass, pine trees, zebu cattle,
 * grazing cattle and sheep, and weeding robots, layered under a warm dusk sky.
 */

interface RidgePoint {
  x: number;
  y: number;
}

interface Building {
  x: number;
  w: number;
  h: number;
  shade: number;
  roofType: "green" | "solar" | "none";
  shape: "tier" | "taper" | "ring" | "spire" | "arc" | "pod" | "helix" | "shell" | "canopy";
  windowRows: number;
  litPhase: number;
}

interface Drone {
  waypoints: Array<{ xN: number; yOff: number }>;
  loopDuration: number;
  phase: number;
  blink: number;
  scale: number;
}

interface Robot {
  xNStart: number;
  xNEnd: number;
  depth: number;
  scale: number;
  seed: number;
  duration: number;
}

interface Turbine {
  x: number;
  h: number;
  bladeLen: number;
  angle: number;
  speed: number;
}

interface GrassBlade {
  xN: number;
  depth: number;
  phase: number;
  freq: number;
  tilt: number;
  sizeR: number;
}

interface Leaf {
  baseX: number;
  baseY: number;
  radius: number;
  speed: number;
  phase: number;
  size: number;
  hue: number;
}

interface DustMote {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  phase: number;
}

interface Sparkle {
  x: number;
  y: number;
  phase: number;
  speed: number;
  size: number;
}

interface Pine {
  x: number;
  depth: number;
  w: number;
  h: number;
  baseY: number;
}

interface Cow {
  xN: number;
  depth: number;
  scale: number;
  body: string;
  shade: string;
  accent: string;
  seed: number;
  faceDir: number;
}

interface Sheep {
  xN: number;
  depth: number;
  scale: number;
  seed: number;
  faceDir: number;
}

export interface HeroSceneRefs {
  canvas: HTMLCanvasElement;
  heroEl: HTMLElement;
  scene1El: HTMLElement;
  scene2El: HTMLElement;
  scrollIndicatorEl: HTMLElement;
  railDot0: HTMLElement;
  railDot1: HTMLElement;
}

export function createHeroScene(refs: HeroSceneRefs, getProgress: () => number, reduceMotion: boolean) {
  const { canvas, heroEl, scene1El, scene2El, scrollIndicatorEl, railDot0, railDot1 } = refs;
  const maybeCtx = canvas.getContext("2d");
  if (!maybeCtx) return { supported: false, destroy: () => {} };
  // Cast (rather than rely on narrowing) so the many nested `function` drawers below
  // — which TS's control-flow analysis doesn't narrow into — see a non-nullable type.
  const ctx = maybeCtx as CanvasRenderingContext2D;

  function rand(a: number, b: number) {
    return a + Math.random() * (b - a);
  }
  function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }
  function clamp(v: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, v));
  }
  function easeInOutQuad(x: number) {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  }
  function easeInOut(x: number) {
    return x * x * (3 - 2 * x);
  }

  let W = 0;
  let H = 0;
  let DPR = 1;
  let horizonY = 0;

  function groundY(depth: number) {
    return horizonY + Math.pow(clamp(depth, 0, 1.3), 1.5) * (H * 0.42);
  }

  let ridgeA: RidgePoint[] = [];
  let ridgeB: RidgePoint[] = [];
  function buildRidges() {
    ridgeA = [];
    ridgeB = [];
    const steps = 48;
    for (let i = 0; i <= steps; i++) {
      const xN = i / steps;
      const x = xN * W * 1.3 - W * 0.15;
      const nA = Math.sin(xN * 9 + 1.3) * 24 + Math.sin(xN * 21 + 0.4) * 10 + Math.sin(xN * 4.1) * 18;
      const nB = Math.sin(xN * 6.5 + 4.1) * 30 + Math.sin(xN * 14 + 2.0) * 12;
      ridgeA.push({ x, y: horizonY - 26 - nA });
      ridgeB.push({ x, y: horizonY - 48 - nB });
    }
  }

  let buildings: Building[] = [];
  function buildCity() {
    buildings = [];
    // The reference city is a broad, dense ribbon on the horizon rather than a
    // handful of isolated dark towers. Smaller, pale buildings create that same
    // optimistic near-future scale while keeping the landscape dominant.
    const n = W < 700 ? 18 : 27;
    const shapes: Building["shape"][] = ["helix", "shell", "canopy", "arc", "pod", "helix", "shell"];
    for (let i = 0; i < n; i++) {
      const h = rand(28, 160) * (Math.random() < 0.16 ? 1.35 : 1);
      buildings.push({
        x: rand(W * 0.25, W * 1.06),
        w: rand(22, 54),
        h,
        shade: rand(0, 1),
        roofType: Math.random() < 0.55 ? "green" : Math.random() < 0.7 ? "solar" : "none",
        shape: shapes[Math.floor(rand(0, shapes.length))],
        windowRows: Math.max(2, Math.floor(h / 22)),
        litPhase: rand(0, Math.PI * 2),
      });
    }
    buildings.sort((a, b) => a.x - b.x);
  }

  let drones: Drone[] = [];
  function buildDrones() {
    drones = [];
    for (let i = 0; i < 5; i++) {
      const wpCount = 3 + Math.floor(rand(0, 2));
      const waypoints = [];
      for (let w = 0; w < wpCount; w++) {
        waypoints.push({ xN: rand(0.42, 1.04), yOff: rand(170, 280) });
      }
      drones.push({
        waypoints,
        loopDuration: rand(16, 26),
        phase: rand(0, 1),
        blink: rand(2, 4),
        scale: rand(0.55, 0.85),
      });
    }
  }

  const robots: Robot[] = [
    { xNStart: 0.04, xNEnd: 0.98, depth: 0.42, scale: 0.95, seed: 0.3, duration: 19 },
    { xNStart: 0.06, xNEnd: 0.96, depth: 0.33, scale: 0.78, seed: 1.9, duration: 23 },
  ];

  let turbines: Turbine[] = [];
  function buildTurbines() {
    turbines = [];
    for (let i = 0; i < 5; i++) {
      turbines.push({
        x: rand(W * 0.78, W * 1.05),
        h: rand(64, 118),
        bladeLen: rand(18, 28),
        angle: rand(0, Math.PI * 2),
        speed: rand(0.5, 1.0),
      });
    }
  }

  let grassBlades: GrassBlade[] = [];
  function buildGrass() {
    grassBlades = [];
    const density = W < 700 ? 0.72 : 1;
    const bands = [
      { count: Math.round(300 * density), dMin: 0.0, dMax: 0.28 },
      { count: Math.round(460 * density), dMin: 0.22, dMax: 0.55 },
      { count: Math.round(620 * density), dMin: 0.48, dMax: 0.86 },
      { count: Math.round(760 * density), dMin: 0.78, dMax: 1.3 },
    ];
    bands.forEach((band) => {
      for (let i = 0; i < band.count; i++) {
        grassBlades.push({
          xN: rand(-0.08, 1.08),
          depth: rand(band.dMin, band.dMax),
          phase: rand(0, Math.PI * 2),
          freq: rand(0.8, 1.3),
          tilt: rand(-0.3, 0.3),
          sizeR: rand(0.75, 1.25),
        });
      }
    });
  }

  let leaves: Leaf[] = [];
  function buildLeaves() {
    leaves = [];
    for (let i = 0; i < 20; i++) {
      leaves.push({
        baseX: rand(0.4, 0.98) * W,
        baseY: rand(0.32, 0.58) * H,
        radius: rand(26, 80),
        speed: rand(0.25, 0.5),
        phase: rand(0, Math.PI * 2),
        size: rand(5, 10),
        hue: Math.floor(rand(0, 3)),
      });
    }
  }

  let dust: DustMote[] = [];
  function buildDust() {
    dust = [];
    for (let i = 0; i < 70; i++) {
      dust.push({ x: rand(0, W), y: rand(0, H), size: rand(1.4, 3.2), speed: rand(4, 14), drift: rand(-6, 6), phase: rand(0, Math.PI * 2) });
    }
  }

  let sparkles: Sparkle[] = [];
  function buildSparkles(forPines: Pine[]) {
    sparkles = [];
    forPines.forEach((p) => {
      for (let i = 0; i < 5; i++) {
        sparkles.push({
          x: p.x + rand(-p.w * 0.7, p.w * 0.7),
          y: p.baseY - rand(p.h * 0.15, p.h * 0.9),
          phase: rand(0, Math.PI * 2),
          speed: rand(0.8, 1.8),
          size: rand(1.3, 2.8),
        });
      }
    });
  }

  let pines: Pine[] = [];
  function buildPines() {
    pines = [
      { x: W * 0.01, depth: 1.2, w: 90, h: 250, baseY: 0 },
      { x: W * -0.04, depth: 1.0, w: 66, h: 175, baseY: 0 },
    ];
    pines.forEach((p) => {
      p.baseY = groundY(p.depth);
    });
    buildSparkles(pines);
  }

  const cows: Cow[] = [
    { xN: 0.63, depth: 0.5, scale: 0.68, body: "#f2ead9", shade: "#d8cbae", accent: "#2b2620", seed: 0.0, faceDir: 1 },
    { xN: 0.56, depth: 0.44, scale: 0.56, body: "#ece2cd", shade: "#cfc0a0", accent: "#2b2620", seed: 2.3, faceDir: -1 },
  ];

  const sheep: Sheep[] = [
    { xN: 0.76, depth: 0.54, scale: 0.46, seed: 0.7, faceDir: -1 },
    { xN: 0.83, depth: 0.48, scale: 0.4, seed: 2.1, faceDir: 1 },
    { xN: 0.7, depth: 0.43, scale: 0.35, seed: 4.2, faceDir: 1 },
  ];

  function rebuildAll() {
    buildRidges();
    buildCity();
    buildDrones();
    buildTurbines();
    buildGrass();
    buildLeaves();
    buildDust();
    buildPines();
  }

  function resize() {
    const rect = heroEl.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    horizonY = H * 0.58;
    rebuildAll();
  }

  const riverPts = [
    { xN: 0.42, depth: 1.1 },
    { xN: 0.58, depth: 0.7 },
    { xN: 0.5, depth: 0.42 },
    { xN: 0.66, depth: 0.2 },
    { xN: 0.72, depth: 0.06 },
  ];

  function drawRiver(panX: number) {
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < riverPts.length; i++) {
      const p = riverPts[i];
      const x = p.xN * W + panX * (0.15 + p.depth * 0.25);
      const y = groundY(p.depth);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(210,196,160,0.55)";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();
  }

  function drawRidge(points: RidgePoint[], panX: number, factor: number, fill: string) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x + panX * factor, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x + panX * factor, points[i].y);
    ctx.lineTo(points[points.length - 1].x + panX * factor, horizonY + 40);
    ctx.lineTo(points[0].x + panX * factor, horizonY + 40);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.restore();
  }

  function drawBuildingOutline(b: Building, x: number, y: number) {
    const w = b.w;
    const h = b.h;
    ctx.beginPath();
    if (b.shape === "taper") {
      const top = w * 0.4;
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - h * 0.92);
      ctx.lineTo(x + (w - top) / 2, y - h);
      ctx.lineTo(x + w - (w - top) / 2, y - h);
      ctx.lineTo(x + w, y - h * 0.92);
      ctx.lineTo(x + w, y);
      ctx.closePath();
    } else if (b.shape === "tier") {
      const t1 = h * 0.55;
      const t2 = h * 0.82;
      const w2 = w * 0.72;
      const w3 = w * 0.46;
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - t1);
      ctx.lineTo(x + (w - w2) / 2, y - t1);
      ctx.lineTo(x + (w - w2) / 2, y - t2);
      ctx.lineTo(x + (w - w3) / 2, y - t2);
      ctx.lineTo(x + (w - w3) / 2, y - h);
      ctx.lineTo(x + w - (w - w3) / 2, y - h);
      ctx.lineTo(x + w - (w - w3) / 2, y - t2);
      ctx.lineTo(x + w - (w - w2) / 2, y - t2);
      ctx.lineTo(x + w - (w - w2) / 2, y - t1);
      ctx.lineTo(x + w, y - t1);
      ctx.lineTo(x + w, y);
      ctx.closePath();
    } else if (b.shape === "ring") {
      const shaftW = w * 0.42;
      ctx.rect(x + (w - shaftW) / 2, y - h, shaftW, h);
    } else if (b.shape === "arc") {
      // Aerodynamic, split-crown tower: curved shoulders and a central sky garden
      // make the silhouette read as future architecture even at small hero sizes.
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - h * 0.68);
      ctx.quadraticCurveTo(x + w * 0.04, y - h * 0.93, x + w * 0.38, y - h);
      ctx.quadraticCurveTo(x + w * 0.48, y - h * 0.76, x + w * 0.5, y - h * 0.58);
      ctx.quadraticCurveTo(x + w * 0.52, y - h * 0.76, x + w * 0.62, y - h);
      ctx.quadraticCurveTo(x + w * 0.96, y - h * 0.93, x + w, y - h * 0.68);
      ctx.lineTo(x + w, y);
      ctx.closePath();
    } else if (b.shape === "pod") {
      // Rounded modular habitat tower, inspired by the pale cylindrical forms in
      // the supplied From Fauna reference rather than conventional box blocks.
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - h + w * 0.42);
      ctx.quadraticCurveTo(x, y - h, x + w * 0.5, y - h);
      ctx.quadraticCurveTo(x + w, y - h, x + w, y - h + w * 0.42);
      ctx.lineTo(x + w, y);
      ctx.closePath();
    } else if (b.shape === "helix") {
      // Twisting parametric tower with a narrow waist and flared planted crown.
      ctx.moveTo(x + w * 0.12, y);
      ctx.bezierCurveTo(x + w * 0.02, y - h * 0.35, x + w * 0.66, y - h * 0.62, x + w * 0.28, y - h);
      ctx.quadraticCurveTo(x + w * 0.5, y - h - w * 0.12, x + w * 0.72, y - h);
      ctx.bezierCurveTo(x + w * 0.34, y - h * 0.62, x + w * 0.98, y - h * 0.35, x + w * 0.88, y);
      ctx.closePath();
    } else if (b.shape === "shell") {
      // Leaning seed-pod shell with a glazed opening.
      ctx.moveTo(x + w * 0.08, y);
      ctx.quadraticCurveTo(x - w * 0.08, y - h * 0.42, x + w * 0.52, y - h);
      ctx.quadraticCurveTo(x + w * 0.94, y - h * 0.72, x + w, y - h * 0.18);
      ctx.quadraticCurveTo(x + w * 0.82, y, x + w * 0.08, y);
      ctx.closePath();
    } else if (b.shape === "canopy") {
      // Low looped cultural/market hub like the reference's organic campuses.
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + w * 0.06, y - h * 0.42, x + w * 0.5, y - h * 0.46);
      ctx.quadraticCurveTo(x + w * 0.94, y - h * 0.42, x + w, y);
      ctx.quadraticCurveTo(x + w * 0.76, y - h * 0.18, x + w * 0.5, y - h * 0.16);
      ctx.quadraticCurveTo(x + w * 0.24, y - h * 0.18, x, y);
      ctx.closePath();
    } else {
      const topCut = h * 0.06;
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - h + topCut);
      ctx.lineTo(x + w * 0.5, y - h);
      ctx.lineTo(x + w, y - h + topCut);
      ctx.lineTo(x + w, y);
      ctx.closePath();
    }
    return { top: b.shape === "canopy" ? y - h * 0.46 : y - h };
  }

  function drawCity(panX: number, t: number) {
    buildings.forEach((b) => {
      const x = b.x + panX * 0.35;
      const y = horizonY;
      const grad = ctx.createLinearGradient(0, y - b.h, 0, y);
      // Pearl-white ceramic and glass surfaces from the selected parametric
      // architecture reference, warmed slightly by the evening horizon.
      grad.addColorStop(0, "rgba(245,249,245,0.98)");
      grad.addColorStop(0.48, "rgba(204,221,216,0.98)");
      grad.addColorStop(1, "rgba(125,153,145,0.98)");
      ctx.fillStyle = grad;
      const info = drawBuildingOutline(b, x, y);
      ctx.fill();

      if (b.shape === "ring") {
        const ringY = y - b.h * 0.86;
        ctx.save();
        ctx.strokeStyle = "rgba(255,214,150,0.75)";
        ctx.lineWidth = 3.4;
        ctx.beginPath();
        ctx.ellipse(x + b.w / 2, ringY, b.w * 0.62, 4.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Sun-catching glass seam and luminous structural edge.
      ctx.save();
      ctx.strokeStyle = "rgba(186,235,224,0.42)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x + b.w * 0.22, y - 4);
      ctx.lineTo(x + b.w * 0.34, info.top + 7);
      ctx.stroke();
      ctx.restore();

      const lit = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 0.4 + b.litPhase));
      ctx.fillStyle = "rgba(255,218,151," + (reduceMotion ? 0.5 : 0.22 + lit * 0.28) + ")";
      const cols = Math.max(1, Math.floor(b.w / 8));
      for (let wr = 0; wr < b.windowRows && !["helix", "shell", "canopy"].includes(b.shape); wr++) {
        for (let wc = 0; wc < cols; wc++) {
          const wx = x + 3 + wc * 8;
          const wy = y - 7 - wr * 20;
          if (wx < x + b.w - 3 && wy > info.top + 4) ctx.fillRect(wx, wy, 2.6, 4.4);
        }
      }

      if (b.shape === "spire") {
        ctx.strokeStyle = "rgba(220,210,190,0.75)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x + b.w / 2, info.top);
        ctx.lineTo(x + b.w / 2, info.top - 34);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,224,170,0.7)";
        ctx.beginPath();
        ctx.arc(x + b.w / 2, info.top - 34, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      if (b.shape === "arc") {
        const gardenY = y - b.h * 0.57;
        ctx.strokeStyle = "rgba(177,232,196,0.82)";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(x + b.w * 0.32, gardenY);
        ctx.quadraticCurveTo(x + b.w * 0.5, gardenY + 4, x + b.w * 0.68, gardenY);
        ctx.stroke();
      }
      if (b.shape === "pod") {
        ctx.strokeStyle = "rgba(255,250,229,0.56)";
        ctx.lineWidth = 1;
        for (let band = 0.25; band < 0.86; band += 0.2) {
          ctx.beginPath();
          ctx.ellipse(x + b.w / 2, y - b.h * band, b.w * 0.48, 2.1, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      if (b.shape === "helix") {
        ctx.save();
        ctx.strokeStyle = "rgba(247,252,249,0.9)";
        ctx.lineWidth = 1.5;
        for (let band = 0.12; band < 0.94; band += 0.105) {
          const sway = Math.sin(band * Math.PI * 4 + b.litPhase) * b.w * 0.13;
          ctx.beginPath();
          ctx.ellipse(x + b.w * 0.5 + sway, y - b.h * band, b.w * (0.29 + Math.abs(band - 0.5) * 0.24), 2.4, -0.12, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
      if (b.shape === "shell") {
        ctx.save();
        ctx.fillStyle = "rgba(27,55,58,0.78)";
        ctx.beginPath();
        ctx.ellipse(x + b.w * 0.56, y - b.h * 0.43, b.w * 0.23, b.h * 0.29, -0.16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(248,252,249,0.92)";
        ctx.lineWidth = 1.25;
        for (let rib = 0.18; rib < 0.92; rib += 0.12) {
          ctx.beginPath();
          ctx.moveTo(x + b.w * 0.12, y - b.h * rib);
          ctx.quadraticCurveTo(x + b.w * 0.58, y - b.h * (rib + 0.13), x + b.w * 0.9, y - b.h * rib * 0.72);
          ctx.stroke();
        }
        ctx.restore();
      }
      if (b.shape === "canopy") {
        ctx.save();
        ctx.strokeStyle = "rgba(250,253,250,0.9)";
        ctx.lineWidth = 1.2;
        for (let rib = 0.12; rib < 0.92; rib += 0.12) {
          ctx.beginPath();
          ctx.moveTo(x + b.w * rib, y - 1);
          ctx.quadraticCurveTo(x + b.w * 0.5, y - b.h * (0.5 + Math.abs(rib - 0.5) * 0.25), x + b.w * (1 - rib), y - 1);
          ctx.stroke();
        }
        ctx.restore();
      }
      if (b.roofType === "green") {
        ctx.fillStyle = "rgba(75,135,79,0.9)";
        ctx.beginPath();
        ctx.ellipse(x + b.w * 0.5, info.top + 1, b.w * 0.28, 3.2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.roofType === "solar") {
        ctx.fillStyle = "rgba(40,50,68,0.85)";
        ctx.fillRect(x + b.w * 0.15, info.top - 3, b.w * 0.7, 4);
      }
    });

    const tx = W * 0.95 + panX * 0.35;
    const dy = horizonY;
    ctx.save();
    ctx.strokeStyle = "rgba(200,190,170,0.7)";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(tx, dy);
    ctx.lineTo(tx, dy - 130);
    ctx.stroke();
    const towerGlow = ctx.createRadialGradient(tx, dy - 138, 1, tx, dy - 138, 14);
    towerGlow.addColorStop(0, "rgba(255,222,160,0.9)");
    towerGlow.addColorStop(1, "rgba(255,222,160,0)");
    ctx.fillStyle = towerGlow;
    ctx.beginPath();
    ctx.arc(tx, dy - 138, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawSky() {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    // Muted teal evening with a warm horizon glow, taken from the selected hero
    // screenshot. It reads as dusk without washing out the cream headline.
    grad.addColorStop(0, "#122f34");
    grad.addColorStop(0.38, "#31534f");
    grad.addColorStop(0.64, "#727052");
    grad.addColorStop(0.84, "#bd854d");
    grad.addColorStop(1, "#d9a461");
    ctx.save();
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Sparse rose-tinted evening cloud bands from the reference: atmospheric,
    // horizontal, and deliberately quiet so they do not compete with the copy.
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "#d6b390";
    [
      [0.12, 0.13, 0.2],
      [0.48, 0.09, 0.15],
      [0.72, 0.19, 0.22],
      [0.9, 0.1, 0.12],
    ].forEach(([xN, yN, widthN]) => {
      ctx.beginPath();
      ctx.ellipse(W * xN, H * yN, W * widthN, 5, -0.03, 0, Math.PI * 2);
      ctx.ellipse(W * (xN + widthN * 0.2), H * yN - 5, W * widthN * 0.45, 7, 0.05, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawSun(panX: number) {
    const sx = W * 0.72 + panX * 0.04;
    const sy = horizonY - 40;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const rays = 12;
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * Math.PI * 2;
      const len = 420;
      const grad = ctx.createLinearGradient(sx, sy, sx + Math.cos(a) * len, sy + Math.sin(a) * len);
      grad.addColorStop(0, "rgba(255,186,110,0.14)");
      grad.addColorStop(1, "rgba(255,186,110,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 34;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(a) * len, sy + Math.sin(a) * len);
      ctx.stroke();
    }
    const core = ctx.createRadialGradient(sx, sy, 0, sx, sy, 100);
    core.addColorStop(0, "rgba(255,220,170,0.85)");
    core.addColorStop(0.35, "rgba(255,190,120,0.4)");
    core.addColorStop(1, "rgba(255,190,120,0)");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(sx, sy, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#ffe9c4";
    ctx.beginPath();
    ctx.arc(sx, sy, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawHaze() {
    const grad = ctx.createLinearGradient(0, horizonY - 220, 0, horizonY + 4);
    grad.addColorStop(0, "rgba(60,40,28,0)");
    grad.addColorStop(1, "rgba(90,58,34,0.38)");
    ctx.save();
    ctx.fillStyle = grad;
    ctx.fillRect(0, horizonY - 220, W, 224);
    ctx.restore();
  }

  function drawGroundWash(panX: number) {
    const sx = W * 0.72 + panX * 0.06;
    const grad = ctx.createRadialGradient(sx, horizonY, 10, sx, horizonY, W * 0.6);
    grad.addColorStop(0, "rgba(255,196,120,0.14)");
    grad.addColorStop(1, "rgba(255,196,120,0)");
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = grad;
    ctx.fillRect(0, horizonY - 10, W, H - horizonY + 10);
    ctx.restore();
  }

  function drawPastureBase() {
    const pasture = ctx.createLinearGradient(0, horizonY - 2, 0, H);
    pasture.addColorStop(0, "#334b2f");
    pasture.addColorStop(0.45, "#294126");
    pasture.addColorStop(1, "#172b1b");
    ctx.save();
    ctx.fillStyle = pasture;
    ctx.fillRect(0, horizonY - 2, W, H - horizonY + 2);
    ctx.restore();
  }

  function dronePosAt(d: Drone, timeVal: number) {
    const mo = reduceMotion ? 0.25 : 1;
    const n = d.waypoints.length;
    const loopT = (((timeVal * mo + d.phase * d.loopDuration) % d.loopDuration) + d.loopDuration) % d.loopDuration;
    const segLen = d.loopDuration / n;
    const segIdx = Math.floor(loopT / segLen);
    const localT = (loopT - segIdx * segLen) / segLen;
    const a = d.waypoints[segIdx];
    const b = d.waypoints[(segIdx + 1) % n];
    const ease = easeInOutQuad(localT);
    const xN = lerp(a.xN, b.xN, ease);
    const yOff = lerp(a.yOff, b.yOff, ease);
    const hover = Math.sin(timeVal * 1.4 + d.phase * 10) * 4;
    return { xN, y: horizonY - yOff + hover, headingX: b.xN - a.xN };
  }

  function drawDrone(d: Drone, panX: number, t: number) {
    const pos = dronePosAt(d, t);
    const cx = pos.xN * W + panX * 0.12;
    const cy = pos.y;
    const prev = dronePosAt(d, t - 0.5);
    const pcx = prev.xN * W + panX * 0.12;
    const pcy = prev.y;

    ctx.save();
    ctx.strokeStyle = "rgba(255,220,170,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pcx, pcy);
    ctx.lineTo(cx, cy);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(d.scale * (pos.headingX < 0 ? -1 : 1), d.scale);
    ctx.rotate(Math.sin(t * 0.3 + d.phase) * 0.06);
    ctx.strokeStyle = "rgba(220,214,200,0.55)";
    ctx.lineWidth = 1;
    [
      [-5, -3.5],
      [5, -3.5],
      [-5, 3.5],
      [5, 3.5],
    ].forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(p[0], p[1]);
      ctx.stroke();
      ctx.save();
      ctx.translate(p[0], p[1]);
      ctx.rotate(t * 14 + d.phase);
      ctx.fillStyle = "rgba(200,192,176,0.35)";
      ctx.beginPath();
      ctx.ellipse(0, 0, 3.6, 1.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.fillStyle = "#3a352c";
    ctx.beginPath();
    ctx.ellipse(0, 0, 2.8, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    const blink = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * d.blink + d.phase));
    ctx.beginPath();
    ctx.arc(0, 1.3, 0.9, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(233,110,88," + (reduceMotion ? 0.6 : blink) + ")";
    ctx.fill();
    ctx.restore();
  }

  function drawTurbines(panX: number, t: number) {
    turbines.forEach((tb) => {
      const x = tb.x + panX * 0.3;
      const y = horizonY;
      ctx.save();
      const poleGrad = ctx.createLinearGradient(x - 2, y - tb.h, x + 2, y);
      poleGrad.addColorStop(0, "rgba(225,220,206,0.8)");
      poleGrad.addColorStop(1, "rgba(150,146,134,0.6)");
      ctx.strokeStyle = poleGrad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - tb.h);
      ctx.stroke();

      const a = tb.angle + t * tb.speed * (reduceMotion ? 0.15 : 1);
      const bl = tb.bladeLen;
      function blade(alpha: number) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(bl * 0.28, -bl * 0.55, bl * 0.06, -bl);
        ctx.quadraticCurveTo(-bl * 0.06, -bl * 0.5, 0, 0);
        ctx.fillStyle = "rgba(214,208,192," + alpha + ")";
        ctx.fill();
      }
      ctx.translate(x, y - tb.h);
      for (let g = 0; g < 3; g++) {
        ctx.save();
        ctx.rotate(a - (reduceMotion ? 0 : 0.18) + (g / 3) * Math.PI * 2);
        blade(0.15);
        ctx.restore();
      }
      for (let b = 0; b < 3; b++) {
        ctx.save();
        ctx.rotate(a + (b / 3) * Math.PI * 2);
        blade(0.85);
        ctx.restore();
      }
      ctx.fillStyle = "#cfc8b4";
      ctx.beginPath();
      ctx.arc(0, 0, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawSolarFarm(panX: number, t: number) {
    function cluster(baseXN: number, depth: number, rows: number, cols: number) {
      const baseX = W * baseXN + panX * 0.3;
      const baseY = groundY(depth);
      const pw = 14;
      const ph = 8;
      const gap = 5;
      ctx.save();
      ctx.translate(baseX, baseY);
      for (let ri = 0; ri < rows; ri++) {
        for (let ci = 0; ci < cols; ci++) {
          const px = ci * (pw + gap) - (cols * (pw + gap)) / 2;
          const py = -ri * (ph + gap);
          const glint = reduceMotion ? 0.5 : 0.5 + 0.5 * Math.sin(t * 0.6 + ri * 0.7 + ci * 0.5);
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(-0.28);
          ctx.fillStyle =
            "rgb(" +
            Math.round(lerp(26, 86, glint)) +
            "," +
            Math.round(lerp(34, 100, glint)) +
            "," +
            Math.round(lerp(52, 130, glint)) +
            ")";
          ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
          ctx.strokeStyle = "rgba(14,16,20,0.5)";
          ctx.lineWidth = 0.6;
          ctx.strokeRect(-pw / 2, -ph / 2, pw, ph);
          ctx.restore();
          ctx.strokeStyle = "#3a3a36";
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(px, py + ph / 2);
          ctx.lineTo(px, py + ph / 2 + 5);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
    cluster(0.5, 0.34, 3, 4);
    cluster(0.4, 0.26, 2, 3);
  }

  function drawGrass(panX: number, t: number, minDepth = 0, maxDepth = 1.3) {
    const windBase = reduceMotion ? 0.15 : 1;
    const buckets: Record<number, GrassBlade[]> = {};
    grassBlades.forEach((g) => {
      if (g.depth < minDepth || g.depth >= maxDepth) return;
      const key = Math.round(g.depth * 8);
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(g);
    });
    Object.keys(buckets).forEach((key) => {
      const arr = buckets[Number(key)];
      const d = arr[0].depth;
      const gy = groundY(d);
      const h = lerp(6, 40, clamp(d, 0, 1));
      const farMix = clamp(1 - d, 0, 1);
      const col = "rgb(" + Math.round(lerp(34, 72, farMix)) + "," + Math.round(lerp(46, 84, farMix)) + "," + Math.round(lerp(34, 60, farMix)) + ")";
      const tipCol = "rgb(210,158,88)";
      ctx.save();
      ctx.lineWidth = lerp(1, 2.4, clamp(d, 0, 1));
      ctx.strokeStyle = col;
      ctx.beginPath();
      arr.forEach((g) => {
        const bx = g.xN * W + panX * (0.15 + d * 0.45);
        const by = gy;
        const bh = h * g.sizeR;
        const phase = t * 1.5 * g.freq * windBase + g.phase + g.xN * 6;
        const sway = (Math.sin(phase) * 0.5 + Math.sin(phase * 2.1 + 1) * 0.2) * (bh * 0.55);
        const tipX = bx + sway + g.tilt * bh * 0.3;
        const tipY = by - bh;
        const ctrlX = bx + sway * 0.5;
        const ctrlY = by - bh * 0.55;
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
      });
      ctx.stroke();
      ctx.restore();

      if (d > 0.45) {
        ctx.save();
        ctx.strokeStyle = tipCol;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        arr.forEach((g) => {
          const bx = g.xN * W + panX * (0.15 + d * 0.45);
          const by = gy;
          const bh = h * g.sizeR;
          const phase = t * 1.5 * g.freq * windBase + g.phase + g.xN * 6;
          const sway = (Math.sin(phase) * 0.5 + Math.sin(phase * 2.1 + 1) * 0.2) * (bh * 0.55);
          const tipX = bx + sway + g.tilt * bh * 0.3;
          const tipY = by - bh;
          const midX = bx + sway * 0.75;
          const midY = by - bh * 0.75;
          ctx.moveTo(midX, midY);
          ctx.lineTo(tipX, tipY);
        });
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  function drawLeaves(panX: number, t: number) {
    const hues = ["rgba(96,110,80,0.8)", "rgba(120,130,96,0.8)", "rgba(190,148,80,0.8)"];
    leaves.forEach((l) => {
      const lt = t * l.speed * (reduceMotion ? 0.2 : 1) + l.phase;
      const x = l.baseX + Math.sin(lt) * l.radius + panX * 0.55;
      const y = l.baseY + Math.sin(lt * 0.6) * (l.radius * 0.4);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(lt * 0.6);
      ctx.fillStyle = hues[l.hue];
      ctx.beginPath();
      ctx.ellipse(0, 0, l.size, l.size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawDust(t: number) {
    dust.forEach((p) => {
      const mo = reduceMotion ? 0.15 : 1;
      const y = (((p.y - t * p.speed * mo) % (H + 20)) + (H + 20)) % (H + 20);
      const x = p.x + Math.sin(t * 0.3 + p.phase) * p.drift;
      const op = 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(t * 0.6 + p.phase));
      ctx.save();
      ctx.globalAlpha = op;
      ctx.fillStyle = "#f3e6c8";
      ctx.fillRect(x, y, p.size, p.size);
      ctx.restore();
    });
  }

  function drawSparkles(panX: number, t: number) {
    sparkles.forEach((s) => {
      const op = reduceMotion ? 0.4 : 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      const x = s.x + panX * 0.5;
      ctx.save();
      ctx.globalAlpha = op;
      const grad = ctx.createRadialGradient(x, s.y, 0, x, s.y, s.size * 4);
      grad.addColorStop(0, "rgba(255,224,170,0.85)");
      grad.addColorStop(1, "rgba(255,224,170,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, s.y, s.size * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawPines(panX: number) {
    pines.forEach((p) => {
      const x = p.x + panX * (0.35 + p.depth * 0.25);
      const baseY = p.baseY;
      ctx.save();
      ctx.fillStyle = "#1c231a";
      ctx.fillRect(x - p.w * 0.03, baseY - p.h * 0.18, p.w * 0.06, p.h * 0.2);
      ctx.fillStyle = "#171f15";
      const tiers = 5;
      for (let i = 0; i < tiers; i++) {
        const tw = p.w * (1 - i * 0.16);
        const ty = baseY - p.h * 0.12 - (i / tiers) * p.h * 0.95;
        const th = p.h * 0.32;
        ctx.beginPath();
        ctx.moveTo(x, ty - th);
        ctx.lineTo(x - tw / 2, ty);
        ctx.lineTo(x + tw / 2, ty);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    });
  }

  function drawCow(c: Cow, panX: number, t: number) {
    const gy = groundY(c.depth);
    const x = c.xN * W + panX * (0.2 + c.depth * 0.4);
    const scale = c.scale;
    const seed = c.seed;
    const bob = Math.sin(t * 0.6 * (reduceMotion ? 0.2 : 1) + seed) * 2 * scale;
    ctx.save();
    ctx.translate(x, gy + bob);
    ctx.scale(c.faceDir * scale, scale);

    const bodyGrad = ctx.createLinearGradient(0, -70, 0, -6);
    bodyGrad.addColorStop(0, c.body);
    bodyGrad.addColorStop(1, c.shade);

    ctx.strokeStyle = c.shade;
    ctx.lineWidth = 5.5;
    ctx.lineCap = "round";
    [
      [-22, 0],
      [-8, 4],
      [10, 4],
      [24, 0],
    ].forEach((lp) => {
      ctx.beginPath();
      ctx.moveTo(lp[0], -34 + lp[1]);
      ctx.lineTo(lp[0], 2);
      ctx.stroke();
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.ellipse(lp[0], 2, 3.4, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, -46, 46, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(22, -66, 15, 12, -0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = c.shade;
    ctx.beginPath();
    ctx.moveTo(36, -54);
    ctx.quadraticCurveTo(30, -34, 34, -18);
    ctx.quadraticCurveTo(40, -34, 40, -54);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = c.shade;
    ctx.beginPath();
    ctx.ellipse(-16, -50, 12, 7, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(6, -34, 10, 6, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const tailSwing = Math.sin(t * 2.6 * (reduceMotion ? 0.2 : 1) + seed) * 0.35;
    ctx.save();
    ctx.translate(-42, -50);
    ctx.rotate(0.6 + tailSwing);
    ctx.strokeStyle = c.shade;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 26);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 28, 3.6, 0, Math.PI * 2);
    ctx.fillStyle = c.accent;
    ctx.fill();
    ctx.restore();

    // Long, slow grazing cycle: the muzzle lowers into the pasture, pauses, then
    // lifts slightly to chew instead of merely bobbing in the air.
    const graze = reduceMotion ? 0.72 : 0.68 + Math.sin(t * 0.42 + seed) * 0.16;
    const headNod = 0.38 + graze * 0.42;

    // Flexible neck bridge keeps the head visibly attached throughout the grazing
    // arc. The previous large vertical offset made it look as if the head had fallen.
    ctx.save();
    ctx.strokeStyle = c.shade;
    ctx.lineWidth = 13;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(24, -60);
    ctx.quadraticCurveTo(34, -57 + graze * 6, 40, -53 + graze * 16);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(40, -60 + graze * 20);
    ctx.rotate(headNod);

    ctx.fillStyle = c.shade;
    ctx.save();
    ctx.translate(-13, -4);
    ctx.rotate(-0.9);
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(13, -4);
    ctx.rotate(0.9);
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-6, -14);
    ctx.quadraticCurveTo(-14, -20, -10, -26);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(6, -14);
    ctx.quadraticCurveTo(14, -20, 10, -26);
    ctx.stroke();

    const headGrad = ctx.createLinearGradient(0, -14, 0, 16);
    headGrad.addColorStop(0, c.body);
    headGrad.addColorStop(1, c.shade);
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = c.accent;
    ctx.beginPath();
    ctx.ellipse(0, 11, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = c.accent;
    ctx.beginPath();
    ctx.arc(-9, -2, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(9, -2, 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();
  }

  function drawSheep(s: Sheep, panX: number, t: number) {
    const gy = groundY(s.depth);
    const x = s.xN * W + panX * (0.2 + s.depth * 0.4);
    const chew = reduceMotion ? 0.8 : 0.72 + Math.sin(t * 0.55 + s.seed) * 0.22;
    const bob = Math.sin(t * 0.8 + s.seed) * 0.8;

    ctx.save();
    ctx.translate(x, gy + bob);
    ctx.scale(s.faceDir * s.scale, s.scale);

    ctx.strokeStyle = "#b7aa90";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    [-16, -5, 8, 18].forEach((lx) => {
      ctx.beginPath();
      ctx.moveTo(lx, -19);
      ctx.lineTo(lx, 1);
      ctx.stroke();
      ctx.fillStyle = "#302d28";
      ctx.beginPath();
      ctx.ellipse(lx, 2, 2.6, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Overlapping wool puffs keep the sheep soft and distinct from the cattle.
    ctx.fillStyle = "#eee8d9";
    [
      [-18, -31, 17],
      [-5, -37, 19],
      [11, -34, 18],
      [22, -28, 14],
      [2, -24, 22],
    ].forEach(([px, py, radius]) => {
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.save();
    ctx.translate(27, -34 + chew * 25);
    ctx.rotate(0.28 + chew * 0.65);
    ctx.fillStyle = "#3b3933";
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 12, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-7, -8);
    ctx.lineTo(-14, -13);
    ctx.lineTo(-9, -3);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(7, -8);
    ctx.lineTo(14, -13);
    ctx.lineTo(9, -3);
    ctx.fill();
    ctx.fillStyle = "#ddd5c2";
    ctx.beginPath();
    ctx.arc(-4, -2, 1.2, 0, Math.PI * 2);
    ctx.arc(4, -2, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  function drawRobot(r: Robot, panX: number, t: number) {
    const mo = reduceMotion ? 0.2 : 1;
    const gy = groundY(r.depth);
    const loopT = (((t * mo + r.seed * r.duration) % r.duration) + r.duration) % r.duration;
    // Ping-pong 0 -> 1 -> 0 across the full duration, so the robot sweeps the whole row
    // left-to-right then right-to-left rather than teleporting back to the start.
    const raw = loopT / r.duration;
    const movingRight = raw < 0.5;
    const p = movingRight ? raw * 2 : (1 - raw) * 2;
    const xN = lerp(r.xNStart, r.xNEnd, p);
    const x = xN * W + panX * (0.2 + r.depth * 0.4);
    const trundleBob = Math.sin(t * 7 + r.seed) * 1.0;

    ctx.save();
    ctx.translate(x, gy + trundleBob);
    // Face the direction of travel — the weeding arm reaches toward the leading edge.
    ctx.scale(r.scale * (movingRight ? 1 : -1), r.scale);

    const wheelAngle = t * 9 * mo + r.seed;
    [-8, 8].forEach((wx) => {
      ctx.fillStyle = "#4a4e4b";
      ctx.beginPath();
      ctx.arc(wx, -2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.translate(wx, -2);
      ctx.rotate(wheelAngle);
      ctx.strokeStyle = "rgba(210,214,208,0.6)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-3, 0);
      ctx.lineTo(3, 0);
      ctx.moveTo(0, -3);
      ctx.lineTo(0, 3);
      ctx.stroke();
      ctx.restore();
    });

    ctx.fillStyle = "#c6cac4";
    ctx.beginPath();
    ctx.moveTo(-12, -8);
    ctx.lineTo(-12, -22);
    ctx.quadraticCurveTo(-12, -28, -6, -28);
    ctx.lineTo(6, -28);
    ctx.quadraticCurveTo(12, -28, 12, -22);
    ctx.lineTo(12, -8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(30,30,28,0.5)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.strokeStyle = "#767b76";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, -28);
    ctx.lineTo(0, -36);
    ctx.stroke();
    const blink = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 3 + r.seed));
    ctx.beginPath();
    ctx.arc(0, -38, 2.4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(140,224,180," + (reduceMotion ? 0.7 : blink) + ")";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -18, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(120,210,255," + (reduceMotion ? 0.7 : blink) + ")";
    ctx.fill();

    const armCycle = 1.6;
    const armPhase = ((((t + r.seed * 3) % armCycle) + armCycle) % armCycle) / armCycle;
    const dip = Math.max(0, Math.sin(armPhase * Math.PI));

    // A clearly identifiable weed waits in the crop row until the gripper closes.
    // Keeping it visible through the reach phase makes the robot's purpose legible,
    // rather than leaving the arm to look like an abstract mechanical gesture.
    if (armPhase <= 0.5) {
      ctx.save();
      ctx.translate(22, 3);
      ctx.strokeStyle = "#315f32";
      ctx.lineWidth = 1.8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, 1);
      ctx.quadraticCurveTo(-1, -5, 0, -12);
      ctx.moveTo(0, -6);
      ctx.quadraticCurveTo(-6, -10, -7, -14);
      ctx.moveTo(0, -8);
      ctx.quadraticCurveTo(6, -11, 7, -15);
      ctx.stroke();
      ctx.fillStyle = "#4f8a46";
      ctx.beginPath();
      ctx.ellipse(-7, -14, 3.5, 1.8, -0.45, 0, Math.PI * 2);
      ctx.ellipse(7, -15, 3.5, 1.8, 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (armPhase > 0.44 && armPhase < 0.56) {
      const puffA = 1 - Math.abs(armPhase - 0.5) / 0.06;
      ctx.save();
      ctx.globalAlpha = Math.max(0, puffA) * 0.55;
      ctx.fillStyle = "#6b5a3e";
      [
        [-2, 3],
        [1, 4],
        [3, 2],
      ].forEach((o) => {
        ctx.beginPath();
        ctx.arc(14 + o[0], 4 + o[1], 1.1, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    ctx.save();
    ctx.translate(12, -16);
    ctx.rotate(-0.3 + dip * 1.1);
    ctx.strokeStyle = "#7c807c";
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(10, 6);
    ctx.stroke();

    if (armPhase > 0.5) {
      const lift = (armPhase - 0.5) / 0.5;
      ctx.save();
      ctx.globalAlpha = 1 - lift;
      ctx.translate(10 + lift * 7, 6 - lift * 11);
      ctx.rotate(lift * 1.4);
      ctx.strokeStyle = "#315f32";
      ctx.lineWidth = 1.7;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-2, -4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(1, -5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(3, -3);
      ctx.stroke();
      ctx.fillStyle = "#4a3a28";
      ctx.beginPath();
      ctx.ellipse(0, 1, 3.2, 2.1, 0, 0, Math.PI * 2);
      ctx.fill();
      // Exposed roots and soil make the pull-and-remove action unmistakable.
      ctx.strokeStyle = "#80633f";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-1, 2);
      ctx.quadraticCurveTo(-4, 5, -5, 7);
      ctx.moveTo(0, 2);
      ctx.quadraticCurveTo(1, 6, 0, 8);
      ctx.moveTo(1, 2);
      ctx.quadraticCurveTo(5, 5, 6, 7);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    ctx.restore();
  }

  // ---------------------------------------------------------------
  // scroll-driven scene transition (meadow -> ecosystem), plus
  // pointer parallax layered on top for fine ambient motion
  // ---------------------------------------------------------------
  const sceneA = { focusX: 0.5, focusY: 0.58, zoom: 1.0 };
  const sceneB = { focusX: 0.7, focusY: 0.4, zoom: 1.55 };

  const pointer = { x: 0, y: 0 };
  function handlePointerMove(e: PointerEvent) {
    const rect = heroEl.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
  }
  window.addEventListener("pointermove", handlePointerMove);

  function handleVisibility() {
    if (document.hidden) cancelAnimationFrame(frameId);
    else if (running) frameId = requestAnimationFrame(frame);
  }
  document.addEventListener("visibilitychange", handleVisibility);

  resize();
  window.addEventListener("resize", resize);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(heroEl);

  const start = performance.now();
  let firstFrame = true;
  let smEase = 0;
  let running = true;
  let frameId = 0;

  function frame(now: number) {
    if (!running) return;
    frameId = requestAnimationFrame(frame);
    const t = (now - start) / 1000;

    const rawProgress = getProgress();
    const targetEase = easeInOut(rawProgress);
    smEase = lerp(smEase, targetEase, reduceMotion ? 1 : 0.09);

    const slowDrift = reduceMotion ? 0 : Math.sin(t * 0.04) * 14;
    const panX = slowDrift + pointer.x * 20 + smEase * 30;

    const curFocusX = lerp(sceneA.focusX, sceneB.focusX, smEase);
    const curFocusY = lerp(sceneA.focusY, sceneB.focusY, smEase);
    const curZoom = lerp(sceneA.zoom, sceneB.zoom, smEase);

    ctx.clearRect(0, 0, W, H);
    drawSky();

    ctx.save();
    const fx = curFocusX * W;
    const fy = curFocusY * H;
    ctx.translate(fx, fy);
    ctx.scale(curZoom, curZoom);
    ctx.translate(-fx, -fy);

    drawSun(panX);
    drawRidge(ridgeB, panX, 0.06, "rgba(30,42,44,0.7)");
    drawRidge(ridgeA, panX, 0.1, "rgba(22,32,32,0.85)");
    drawCity(panX, t);
    drawTurbines(panX, t);
    drones.forEach((d) => drawDrone(d, panX, t));
    drawHaze();
    drawPastureBase();
    drawRiver(panX);
    drawGroundWash(panX);
    drawGrass(panX, t, 0, 0.76);
    drawSolarFarm(panX, t);
    robots.forEach((r) => drawRobot(r, panX, t));
    cows.forEach((c) => drawCow(c, panX, t));
    sheep.forEach((s) => drawSheep(s, panX, t));
    // Nearest blades sit in front of the animals and machines, embedding them in
    // the meadow instead of making them look pasted on top of the ground.
    drawGrass(panX, t, 0.76, 1.31);
    drawPines(panX);
    drawSparkles(panX, t);
    drawLeaves(panX, t);
    drawDust(t);

    ctx.restore();

    // Base vertical position now comes from flex centering in the JSX (which adapts to
    // actual content height at any viewport), not a hardcoded percentage — these are
    // just the small supplementary drift/settle motions layered on top of that.
    const s1 = clamp(1 - smEase * 1.7, 0, 1);
    const s2 = clamp((smEase - 0.32) * 1.7, 0, 1);
    scene1El.style.opacity = String(s1);
    scene1El.style.transform = "translateY(" + -smEase * 8 + "%)";
    scene1El.style.pointerEvents = s1 > 0.5 ? "auto" : "none";
    scene2El.style.opacity = String(s2);
    scene2El.style.transform = "translateY(" + (1 - s2) * 6 + "%)";
    scene2El.style.pointerEvents = s2 > 0.5 ? "auto" : "none";
    scrollIndicatorEl.style.opacity = String(clamp(1 - rawProgress * 7, 0, 1));
    railDot0.dataset.active = String(smEase < 0.5);
    railDot1.dataset.active = String(smEase >= 0.5);

    if (firstFrame) {
      firstFrame = false;
      canvas.dataset.ready = "true";
    }
  }
  frameId = requestAnimationFrame(frame);

  return {
    supported: true,
    destroy() {
      running = false;
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      resizeObserver.disconnect();
    },
  };
}
