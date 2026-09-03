import { NextResponse } from "next/server";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { Invitation } from "@/shared/models/invitation";
import { recordAudit } from "@/shared/models/auditLog";
import { requireApiSession, assertChapterAccess, assertChapterManager } from "@/shared/lib/auth/rbac";
import { createInvitationSchema } from "@/shared/lib/validation/invitations";
import { generateToken } from "@/shared/lib/auth/tokens";
import { sendMail } from "@/shared/lib/mailer";
import { rateLimit, clientIp } from "@/shared/lib/auth/rateLimit";

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function GET(request: Request) {
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get("chapterId");
  if (!chapterId) return NextResponse.json({ error: "chapterId is required" }, { status: 400 });
  const accessError = assertChapterAccess(session, chapterId);
  if (accessError) return accessError.response;

  await connectToDatabase();
  const items = await Invitation.find({ chapterId }).sort({ createdAt: -1 }).select("-tokenHash").lean();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit(`invitations:${ip}`, 10, 15 * 60 * 1000);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const { session } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = createInvitationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const accessError = assertChapterAccess(session, parsed.data.chapterId);
  if (accessError) return accessError.response;
  const managerError = assertChapterManager(session);
  if (managerError) return managerError.response;
  // A chapter_admin may invite another member, but only super_admin hands out chapter_admin —
  // otherwise a chapter admin could mint an unlimited number of co-admins on their own say-so.
  if (parsed.data.role === "chapter_admin" && session.role !== "super_admin") {
    return NextResponse.json({ error: "Only AgriMinds administrators can invite a chapter administrator." }, { status: 403 });
  }

  await connectToDatabase();
  const { raw, hash } = generateToken();
  const invitation = await Invitation.create({
    email: parsed.data.email,
    chapterId: parsed.data.chapterId,
    role: parsed.data.role,
    tokenHash: hash,
    invitedBy: session.sub,
    expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
  });

  const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/invitations/accept?token=${raw}`;
  await sendMail({
    to: parsed.data.email,
    subject: "You've been invited to an AgriMinds chapter",
    text: `You've been invited to join an AgriMinds chapter as a ${parsed.data.role === "chapter_admin" ? "chapter administrator" : "chapter member"}.\nAccept the invitation: ${acceptUrl}\nThis link expires in 7 days.`,
  });

  await recordAudit({ actorUserId: session.sub, action: "invitation.create", targetType: "Invitation", targetId: String(invitation._id), metadata: { chapterId: parsed.data.chapterId, role: parsed.data.role } });

  return NextResponse.json({ ok: true, message: "Invitation sent." }, { status: 201 });
}
