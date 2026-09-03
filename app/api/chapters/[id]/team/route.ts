import { NextResponse } from "next/server";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { ChapterMembership } from "@/shared/models/chapterMembership";
import { recordAudit } from "@/shared/models/auditLog";
import { requireApiSession, assertChapterAccess, assertChapterManager } from "@/shared/lib/auth/rbac";
import { teamMemberSchema } from "@/shared/lib/validation/chapterResources";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const accessError = assertChapterAccess(auth.session, id);
  if (accessError) return accessError.response;

  await connectToDatabase();
  const members = await ChapterMembership.find({ chapterId: id }).sort({ displayOrder: 1, createdAt: 1 }).lean();
  return NextResponse.json({ items: members });
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
  const parsed = teamMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  if (!parsed.data.name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  await connectToDatabase();
  const member = await ChapterMembership.create({
    chapterId: id,
    userId: parsed.data.userId || undefined,
    role: parsed.data.role,
    designation: parsed.data.designation,
    bio: parsed.data.bio,
    photoUrl: parsed.data.photoUrl,
    email: parsed.data.email,
    phone: parsed.data.phone,
    linkedin: parsed.data.linkedin,
    displayOrder: parsed.data.displayOrder,
    isPublic: parsed.data.isPublic,
    permissions: parsed.data.permissions,
    invitedBy: session.sub,
  });

  await recordAudit({ actorUserId: session.sub, action: "chapter.team.add", targetType: "ChapterMembership", targetId: String(member._id), metadata: { chapterId: id } });

  return NextResponse.json({ member }, { status: 201 });
}
