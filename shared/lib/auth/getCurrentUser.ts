import "server-only";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { User, type IUser } from "@/shared/models/user";
import { getSession } from "./getSession";

/** Resolves the full current user document from the DB (never trust the JWT payload alone for
 * anything beyond identity — role/status can change server-side after the token was issued).
 * Returns null if there's no session, or the user was deleted/suspended since. */
export async function getCurrentUser(): Promise<IUser | null> {
  const session = await getSession();
  if (!session) return null;

  await connectToDatabase();
  const user = await User.findById(session.sub).lean<IUser | null>();
  if (!user || user.status === "suspended") return null;
  return user;
}
