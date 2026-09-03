import "server-only";
import { randomBytes, createHash } from "crypto";

/** Generates a URL-safe raw token (for password-reset links, invitation links, ...) and its
 * hash, which is what actually gets stored — the raw token is only ever shown/emailed once. */
export function generateToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("hex");
  return { raw, hash: hashToken(raw) };
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
