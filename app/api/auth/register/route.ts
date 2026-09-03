import { NextResponse } from "next/server";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { User } from "@/shared/models/user";
import { recordAudit } from "@/shared/models/auditLog";
import { hashPassword } from "@/shared/lib/auth/password";
import { createSessionToken, sessionCookieOptions } from "@/shared/lib/auth/session";
import { registerSchema } from "@/shared/lib/validation/auth";
import { rateLimit, clientIp } from "@/shared/lib/auth/rateLimit";

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many registration attempts. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json({ error: firstIssue?.message ?? "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;

  await connectToDatabase();

  const existing = await User.findOne({ email: data.email }).lean();
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(data.password);

  // Role is never taken from client input — every new public registration is a plain
  // registered_user, full stop. Privileged roles only ever come from an admin action.
  const user = await User.create({
    name: data.name,
    email: data.email,
    phone: data.phone,
    passwordHash,
    city: data.city,
    state: data.state,
    organisation: data.organisation,
    areaOfInterest: data.areaOfInterest,
    role: "registered_user",
  });

  await recordAudit({
    actorUserId: String(user._id),
    action: "user.register",
    targetType: "User",
    targetId: String(user._id),
  });

  const { token, maxAge } = await createSessionToken({
    sub: String(user._id),
    email: user.email,
    role: user.role as "registered_user",
    chapterId: null,
  });

  const response = NextResponse.json(
    { user: { id: String(user._id), name: user.name, email: user.email, role: user.role } },
    { status: 201 },
  );
  response.cookies.set({ ...sessionCookieOptions(maxAge), value: token });
  return response;
}
