import "server-only";
import { getSession } from "./getSession";
import type { SessionPayload } from "./session";
import type { UserRole } from "@/shared/models/user";

export class ApiAuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function jsonError(status: number, message: string): Response {
  return Response.json({ error: message }, { status });
}

/** For Route Handlers: returns the session or a ready-to-return 401 Response. Every protected
 * route must check this on the server — a hidden button in the UI is never sufficient. */
export async function requireApiSession(): Promise<{ session: SessionPayload } | { response: Response }> {
  const session = await getSession();
  if (!session) return { response: jsonError(401, "You must be signed in.") };
  return { session };
}

/** Same as requireApiSession, but also restricts to a set of roles. */
export async function requireApiRole(
  roles: UserRole[],
): Promise<{ session: SessionPayload } | { response: Response }> {
  const result = await requireApiSession();
  if ("response" in result) return result;
  if (!roles.includes(result.session.role)) {
    return { response: jsonError(403, "You do not have permission to perform this action.") };
  }
  return result;
}

/** A chapter_admin/chapter_member may only act on their own chapter; super_admin may act on any
 * chapter. Never trust a chapterId supplied by the client alone — this re-checks against the
 * session's own chapterId, which came from the signed cookie, not the request body. */
export function assertChapterAccess(session: SessionPayload, chapterId: string): { response: Response } | null {
  if (session.role === "super_admin") return null;
  if ((session.role === "chapter_admin" || session.role === "chapter_member") && session.chapterId === chapterId) {
    return null;
  }
  return { response: jsonError(403, "You do not have access to this chapter.") };
}

/** chapter_member cannot manage the chapter itself — only chapter_admin and super_admin can. */
export function assertChapterManager(session: SessionPayload): { response: Response } | null {
  if (session.role === "super_admin" || session.role === "chapter_admin") return null;
  return { response: jsonError(403, "Only a chapter administrator can perform this action.") };
}
