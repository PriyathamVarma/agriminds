/**
 * Single source of truth for /launch's master timeline: one continuous
 * Three.js world (<LaunchScene />) — germination at the centre, then the
 * camera flies to each of the six low-poly pillar dioramas built from
 * shared/components/launch/launchLowPoly.ts, then a wide pull-back and a
 * closing dive into the tree canopy. PILLAR_SCENES gates both the camera's
 * arrival at each pod and that pod's own construct-and-animate sequence.
 */

export const LAUNCH_TOTAL_DURATION = 24;

export const LAUNCH_SCENE_MARKS = {
  CRACK_START: 0.8,
  CRACK_END: 1.5,
  ROOTS_END: 2.6,
  GROW_START: 1.3,
  TRUNK_GROW_END: 23,
  MOOD_START: 1.6,
  MOOD_END: 21,
  TRANSITION_START: 22.6,
} as const;

/** Pillar scene windows the camera flies through, in seconds since launch. */
export const PILLAR_SCENES = {
  enterprise: { start: 3.0, end: 6.0 },
  valueAdd: { start: 6.0, end: 9.0 },
  market: { start: 9.0, end: 12.0 },
  finance: { start: 12.0, end: 15.0 },
  tech: { start: 15.0, end: 18.0 },
  ecosystem: { start: 18.0, end: LAUNCH_SCENE_MARKS.TRANSITION_START },
} as const;

/**
 * The on-screen phase — drives the HTML title overlay in <LaunchExperience />.
 * <LaunchScene /> derives this from its own elapsed-seconds clock via `phaseAt`
 * and reports changes upward through `onPhaseChange`, so the overlay never runs
 * its own independent timer. Germination and the closing canopy dive/dissolve
 * carry no title.
 */
export type LaunchPhase =
  | "germination"
  | "entrepreneurship"
  | "value-addition"
  | "market-linkages"
  | "finance"
  | "technology-ai"
  | "ecosystem"
  | "transition";

export type LaunchPhaseTitle = { title: string; subtitle: string };

/** The single source of truth for scene-title wording — keep names exactly as specified. */
export const LAUNCH_PHASE_TITLES: Partial<Record<LaunchPhase, LaunchPhaseTitle>> = {
  entrepreneurship: {
    title: "ENTREPRENEURSHIP & DISCOVERY",
    subtitle: "Turning farmers into entrepreneurs.",
  },
  "value-addition": {
    title: "VALUE ADDITION",
    subtitle: "Transforming produce into higher-value products.",
  },
  "market-linkages": {
    title: "MARKET LINKAGES",
    subtitle: "Connecting farmers with customers and global markets.",
  },
  finance: {
    title: "FINANCE & INVESTMENT",
    subtitle: "Directing capital towards agricultural growth.",
  },
  "technology-ai": {
    title: "TECHNOLOGY & AI",
    subtitle: "Helping farmers make smarter decisions.",
  },
  ecosystem: {
    title: "ECOSYSTEM BUILDING",
    subtitle: "Bringing the entire agritech ecosystem together.",
  },
};

/** Maps elapsed seconds-since-launch to the active title phase. The ecosystem title clears
 * 0.6s before TRANSITION_START so it's fully faded out before the camera dives into the canopy. */
export function phaseAt(t: number): LaunchPhase {
  if (t < PILLAR_SCENES.enterprise.start) return "germination";
  if (t < PILLAR_SCENES.enterprise.end) return "entrepreneurship";
  if (t < PILLAR_SCENES.valueAdd.end) return "value-addition";
  if (t < PILLAR_SCENES.market.end) return "market-linkages";
  if (t < PILLAR_SCENES.finance.end) return "finance";
  if (t < PILLAR_SCENES.tech.end) return "technology-ai";
  if (t < LAUNCH_SCENE_MARKS.TRANSITION_START - 0.6) return "ecosystem";
  return "transition";
}
