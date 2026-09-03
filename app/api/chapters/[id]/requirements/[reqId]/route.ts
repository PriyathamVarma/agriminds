import { NextResponse } from "next/server";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { ChapterRequirement } from "@/shared/models/chapterRequirement";
import { recordAudit } from "@/shared/models/auditLog";
import { requireApiSession, assertChapterAccess, assertChapterManager } from "@/shared/lib/auth/rbac";
import { requirementProgressSchema } from "@/shared/lib/validation/chapterResources";

/** Chapter-side progress updates only — approving/rejecting a requirement happens by reviewing
 * its submissions (see .../submissions/[submissionId]), never by PATCHing status directly here. */
export async function PATCH(request: Request, context: { params: Promise<{ id: string; reqId: string }> }) {
  const { id, reqId } = await context.params;
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const { session } = auth;
  const accessError = assertChapterAccess(session, id);
  if (accessError) return accessError.response;
  const managerError = assertChapterManager(session);
  if (managerError) return managerError.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = requirementProgressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectToDatabase();
  const requirement = await ChapterRequirement.findOne({ _id: reqId, chapterId: id });
  if (!requirement) return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
  if (requirement.status === "approved") {
    return NextResponse.json({ error: "This requirement has already been approved and can no longer be edited." }, { status: 409 });
  }

  if (parsed.data.currentValue !== undefined) requirement.currentValue = parsed.data.currentValue;
  if (parsed.data.progressPercentage !== undefined) requirement.progressPercentage = parsed.data.progressPercentage;
  if (parsed.data.status) requirement.status = parsed.data.status;
  await requirement.save();

  await recordAudit({ actorUserId: session.sub, action: "requirement.progress_update", targetType: "ChapterRequirement", targetId: reqId, metadata: { chapterId: id } });

  return NextResponse.json({ requirement });
}
