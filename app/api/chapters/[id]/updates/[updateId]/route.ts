import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { ChapterUpdate } from "@/shared/models/chapterUpdate";
import { recordAudit } from "@/shared/models/auditLog";
import { requireApiSession, assertChapterAccess, assertChapterManager } from "@/shared/lib/auth/rbac";
import { chapterUpdateSchema } from "@/shared/lib/validation/chapterResources";

const reviewSchema = z.object({
  status: z.enum(["approved", "published", "rejected"]),
  reviewNotes: z.string().trim().max(2000).optional().default(""),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string; updateId: string }> }) {
  const { id, updateId } = await context.params;
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const { session } = auth;
  const accessError = assertChapterAccess(session, id);
  if (accessError) return accessError.response;

  await connectToDatabase();
  const item = await ChapterUpdate.findOne({ _id: updateId, chapterId: id });
  if (!item) return NextResponse.json({ error: "Update not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (session.role === "super_admin") {
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    item.status = parsed.data.status;
    item.reviewNotes = parsed.data.reviewNotes;
    item.reviewedBy = new Types.ObjectId(session.sub);
    await item.save();
    await recordAudit({ actorUserId: session.sub, action: `update.${parsed.data.status}`, targetType: "ChapterUpdate", targetId: updateId, metadata: { chapterId: id } });
    return NextResponse.json({ update: item });
  }

  const managerOnlyStatuses = ["submitted"] as const;
  const editSchema = chapterUpdateSchema.extend({ status: z.enum(["draft", ...managerOnlyStatuses]).optional() });
  const parsed = editSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  if (item.status !== "draft" && item.status !== "rejected") {
    return NextResponse.json({ error: "This update is awaiting review and can no longer be edited." }, { status: 409 });
  }
  const managerError = assertChapterManager(session);
  if (managerError) return managerError.response;

  Object.assign(item, parsed.data);
  await item.save();

  await recordAudit({ actorUserId: session.sub, action: "update.edit", targetType: "ChapterUpdate", targetId: updateId, metadata: { chapterId: id } });

  return NextResponse.json({ update: item });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string; updateId: string }> }) {
  const { id, updateId } = await context.params;
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const { session } = auth;
  const accessError = assertChapterAccess(session, id);
  if (accessError) return accessError.response;
  const managerError = assertChapterManager(session);
  if (managerError) return managerError.response;

  await connectToDatabase();
  const item = await ChapterUpdate.findOneAndDelete({ _id: updateId, chapterId: id });
  if (!item) return NextResponse.json({ error: "Update not found" }, { status: 404 });

  await recordAudit({ actorUserId: session.sub, action: "update.delete", targetType: "ChapterUpdate", targetId: updateId, metadata: { chapterId: id } });

  return NextResponse.json({ ok: true });
}
