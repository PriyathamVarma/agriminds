import { NextResponse } from "next/server";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { ChapterUpdate } from "@/shared/models/chapterUpdate";
import { recordAudit } from "@/shared/models/auditLog";
import { requireApiSession, assertChapterAccess, assertChapterManager } from "@/shared/lib/auth/rbac";
import { chapterUpdateSchema } from "@/shared/lib/validation/chapterResources";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const accessError = assertChapterAccess(auth.session, id);
  if (accessError) return accessError.response;

  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const filter: Record<string, unknown> = { chapterId: id };
  const status = searchParams.get("status");
  if (status) filter.status = status;

  const items = await ChapterUpdate.find(filter).sort({ date: -1 }).lean();
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
  const parsed = chapterUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectToDatabase();
  const update = await ChapterUpdate.create({
    chapterId: id,
    type: parsed.data.type,
    title: parsed.data.title,
    description: parsed.data.description,
    date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
    location: parsed.data.location,
    category: parsed.data.category,
    images: parsed.data.images,
    documents: parsed.data.documents,
    participantCount: parsed.data.participantCount,
    beneficiaryCount: parsed.data.beneficiaryCount,
    visibility: parsed.data.visibility,
    status: parsed.data.status,
    createdBy: session.sub,
  });

  await recordAudit({ actorUserId: session.sub, action: "update.create", targetType: "ChapterUpdate", targetId: String(update._id), metadata: { chapterId: id } });

  return NextResponse.json({ update }, { status: 201 });
}
