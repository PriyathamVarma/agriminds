import { NextResponse } from "next/server";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { User } from "@/shared/models/user";
import { recordAudit } from "@/shared/models/auditLog";
import { verifyPassword } from "@/shared/lib/auth/password";
import { createSessionToken, sessionCookieOptions } from "@/shared/lib/auth/session";
import { loginSchema } from "@/shared/lib/validation/auth";
import { rateLimit, clientIp } from "@/shared/lib/auth/rateLimit";

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { email, password, rememberMe } = parsed.data;

  await connectToDatabase();

  const user = await User.findOne({ email }).select("+passwordHash");
  // Same generic message whether the email doesn't exist or the password is wrong — never let
  // a login form reveal which emails are registered.
  const invalidMessage = "Incorrect email or password.";
  if (!user) {
    return NextResponse.json({ error: invalidMessage }, { status: 401 });
  }
  if (user.status === "suspended") {
    return NextResponse.json({ error: "This account has been suspended. Contact AgriMinds support." }, { status: 403 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: invalidMessage }, { status: 401 });
  }

  user.lastLoginAt = new Date();
  await user.save();

  await recordAudit({ actorUserId: String(user._id), action: "user.login", targetType: "User", targetId: String(user._id) });

  const { token, maxAge } = await createSessionToken(
    {
      sub: String(user._id),
      email: user.email,
      role: user.role,
      chapterId: user.chapterId ? String(user.chapterId) : null,
    },
    rememberMe,
  );

  const response = NextResponse.json({
    user: { id: String(user._id), name: user.name, email: user.email, role: user.role, chapterId: user.chapterId },
  });
  response.cookies.set({ ...sessionCookieOptions(maxAge), value: token });
  return response;
}
