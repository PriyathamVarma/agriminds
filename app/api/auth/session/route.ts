import { NextResponse } from "next/server";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { User } from "@/shared/models/user";
import { getSession } from "@/shared/lib/auth/getSession";

/** Client-side "who am I" check — used by dashboard shells to render the current user without
 * threading session data through every layout. Returns { user: null } when signed out (never
 * a 401 here; the route itself is public, protection happens in proxy.ts for actual pages). */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  await connectToDatabase();
  const user = await User.findById(session.sub).lean();
  if (!user || user.status === "suspended") return NextResponse.json({ user: null });

  return NextResponse.json({
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      chapterId: user.chapterId ? String(user.chapterId) : null,
    },
  });
}
