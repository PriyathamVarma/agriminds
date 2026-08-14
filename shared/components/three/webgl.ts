import * as THREE from "three";

/** Creates a transparent, low-power WebGL renderer sized to fill its container. Returns null if WebGL is unavailable. */
export function createLowPowerRenderer(): THREE.WebGLRenderer | null {
  try {
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    return renderer;
  } catch {
    return null;
  }
}

/** Recursively disposes geometries, materials, and their textures under an Object3D. */
export function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const withGeometry = obj as THREE.Mesh | THREE.Points | THREE.Line;
    withGeometry.geometry?.dispose();

    const withMaterial = obj as THREE.Mesh;
    const material = withMaterial.material;
    if (!material) return;

    const materials = Array.isArray(material) ? material : [material];
    for (const mat of materials) {
      for (const value of Object.values(mat)) {
        if (value && typeof value === "object" && (value as { isTexture?: boolean }).isTexture) {
          (value as unknown as THREE.Texture).dispose();
        }
      }
      mat.dispose();
    }
  });
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Heuristic for low-power/mobile devices, used to scale down particle counts and shader complexity. */
export function isLowPowerDevice(): boolean {
  if (typeof window === "undefined") return false;
  const fewCores = (navigator.hardwareConcurrency ?? 8) <= 4;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const narrowViewport = window.matchMedia("(max-width: 768px)").matches;
  return fewCores || coarsePointer || narrowViewport;
}
