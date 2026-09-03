import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { ChapterRequirement } from "@/shared/models/chapterRequirement";
import { RequirementSubmission } from "@/shared/models/requirementSubmission";
import { recordAudit } from "@/shared/models/auditLog";
import { requireApiRole } from "@/shared/lib/auth/rbac";
import { submissionReviewSchema } from "@/shared/lib/validation/chapterResources";

/** Only the central administration reviews submissions — a chapter can never approve its own
 * evidence, by design (see acceptance criteria: "Cannot approve its own submissions"). */
export async function PATCH(request: Request, context: { params: Promise<{ id: string; reqId: string; submissionId: string }> }) {
  const auth = await requireApiRole(["super_admin"]);
  if ("response" in auth) return auth.response;
  const { session } = auth;
  const { id, reqId, submissionId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = submissionReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectToDatabase();
  const submission = await RequirementSubmission.findOne({ _id: submissionId, requirementId: reqId, chapterId: id });
  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  if (submission.status !== "pending") {
    return NextResponse.json({ error: "This submission has already been reviewed." }, { status: 409 });
  }

  submission.status = parsed.data.status;
  submission.reviewNotes = parsed.data.reviewNotes;
  submission.reviewedBy = new Types.ObjectId(session.sub);
  submission.reviewedAt = new Date();
  await submission.save();

  const requirement = await ChapterRequirement.findById(reqId);
  if (requirement) {
    if (parsed.data.status === "approved") {
      requirement.status = "approved";
      requirement.currentValue = submission.valueReported;
      requirement.progressPercentage = requirement.targetValue > 0 ? Math.min(100, Math.round((submission.valueReported / requirement.targetValue) * 100)) : 100;
      requirement.adminFeedback = parsed.data.reviewNotes;
    } else if (parsed.data.status === "rejected") {
      requirement.status = "rejected";
      requirement.adminFeedback = parsed.data.reviewNotes;
    } else {
      // changes_requested — send it back to the chapter to revise and resubmit.
      requirement.status = "in_progress";
      requirement.adminFeedback = parsed.data.reviewNotes;
    }
    await requirement.save();
  }

  await recordAudit({
    actorUserId: session.sub,
    action: `submission.${parsed.data.status}`,
    targetType: "RequirementSubmission",
    targetId: submissionId,
    metadata: { chapterId: id, requirementId: reqId },
  });

  return NextResponse.json({ submission, requirement });
}
