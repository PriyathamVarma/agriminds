import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { ChapterApplication } from "@/shared/models/chapterApplication";
import { ChapterMembership } from "@/shared/models/chapterMembership";
import { User } from "@/shared/models/user";
import { recordAudit } from "@/shared/models/auditLog";
import { requireApiRole } from "@/shared/lib/auth/rbac";
import { applicationReviewSchema } from "@/shared/lib/validation/applications";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole(["super_admin"]);
  if ("response" in auth) return auth.response;
  const { session } = auth;
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = applicationReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectToDatabase();
  const application = await ChapterApplication.findById(id);
  if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });
  if (application.status !== "pending") {
    return NextResponse.json({ error: "This application has already been reviewed." }, { status: 409 });
  }

  application.status = parsed.data.status;
  application.reviewNotes = parsed.data.reviewNotes;
  application.reviewedBy = new Types.ObjectId(session.sub);
  application.reviewedAt = new Date();

  if (parsed.data.status === "approved" && application.type === "join_existing" && application.targetChapterId) {
    const existingMembership = await ChapterMembership.findOne({
      userId: application.applicantUserId,
      chapterId: application.targetChapterId,
    });
    if (!existingMembership) {
      await ChapterMembership.create({
        userId: application.applicantUserId,
        chapterId: application.targetChapterId,
        role: "member",
        invitedBy: session.sub,
      });
    }
    // Only promote if the applicant is still a plain registered_user — never downgrade or
    // silently override someone who's already a chapter_admin/member/super_admin elsewhere.
    await User.updateOne(
      { _id: new Types.ObjectId(String(application.applicantUserId)), role: "registered_user" },
      { $set: { role: "chapter_member", chapterId: application.targetChapterId } },
    );
  }

  await application.save();

  await recordAudit({
    actorUserId: session.sub,
    action: parsed.data.status === "approved" ? "application.approve" : "application.reject",
    targetType: "ChapterApplication",
    targetId: id,
  });

  return NextResponse.json({ application });
}
