import { NextResponse } from "next/server";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { ChapterRequirement } from "@/shared/models/chapterRequirement";
import { recordAudit } from "@/shared/models/auditLog";
import { requireApiSession, requireApiRole, assertChapterAccess } from "@/shared/lib/auth/rbac";
import { requirementAssignSchema } from "@/shared/lib/validation/chapterResources";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const accessError = assertChapterAccess(auth.session, id);
  if (accessError) return accessError.response;

  await connectToDatabase();
  const items = await ChapterRequirement.find({ chapterId: id }).sort({ dueDate: 1, createdAt: -1 }).populate("assignedTo", "name email").lean();
  return NextResponse.json({ items });
}

// Only the central team assigns requirements — that's an explicit acceptance criterion
// ("Admins can assign different requirements to different chapters").
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const auth = await requireApiRole(["super_admin"]);
  if ("response" in auth) return auth.response;
  const { session } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = requirementAssignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectToDatabase();
  const requirement = await ChapterRequirement.create({
    chapterId: id,
    templateId: parsed.data.templateId || null,
    title: parsed.data.title,
    description: parsed.data.description,
    category: parsed.data.category,
    reportingPeriod: parsed.data.reportingPeriod,
    targetValue: parsed.data.targetValue,
    unit: parsed.data.unit,
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    priority: parsed.data.priority,
    evidenceRequired: parsed.data.evidenceRequired,
    assignedTo: parsed.data.assignedTo || null,
    assignedBy: session.sub,
  });

  await recordAudit({ actorUserId: session.sub, action: "requirement.assign", targetType: "ChapterRequirement", targetId: String(requirement._id), metadata: { chapterId: id } });

  return NextResponse.json({ requirement }, { status: 201 });
}
