import "server-only";

/** Simple in-memory fixed-window rate limiter for auth endpoints (login, register, password
 * reset). Fine for a single-instance deployment; swap for a shared store (Redis, etc.) if this
 * app ever runs multiple instances behind a load balancer. */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Periodically drop expired buckets so this map can't grow unbounded.
function sweep() {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}
let lastSweep = 0;

export function rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  if (now - lastSweep > 60_000) {
    sweep();
    lastSweep = now;
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }
  if (bucket.count >= limit) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }
  bucket.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

/** Best-effort client identifier for rate limiting — trusts the proxy-set header if present. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
