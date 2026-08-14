/**
 * AgriMinds' geographic expansion story, mapped onto real state boundaries
 * (see indiaStatesData.ts). This is the source of truth for which states
 * activate, in what order, and why — mirrors the actual roadmap content in
 * shared/data/agriminds.tsx (Phase 1: Andhra Pradesh/Odisha/Telangana,
 * Phase 2: Karnataka/Tamil Nadu/Maharashtra/Chhattisgarh).
 */

export type ExpansionCategory = "origin" | "phase1" | "phase2" | "network";

export const VIZAG = { label: "Vizag", lat: 17.7, lon: 83.3, threshold: 0.06 };

export interface IStateActivation {
  /** Must match an INDIA_STATES[].name exactly. */
  stateName: string;
  category: ExpansionCategory;
  /** Scroll progress (0..1) through the map panel at which this state activates. */
  threshold: number;
  /** stateName this connects back to once active — or "Vizag" for the origin link. */
  connectsTo: string;
}

export const STATE_ACTIVATIONS: IStateActivation[] = [
  { stateName: "Andhra Pradesh", category: "origin", threshold: 0.22, connectsTo: "Vizag" },

  // Phase 1
  { stateName: "Odisha", category: "phase1", threshold: 0.38, connectsTo: "Andhra Pradesh" },
  { stateName: "Telangana", category: "phase1", threshold: 0.42, connectsTo: "Andhra Pradesh" },

  // Phase 2
  { stateName: "Karnataka", category: "phase2", threshold: 0.48, connectsTo: "Andhra Pradesh" },
  { stateName: "Tamil Nadu", category: "phase2", threshold: 0.53, connectsTo: "Karnataka" },
  { stateName: "Maharashtra", category: "phase2", threshold: 0.58, connectsTo: "Karnataka" },
  { stateName: "Chhattisgarh", category: "phase2", threshold: 0.63, connectsTo: "Odisha" },

  // Wider network
  { stateName: "Delhi", category: "network", threshold: 0.68, connectsTo: "Telangana" },
  { stateName: "Uttar Pradesh", category: "network", threshold: 0.72, connectsTo: "Delhi" },
  { stateName: "Rajasthan", category: "network", threshold: 0.75, connectsTo: "Delhi" },
  { stateName: "Punjab", category: "network", threshold: 0.78, connectsTo: "Delhi" },
  { stateName: "Gujarat", category: "network", threshold: 0.82, connectsTo: "Maharashtra" },
  { stateName: "Madhya Pradesh", category: "network", threshold: 0.85, connectsTo: "Maharashtra" },
  { stateName: "West Bengal", category: "network", threshold: 0.88, connectsTo: "Odisha" },
  { stateName: "Kerala", category: "network", threshold: 0.91, connectsTo: "Tamil Nadu" },
  { stateName: "Bihar", category: "network", threshold: 0.94, connectsTo: "West Bengal" },
  { stateName: "Assam", category: "network", threshold: 0.97, connectsTo: "West Bengal" },
];

export const CATEGORY_COLOR: Record<ExpansionCategory, string> = {
  origin: "#c1712f",
  phase1: "#e0a05a",
  phase2: "#7fa38a",
  network: "#a8b8ac",
};
