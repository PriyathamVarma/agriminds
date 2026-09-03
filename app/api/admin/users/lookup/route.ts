import { NextResponse } from "next/server";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { User } from "@/shared/models/user";
import { requireApiRole } from "@/shared/lib/auth/rbac";

/** Resolves a user by email so the admin UI can assign a chapter administrator / invite someone
 * without a full user directory — deliberately returns only non-sensitive fields. */
export async function GET(request: Request) {
  const auth = await requireApiRole(["super_admin"]);
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });

  await connectToDatabase();
  const user = await User.findOne({ email }).select("name email role chapterId").lean();
  if (!user) return NextResponse.json({ user: null });

  return NextResponse.json({ user: { id: String(user._id), name: user.name, email: user.email, role: user.role, chapterId: user.chapterId ? String(user.chapterId) : null } });
}
