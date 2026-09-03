import { NextResponse } from "next/server";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { User } from "@/shared/models/user";
import { recordAudit } from "@/shared/models/auditLog";
import { resetPasswordSchema } from "@/shared/lib/validation/auth";
import { hashToken } from "@/shared/lib/auth/tokens";
import { hashPassword } from "@/shared/lib/auth/password";
import { rateLimit, clientIp } from "@/shared/lib/auth/rateLimit";

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit(`reset-password:${ip}`, 8, 15 * 60 * 1000);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectToDatabase();

  const tokenHash = hashToken(parsed.data.token);
  const user = await User.findOne({
    resetTokenHash: tokenHash,
    resetTokenExpiresAt: { $gt: new Date() },
  }).select("+resetTokenHash +resetTokenExpiresAt");

  if (!user) {
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }

  user.passwordHash = await hashPassword(parsed.data.password);
  user.resetTokenHash = null;
  user.resetTokenExpiresAt = null;
  await user.save();

  await recordAudit({ actorUserId: String(user._id), action: "user.password_reset", targetType: "User", targetId: String(user._id) });

  return NextResponse.json({ ok: true, message: "Your password has been reset. You can now sign in." });
}
