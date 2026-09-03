import { NextResponse } from "next/server";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { ChapterDocument } from "@/shared/models/chapterDocument";
import { recordAudit } from "@/shared/models/auditLog";
import { requireApiSession, assertChapterAccess, assertChapterManager } from "@/shared/lib/auth/rbac";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string; docId: string }> }) {
  const { id, docId } = await context.params;
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const { session } = auth;
  const accessError = assertChapterAccess(session, id);
  if (accessError) return accessError.response;
  const managerError = assertChapterManager(session);
  if (managerError) return managerError.response;

  await connectToDatabase();
  const document = await ChapterDocument.findOneAndDelete({ _id: docId, chapterId: id });
  if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  // Document deletion is explicitly called out as something the audit trail must record.
  await recordAudit({ actorUserId: session.sub, action: "document.delete", targetType: "ChapterDocument", targetId: docId, metadata: { chapterId: id, title: document.title } });

  return NextResponse.json({ ok: true });
}
