#!/usr/bin/env node
/**
 * One-time data pipeline that produces shared/components/three/indiaStatesData.ts.
 *
 * Source: udit-001/india-maps-data (MIT), 2011-census-derived state boundaries —
 * https://raw.githubusercontent.com/udit-001/india-maps-data/main/topojson/india.json
 *
 * Steps: decode topology -> drop island territories -> simplify each ring
 * (Douglas-Peucker) -> project with the same Albers formula as
 * shared/components/three/indiaProjection.ts -> normalize to a shared local
 * coordinate space -> emit a compact static TS data file.
 *
 * Re-run with: node scripts/generate-india-geo.mjs
 * Requires `topojson-client` as a devDependency (build-time only, not shipped).
 */
import { feature } from "topojson-client";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SOURCE_URL = "https://raw.githubusercontent.com/udit-001/india-maps-data/main/topojson/india.json";
const EXCLUDED_TERRITORIES = new Set(["Andaman and Nicobar Islands", "Lakshadweep"]);
const SIMPLIFY_EPSILON_DEG = 0.02; // ~2km at India's latitude; keeps state shapes recognizable
const MIN_RING_POINTS = 6;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dirname, "../shared/components/three/indiaStatesData.ts");

// --- Albers projection, must stay identical to shared/components/three/indiaProjection.ts ---
const PHI_1 = (12 * Math.PI) / 180;
const PHI_2 = (30 * Math.PI) / 180;
const PHI_0 = (22 * Math.PI) / 180;
const LAMBDA_0 = (82.8 * Math.PI) / 180;
const N = (Math.sin(PHI_1) + Math.sin(PHI_2)) / 2;
const C = Math.cos(PHI_1) ** 2 + 2 * N * Math.sin(PHI_1);
const RHO_0 = Math.sqrt(C - 2 * N * Math.sin(PHI_0)) / N;

function albers(lat, lon) {
  const phi = (lat * Math.PI) / 180;
  const lambda = (lon * Math.PI) / 180;
  const rho = Math.sqrt(C - 2 * N * Math.sin(phi)) / N;
  const theta = N * (lambda - LAMBDA_0);
  return { x: rho * Math.sin(theta), y: RHO_0 - rho * Math.cos(theta) };
}

// --- Douglas-Peucker simplification on [lon, lat] rings ---
function perpendicularDistance(pt, a, b) {
  const [x, y] = pt;
  const [x1, y1] = a;
  const [x2, y2] = b;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len === 0) return Math.hypot(x - x1, y - y1);
  return Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1) / len;
}

function simplify(points, epsilon) {
  if (points.length <= MIN_RING_POINTS) return points;
  let maxDist = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }
  if (maxDist > epsilon) {
    const left = simplify(points.slice(0, index + 1), epsilon);
    const right = simplify(points.slice(index), epsilon);
    return [...left.slice(0, -1), ...right];
  }
  return [points[0], points[points.length - 1]];
}

async function main() {
  console.log("Fetching", SOURCE_URL);
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const topology = await res.json();

  const fc = feature(topology, topology.objects.states);
  console.log("Raw features:", fc.features.length);

  const states = [];
  for (const f of fc.features) {
    const name = f.properties.st_nm;
    if (EXCLUDED_TERRITORIES.has(name)) continue;

    const polygons = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;

    const rings = [];
    for (const polygon of polygons) {
      // Only the outer ring per part — Indian state boundaries in this dataset have no
      // literal interior holes, and dropping any would-be holes keeps the shapes simple.
      const outer = polygon[0];
      const simplified = simplify(outer, SIMPLIFY_EPSILON_DEG);
      if (simplified.length >= 4) rings.push(simplified);
    }
    if (rings.length === 0) continue;

    states.push({ name, code: f.properties.st_code, rings });
  }
  console.log("Kept states:", states.length);

  // Project every ring point with Albers, track the mainland bounding box.
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  const projectedStates = states.map((s) => ({
    ...s,
    rings: s.rings.map((ring) =>
      ring.map(([lon, lat]) => {
        const { x, y } = albers(lat, lon);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        return [x, y];
      }),
    ),
  }));

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const halfSpan = Math.max(maxX - minX, maxY - minY) / 2;
  const scale = 0.92 / halfSpan; // fit within roughly [-0.92, 0.92], leaving a small margin

  console.log("Normalization constants for indiaProjection.ts:");
  console.log(`  NORMALIZE_OFFSET_X = ${centerX.toFixed(4)}`);
  console.log(`  NORMALIZE_OFFSET_Y = ${centerY.toFixed(4)}`);
  console.log(`  NORMALIZE_SCALE = ${scale.toFixed(4)}`);

  const normalizedStates = projectedStates.map((s) => ({
    name: s.name,
    code: s.code,
    rings: s.rings.map((ring) => ring.map(([x, y]) => [+((x - centerX) * scale).toFixed(5), +((y - centerY) * scale).toFixed(5)])),
  }));

  const totalPoints = normalizedStates.reduce((sum, s) => sum + s.rings.reduce((a, r) => a + r.length, 0), 0);
  console.log("Total points across all rings:", totalPoints);

  const header = `/**
 * Pre-projected, pre-simplified India state boundary data. Generated by
 * scripts/generate-india-geo.mjs — do not hand-edit. Regenerate with:
 *   node scripts/generate-india-geo.mjs
 *
 * Source: udit-001/india-maps-data (MIT), 2011-census-derived state boundaries.
 * Coordinates are already Albers-projected and normalized via
 * shared/components/three/indiaProjection.ts's constants — ready to feed
 * directly into THREE.Shape.
 */

export interface IIndiaStateGeometry {
  name: string;
  code: string;
  rings: Array<Array<[number, number]>>;
}

export const INDIA_STATES: IIndiaStateGeometry[] = `;

  const body = JSON.stringify(normalizedStates, null, 1)
    // Collapse each [x, y] pair onto one line for a much more scannable/compact diff.
    .replace(/\[\n\s+(-?[\d.]+),\n\s+(-?[\d.]+)\n\s+\]/g, "[$1, $2]");

  writeFileSync(OUT_FILE, header + body + ";\n");
  console.log("Wrote", OUT_FILE);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
