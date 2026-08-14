/**
 * Albers equal-area conic projection, parameterized for India's mainland extent
 * (roughly 68–97.5°E, 8–37°N). This is the standard projection family used for
 * India political maps (matched here with standard parallels at 12°N/30°N and a
 * reference longitude near the country's center), rather than a naive lat/lon →
 * x/y mapping, which visibly distorts India's proportions.
 *
 * The normalization constants below (NORMALIZE_*) were derived once from the
 * mainland state-boundary dataset's projected bounding box — see
 * scripts/generate-india-geo.mjs, which applies this exact same formula when
 * pre-projecting the state polygon data. Keep the two in sync if either changes.
 */

const PHI_1 = (12 * Math.PI) / 180;
const PHI_2 = (30 * Math.PI) / 180;
const PHI_0 = (22 * Math.PI) / 180;
const LAMBDA_0 = (82.8 * Math.PI) / 180;

const N = (Math.sin(PHI_1) + Math.sin(PHI_2)) / 2;
const C = Math.cos(PHI_1) ** 2 + 2 * N * Math.sin(PHI_1);
const RHO_0 = Math.sqrt(C - 2 * N * Math.sin(PHI_0)) / N;

/** Raw Albers projection — returns unnormalized (x, y) in sphere-radius units. */
export function albers(lat: number, lon: number): { x: number; y: number } {
  const phi = (lat * Math.PI) / 180;
  const lambda = (lon * Math.PI) / 180;
  const rho = Math.sqrt(C - 2 * N * Math.sin(phi)) / N;
  const theta = N * (lambda - LAMBDA_0);
  return {
    x: rho * Math.sin(theta),
    y: RHO_0 - rho * Math.cos(theta),
  };
}

// Derived once from the mainland state dataset's projected bounding box (see
// scripts/generate-india-geo.mjs) so the whole shape is centered and scaled to
// comfortably fill a [-1, 1]-ish local space without distortion.
const NORMALIZE_OFFSET_X = -0.0043;
const NORMALIZE_OFFSET_Y = 0.0114;
const NORMALIZE_SCALE = 3.6212;

/** Projects lat/lon to the same normalized local space as the pre-projected state polygons. */
export function projectIndia(lat: number, lon: number): { x: number; y: number } {
  const { x, y } = albers(lat, lon);
  return {
    x: (x - NORMALIZE_OFFSET_X) * NORMALIZE_SCALE,
    y: (y - NORMALIZE_OFFSET_Y) * NORMALIZE_SCALE,
  };
}
