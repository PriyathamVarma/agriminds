import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { Chapter } from "@/shared/models/chapter";
import { User } from "@/shared/models/user";
import { recordAudit } from "@/shared/models/auditLog";
import { requireApiSession, assertChapterAccess, assertChapterManager } from "@/shared/lib/auth/rbac";
import { updateChapterSchema } from "@/shared/lib/validation/chapters";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectToDatabase();
  const chapter = await Chapter.findById(id).lean();
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  return NextResponse.json({ chapter });
}

// Fields only the central team may change — status transitions, who administers the chapter,
// and public visibility are approval decisions, not chapter self-service edits.
const ADMIN_ONLY_FIELDS = ["status", "adminUserId", "isPublic"] as const;

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const { session } = auth;
  const { id } = await context.params;

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
  const parsed = updateChapterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const update = { ...parsed.data } as Record<string, unknown>;
  if (session.role !== "super_admin") {
    for (const field of ADMIN_ONLY_FIELDS) delete update[field];
  }

  await connectToDatabase();
  const chapter = await Chapter.findById(id);
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

  const previousStatus = chapter.status;
  const previousAdmin = chapter.adminUserId ? String(chapter.adminUserId) : null;

  Object.assign(chapter, update);
  await chapter.save();

  if (update.status && update.status !== previousStatus) {
    await recordAudit({
      actorUserId: session.sub,
      action: "chapter.status_change",
      targetType: "Chapter",
      targetId: id,
      metadata: { from: previousStatus, to: update.status },
    });
  }
  if ("adminUserId" in update && String(update.adminUserId ?? "") !== (previousAdmin ?? "")) {
    if (update.adminUserId) {
      await User.updateOne(
        { _id: new Types.ObjectId(update.adminUserId as string), role: { $in: ["registered_user", "chapter_member"] } },
        { $set: { role: "chapter_admin", chapterId: chapter._id } },
      );
    }
    await recordAudit({
      actorUserId: session.sub,
      action: "chapter.admin_assigned",
      targetType: "Chapter",
      targetId: id,
      metadata: { adminUserId: update.adminUserId ?? null },
    });
  } else {
    await recordAudit({ actorUserId: session.sub, action: "chapter.update", targetType: "Chapter", targetId: id });
  }

  return NextResponse.json({ chapter });
}
