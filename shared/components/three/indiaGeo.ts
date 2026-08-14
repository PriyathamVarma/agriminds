/**
 * Stylized, simplified India geography for the Chapter Model expansion visualization.
 * Coordinates are approximate (city-level lat/lon), not surveyed boundary data — intended
 * as a recognizable decorative backdrop, not a precise map.
 */

export type NodeCategory = "origin" | "phase1" | "phase2" | "network";

export interface IGeoNode {
  id: string;
  label: string;
  lat: number;
  lon: number;
  category: NodeCategory;
  /** Scroll progress (0..1) through #chapter-model at which this node activates. */
  threshold: number;
  /** id of the node this one connects back to, once active. */
  connectsTo?: string;
}

// Roughly India's bounding box in degrees.
export const GEO_BOUNDS = { lonMin: 68, lonMax: 97.5, latMin: 8, latMax: 35.5 };

// A coarse, hand-simplified outline of India's silhouette — recognizable, not accurate.
export const INDIA_OUTLINE: Array<[number, number]> = [
  [68.5, 23.5],
  [72.8, 19.0],
  [73.8, 15.3],
  [74.8, 12.9],
  [76.3, 9.9],
  [77.5, 8.1],
  [80.3, 13.1],
  [83.3, 17.7],
  [85.8, 19.8],
  [88.5, 21.9],
  [88.9, 24.5],
  [91.7, 26.1],
  [96.0, 27.8],
  [93.9, 24.8],
  [92.7, 23.3],
  [91.3, 23.8],
  [88.4, 26.7],
  [85.1, 25.6],
  [80.9, 27.5],
  [79.0, 30.3],
  [77.2, 31.1],
  [74.8, 34.1],
  [74.9, 31.6],
  [70.9, 26.9],
  [69.6, 23.7],
  [68.5, 23.5],
];

export const GEO_NODES: IGeoNode[] = [
  { id: "vizag", label: "Vizag", lat: 17.7, lon: 83.3, category: "origin", threshold: 0.04 },

  // Phase 1 — Andhra Pradesh (Vizag itself), Odisha, Telangana
  { id: "odisha", label: "Odisha", lat: 20.3, lon: 85.8, category: "phase1", threshold: 0.32, connectsTo: "vizag" },
  { id: "telangana", label: "Telangana", lat: 17.4, lon: 78.5, category: "phase1", threshold: 0.32, connectsTo: "vizag" },

  // Phase 2 — Karnataka, Tamil Nadu, Maharashtra, Chhattisgarh
  { id: "karnataka", label: "Karnataka", lat: 12.97, lon: 77.6, category: "phase2", threshold: 0.56, connectsTo: "vizag" },
  { id: "tamilnadu", label: "Tamil Nadu", lat: 13.08, lon: 80.27, category: "phase2", threshold: 0.56, connectsTo: "vizag" },
  { id: "maharashtra", label: "Maharashtra", lat: 19.07, lon: 72.87, category: "phase2", threshold: 0.6, connectsTo: "vizag" },
  { id: "chhattisgarh", label: "Chhattisgarh", lat: 21.25, lon: 81.63, category: "phase2", threshold: 0.6, connectsTo: "odisha" },

  // Wider network — nearest-neighbour branches off the existing chapters/states
  { id: "delhi", label: "Delhi", lat: 28.6, lon: 77.2, category: "network", threshold: 0.85, connectsTo: "telangana" },
  { id: "punjab", label: "Punjab", lat: 30.9, lon: 75.8, category: "network", threshold: 0.9, connectsTo: "delhi" },
  { id: "rajasthan", label: "Rajasthan", lat: 26.9, lon: 75.8, category: "network", threshold: 0.88, connectsTo: "delhi" },
  { id: "gujarat", label: "Gujarat", lat: 23.02, lon: 72.57, category: "network", threshold: 0.86, connectsTo: "maharashtra" },
  { id: "kerala", label: "Kerala", lat: 9.93, lon: 76.26, category: "network", threshold: 0.86, connectsTo: "tamilnadu" },
  { id: "westbengal", label: "West Bengal", lat: 22.57, lon: 88.36, category: "network", threshold: 0.85, connectsTo: "odisha" },
  { id: "up", label: "Uttar Pradesh", lat: 26.85, lon: 80.9, category: "network", threshold: 0.88, connectsTo: "telangana" },
  { id: "bihar", label: "Bihar", lat: 25.6, lon: 85.1, category: "network", threshold: 0.9, connectsTo: "westbengal" },
  { id: "mp", label: "Madhya Pradesh", lat: 23.25, lon: 77.4, category: "network", threshold: 0.87, connectsTo: "maharashtra" },
  { id: "assam", label: "Assam", lat: 26.14, lon: 91.7, category: "network", threshold: 0.95, connectsTo: "westbengal" },
];

/** Projects lat/lon into a centered local-space coordinate that preserves India's true aspect ratio. */
export function projectGeo(lat: number, lon: number): { x: number; y: number } {
  const lonSpan = GEO_BOUNDS.lonMax - GEO_BOUNDS.lonMin;
  const latSpan = GEO_BOUNDS.latMax - GEO_BOUNDS.latMin;
  const lonNorm = (lon - GEO_BOUNDS.lonMin) / lonSpan - 0.5;
  const latNorm = (lat - GEO_BOUNDS.latMin) / latSpan - 0.5;
  const aspect = lonSpan / latSpan;
  const scale = 1.8; // fits the shape comfortably within a [-1, 1] frustum with margin
  return { x: lonNorm * aspect * scale, y: latNorm * scale };
}
