import { NextResponse } from "next/server";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { ChapterRequirement } from "@/shared/models/chapterRequirement";
import { RequirementSubmission } from "@/shared/models/requirementSubmission";
import { recordAudit } from "@/shared/models/auditLog";
import { requireApiSession, assertChapterAccess, assertChapterManager } from "@/shared/lib/auth/rbac";
import { submissionCreateSchema } from "@/shared/lib/validation/chapterResources";

export async function GET(_request: Request, context: { params: Promise<{ id: string; reqId: string }> }) {
  const { id, reqId } = await context.params;
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const accessError = assertChapterAccess(auth.session, id);
  if (accessError) return accessError.response;

  await connectToDatabase();
  const items = await RequirementSubmission.find({ requirementId: reqId, chapterId: id }).sort({ createdAt: -1 }).populate("submittedBy", "name").lean();
  return NextResponse.json({ items });
}

export async function POST(request: Request, context: { params: Promise<{ id: string; reqId: string }> }) {
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
  const parsed = submissionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectToDatabase();
  const requirement = await ChapterRequirement.findOne({ _id: reqId, chapterId: id });
  if (!requirement) return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
  if (requirement.evidenceRequired && parsed.data.evidenceUrls.length === 0) {
    return NextResponse.json({ error: "This requirement needs at least one piece of evidence before it can be submitted." }, { status: 400 });
  }

  const submission = await RequirementSubmission.create({
    requirementId: reqId,
    chapterId: id,
    submittedBy: session.sub,
    valueReported: parsed.data.valueReported,
    notes: parsed.data.notes,
    evidenceUrls: parsed.data.evidenceUrls,
  });

  requirement.status = "submitted";
  await requirement.save();

  await recordAudit({ actorUserId: session.sub, action: "requirement.submit", targetType: "RequirementSubmission", targetId: String(submission._id), metadata: { chapterId: id, requirementId: reqId } });

  return NextResponse.json({ submission }, { status: 201 });
}
