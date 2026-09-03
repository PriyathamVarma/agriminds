import { NextResponse } from "next/server";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { ChapterDocument } from "@/shared/models/chapterDocument";
import { recordAudit } from "@/shared/models/auditLog";
import { requireApiSession, assertChapterAccess, assertChapterManager } from "@/shared/lib/auth/rbac";
import { chapterDocumentSchema } from "@/shared/lib/validation/chapterResources";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const accessError = assertChapterAccess(auth.session, id);
  if (accessError) return accessError.response;

  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const filter: Record<string, unknown> = { chapterId: id };
  const category = searchParams.get("category");
  if (category) filter.category = category;

  const items = await ChapterDocument.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ items });
}

// Stores metadata + an external URL only (Cloudinary or similar) — never binary file data in
// MongoDB. The client is expected to have already uploaded the file (e.g. via <CldUploadWidget>)
// before calling this with the resulting secure_url.
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
  const parsed = chapterDocumentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectToDatabase();
  const document = await ChapterDocument.create({
    chapterId: id,
    category: parsed.data.category,
    title: parsed.data.title,
    fileUrl: parsed.data.fileUrl,
    fileType: parsed.data.fileType,
    fileSize: parsed.data.fileSize,
    uploadedBy: session.sub,
  });

  await recordAudit({ actorUserId: session.sub, action: "document.upload", targetType: "ChapterDocument", targetId: String(document._id), metadata: { chapterId: id } });

  return NextResponse.json({ document }, { status: 201 });
}
