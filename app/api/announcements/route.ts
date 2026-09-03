import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { Announcement } from "@/shared/models/announcement";
import { recordAudit } from "@/shared/models/auditLog";
import { requireApiSession, requireApiRole, assertChapterAccess, assertChapterManager } from "@/shared/lib/auth/rbac";

const announcementSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(6000),
  scope: z.enum(["platform", "chapter"]).optional().default("platform"),
  chapterId: z.string().optional(),
});

export async function GET(request: Request) {
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const { session } = auth;

  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 10));

  // Platform announcements are visible to everyone; chapter announcements only to that
  // chapter's own members (plus super_admin, who sees everything).
  const filter: Record<string, unknown> =
    session.role === "super_admin"
      ? {}
      : { $or: [{ scope: "platform" }, ...(session.chapterId ? [{ scope: "chapter", chapterId: session.chapterId }] : [])] };

  const items = await Announcement.find(filter).sort({ publishedAt: -1 }).limit(limit).lean();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = announcementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  if (parsed.data.scope === "platform") {
    const auth = await requireApiRole(["super_admin"]);
    if ("response" in auth) return auth.response;
    await connectToDatabase();
    const announcement = await Announcement.create({ title: parsed.data.title, body: parsed.data.body, scope: "platform", createdBy: auth.session.sub });
    await recordAudit({ actorUserId: auth.session.sub, action: "announcement.create", targetType: "Announcement", targetId: String(announcement._id) });
    return NextResponse.json({ announcement }, { status: 201 });
  }

  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const { session } = auth;
  if (!parsed.data.chapterId) return NextResponse.json({ error: "chapterId is required for a chapter announcement" }, { status: 400 });
  const accessError = assertChapterAccess(session, parsed.data.chapterId);
  if (accessError) return accessError.response;
  const managerError = assertChapterManager(session);
  if (managerError) return managerError.response;

  await connectToDatabase();
  const announcement = await Announcement.create({
    title: parsed.data.title,
    body: parsed.data.body,
    scope: "chapter",
    chapterId: parsed.data.chapterId,
    createdBy: session.sub,
  });
  await recordAudit({ actorUserId: session.sub, action: "announcement.create", targetType: "Announcement", targetId: String(announcement._id), metadata: { chapterId: parsed.data.chapterId } });
  return NextResponse.json({ announcement }, { status: 201 });
}
