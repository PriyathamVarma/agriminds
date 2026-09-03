import { NextResponse } from "next/server";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { User } from "@/shared/models/user";
import { forgotPasswordSchema } from "@/shared/lib/validation/auth";
import { generateToken } from "@/shared/lib/auth/tokens";
import { rateLimit, clientIp } from "@/shared/lib/auth/rateLimit";
import { sendMail } from "@/shared/lib/mailer";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit(`forgot-password:${ip}`, 5, 15 * 60 * 1000);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectToDatabase();
  const user = await User.findOne({ email: parsed.data.email });

  // Always return the same success response whether or not the account exists — otherwise this
  // endpoint becomes a way to enumerate registered emails.
  if (user) {
    const { raw, hash } = generateToken();
    user.resetTokenHash = hash;
    user.resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/reset-password?token=${raw}`;
    await sendMail({
      to: user.email,
      subject: "Reset your AgriMinds password",
      text: `Reset your password: ${resetUrl}\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
    });
  }

  return NextResponse.json({ ok: true, message: "If that email is registered, a reset link has been sent." });
}
