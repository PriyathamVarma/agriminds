import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { Invitation } from "@/shared/models/invitation";
import { ChapterMembership } from "@/shared/models/chapterMembership";
import { User } from "@/shared/models/user";
import { recordAudit } from "@/shared/models/auditLog";
import { requireApiSession } from "@/shared/lib/auth/rbac";
import { acceptInvitationSchema } from "@/shared/lib/validation/invitations";
import { hashToken } from "@/shared/lib/auth/tokens";

export async function POST(request: Request) {
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const { session } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = acceptInvitationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectToDatabase();
  const tokenHash = hashToken(parsed.data.token);
  const invitation = await Invitation.findOne({ tokenHash, status: "pending", expiresAt: { $gt: new Date() } });
  if (!invitation) {
    return NextResponse.json({ error: "This invitation link is invalid or has expired." }, { status: 400 });
  }
  if (invitation.email !== session.email.toLowerCase()) {
    return NextResponse.json({ error: "This invitation was sent to a different email address. Sign in with that account to accept it." }, { status: 403 });
  }

  const existingMembership = await ChapterMembership.findOne({ userId: session.sub, chapterId: invitation.chapterId });
  if (!existingMembership) {
    await ChapterMembership.create({
      userId: session.sub,
      chapterId: invitation.chapterId,
      role: invitation.role === "chapter_admin" ? "admin" : "member",
      invitedBy: invitation.invitedBy,
    });
  }
  await User.updateOne(
    { _id: new Types.ObjectId(session.sub), role: { $in: ["registered_user", "chapter_member"] } },
    { $set: { role: invitation.role, chapterId: invitation.chapterId } },
  );

  invitation.status = "accepted";
  invitation.acceptedBy = new Types.ObjectId(session.sub);
  invitation.acceptedAt = new Date();
  await invitation.save();

  await recordAudit({ actorUserId: session.sub, action: "invitation.accept", targetType: "Invitation", targetId: String(invitation._id), metadata: { chapterId: String(invitation.chapterId) } });

  return NextResponse.json({ ok: true, chapterId: String(invitation.chapterId), role: invitation.role });
}
