import { NextResponse } from "next/server";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { ChapterMembership } from "@/shared/models/chapterMembership";
import { recordAudit } from "@/shared/models/auditLog";
import { requireApiSession, assertChapterAccess, assertChapterManager } from "@/shared/lib/auth/rbac";
import { teamMemberSchema } from "@/shared/lib/validation/chapterResources";

export async function PATCH(request: Request, context: { params: Promise<{ id: string; memberId: string }> }) {
  const { id, memberId } = await context.params;
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
  const parsed = teamMemberSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectToDatabase();
  const member = await ChapterMembership.findOne({ _id: memberId, chapterId: id });
  if (!member) return NextResponse.json({ error: "Team member not found" }, { status: 404 });

  Object.assign(member, parsed.data);
  await member.save();

  await recordAudit({ actorUserId: session.sub, action: "chapter.team.update", targetType: "ChapterMembership", targetId: memberId, metadata: { chapterId: id } });

  return NextResponse.json({ member });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string; memberId: string }> }) {
  const { id, memberId } = await context.params;
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const { session } = auth;
  const accessError = assertChapterAccess(session, id);
  if (accessError) return accessError.response;
  const managerError = assertChapterManager(session);
  if (managerError) return managerError.response;

  await connectToDatabase();
  const member = await ChapterMembership.findOneAndDelete({ _id: memberId, chapterId: id });
  if (!member) return NextResponse.json({ error: "Team member not found" }, { status: 404 });

  await recordAudit({ actorUserId: session.sub, action: "chapter.team.remove", targetType: "ChapterMembership", targetId: memberId, metadata: { chapterId: id } });

  return NextResponse.json({ ok: true });
}
