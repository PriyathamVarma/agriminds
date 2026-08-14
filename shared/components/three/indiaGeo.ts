/**
 * AgriMinds' geographic expansion story, mapped onto real state boundaries
 * (see indiaStatesData.ts). This is the source of truth for which states
 * activate, in what order, and why — mirrors the actual roadmap content in
 * shared/data/agriminds.tsx (Phase 1 — next focus: Karnataka/Tamil Nadu/
 * Telangana, Phase 2: Odisha/Jharkhand, Phase 3: rest of India).
 */

export type ExpansionCategory = "origin" | "phase1" | "phase2" | "phase3";

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

  // Phase 1 — next focus
  { stateName: "Karnataka", category: "phase1", threshold: 0.34, connectsTo: "Andhra Pradesh" },
  { stateName: "Telangana", category: "phase1", threshold: 0.38, connectsTo: "Andhra Pradesh" },
  { stateName: "Tamil Nadu", category: "phase1", threshold: 0.42, connectsTo: "Karnataka" },

  // Phase 2
  { stateName: "Odisha", category: "phase2", threshold: 0.52, connectsTo: "Andhra Pradesh" },
  { stateName: "Jharkhand", category: "phase2", threshold: 0.57, connectsTo: "Odisha" },

  // Phase 3 — rest of India
  { stateName: "Maharashtra", category: "phase3", threshold: 0.64, connectsTo: "Karnataka" },
  { stateName: "Chhattisgarh", category: "phase3", threshold: 0.68, connectsTo: "Odisha" },
  { stateName: "Delhi", category: "phase3", threshold: 0.72, connectsTo: "Telangana" },
  { stateName: "Uttar Pradesh", category: "phase3", threshold: 0.76, connectsTo: "Delhi" },
  { stateName: "Rajasthan", category: "phase3", threshold: 0.8, connectsTo: "Delhi" },
  { stateName: "Punjab", category: "phase3", threshold: 0.83, connectsTo: "Delhi" },
  { stateName: "Gujarat", category: "phase3", threshold: 0.86, connectsTo: "Maharashtra" },
  { stateName: "Madhya Pradesh", category: "phase3", threshold: 0.89, connectsTo: "Maharashtra" },
  { stateName: "West Bengal", category: "phase3", threshold: 0.91, connectsTo: "Odisha" },
  { stateName: "Bihar", category: "phase3", threshold: 0.93, connectsTo: "Jharkhand" },
  { stateName: "Kerala", category: "phase3", threshold: 0.95, connectsTo: "Tamil Nadu" },
  { stateName: "Assam", category: "phase3", threshold: 0.97, connectsTo: "West Bengal" },
];

export const CATEGORY_COLOR: Record<ExpansionCategory, string> = {
  origin: "#c1712f",
  phase1: "#e0a05a",
  phase2: "#7fa38a",
  phase3: "#a8b8ac",
};
