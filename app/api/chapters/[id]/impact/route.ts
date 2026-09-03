import { NextResponse } from "next/server";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { ImpactReport } from "@/shared/models/impactReport";
import { recordAudit } from "@/shared/models/auditLog";
import { requireApiSession, assertChapterAccess, assertChapterManager } from "@/shared/lib/auth/rbac";
import { impactReportSchema } from "@/shared/lib/validation/chapterResources";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const accessError = assertChapterAccess(auth.session, id);
  if (accessError) return accessError.response;

  await connectToDatabase();
  const items = await ImpactReport.find({ chapterId: id }).sort({ periodStart: -1 }).lean();
  return NextResponse.json({ items });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
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
  const parsed = impactReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectToDatabase();
  const report = await ImpactReport.create({
    chapterId: id,
    period: parsed.data.period,
    periodStart: new Date(parsed.data.periodStart),
    periodEnd: new Date(parsed.data.periodEnd),
    metrics: parsed.data.metrics,
    submittedBy: session.sub,
    status: "submitted",
  });

  await recordAudit({ actorUserId: session.sub, action: "impact.report_submit", targetType: "ImpactReport", targetId: String(report._id), metadata: { chapterId: id } });

  return NextResponse.json({ report }, { status: 201 });
}
