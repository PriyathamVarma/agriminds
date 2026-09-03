import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@/shared/models/user";

export const SESSION_COOKIE_NAME = "agriminds_session";

const SHORT_SESSION_SECONDS = 60 * 60 * 12; // 12h — default (no "remember me")
const LONG_SESSION_SECONDS = 60 * 60 * 24 * 30; // 30 days — "remember me"

export type SessionPayload = {
  sub: string; // user id
  email: string;
  role: UserRole;
  chapterId: string | null;
};

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("Missing AUTH_SECRET (or NEXTAUTH_SECRET) environment variable");
  }
  return new TextEncoder().encode(secret);
}

/** Signs a session JWT. Returns the token and the maxAge (seconds) the cookie should carry. */
export async function createSessionToken(
  payload: SessionPayload,
  rememberMe = false,
): Promise<{ token: string; maxAge: number }> {
  const maxAge = rememberMe ? LONG_SESSION_SECONDS : SHORT_SESSION_SECONDS;
  const token = await new SignJWT({ email: payload.email, role: payload.role, chapterId: payload.chapterId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAge)
    .sign(getSecretKey());
  return { token, maxAge };
}

/** Verifies a session JWT. Returns null (never throws) on any invalid/expired/missing token —
 * callers should treat null as "not authenticated", not as an error. */
export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.sub !== "string" || typeof payload.email !== "string" || typeof payload.role !== "string") {
      return null;
    }
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role as UserRole,
      chapterId: typeof payload.chapterId === "string" ? payload.chapterId : null,
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge: number) {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
