import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken, type SessionPayload } from "./session";

/** Reads and verifies the session cookie for the current request. Server Components, Route
 * Handlers, and Server Actions only — never usable from client code (enforced by "server-only"). */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
