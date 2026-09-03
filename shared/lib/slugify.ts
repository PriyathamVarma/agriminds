export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

/** Derives a short uppercase chapter code from its state + name, e.g. "AP-VIZAG". Uniqueness
 * against existing codes is the caller's responsibility (append a numeric suffix on collision). */
export function chapterCodeFrom(state: string, name: string): string {
  const stateAbbrev = state
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
  const nameSlug = slugify(name).split("-")[0]?.slice(0, 8).toUpperCase() || "CH";
  return `${stateAbbrev || "IN"}-${nameSlug}`;
}
