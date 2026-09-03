import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { Chapter } from "@/shared/models/chapter";
import { User } from "@/shared/models/user";
import { recordAudit } from "@/shared/models/auditLog";
import { requireApiRole } from "@/shared/lib/auth/rbac";
import { getSession } from "@/shared/lib/auth/getSession";
import { createChapterSchema } from "@/shared/lib/validation/chapters";
import { slugify, chapterCodeFrom } from "@/shared/lib/slugify";

export async function GET(request: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));

  const session = await getSession();
  const isAdmin = session?.role === "super_admin";

  const filter: Record<string, unknown> = {};
  if (!isAdmin) {
    // Public/unprivileged callers only ever see approved, explicitly public chapters.
    filter.status = "active";
    filter.isPublic = true;
  } else {
    const status = searchParams.get("status");
    if (status) filter.status = status;
  }

  const state = searchParams.get("state");
  if (state) filter.state = state;
  const district = searchParams.get("district");
  if (district) filter.district = district;
  const type = searchParams.get("type");
  if (type) filter.type = type;
  const search = searchParams.get("q");
  if (search) filter.$text = { $search: search };

  const [items, total] = await Promise.all([
    Chapter.find(filter)
      .sort(search ? { score: { $meta: "textScore" } } : { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Chapter.countDocuments(filter),
  ]);

  return NextResponse.json({ items, total, page, limit });
}

export async function POST(request: Request) {
  const auth = await requireApiRole(["super_admin"]);
  if ("response" in auth) return auth.response;
  const { session } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = createChapterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;

  await connectToDatabase();

  if (data.adminUserId) {
    const adminUser = await User.findById(data.adminUserId);
    if (!adminUser) return NextResponse.json({ error: "Assigned admin user not found" }, { status: 400 });
  }

  const baseSlug = slugify(data.name);
  let slug = baseSlug;
  let suffix = 1;
  while (await Chapter.exists({ slug })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const baseCode = chapterCodeFrom(data.state, data.name);
  let code = baseCode;
  suffix = 1;
  while (await Chapter.exists({ code })) {
    suffix += 1;
    code = `${baseCode}-${suffix}`;
  }

  const chapter = await Chapter.create({
    name: data.name,
    code,
    slug,
    type: data.type,
    city: data.city,
    district: data.district,
    state: data.state,
    address: data.address,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    description: data.description,
    mission: data.mission,
    status: "pending",
    adminUserId: data.adminUserId || null,
    createdBy: session.sub,
    isPublic: false,
  });

  if (data.adminUserId) {
    await User.updateOne(
      { _id: new Types.ObjectId(data.adminUserId), role: { $in: ["registered_user", "chapter_member"] } },
      { $set: { role: "chapter_admin", chapterId: chapter._id } },
    );
  }

  await recordAudit({ actorUserId: session.sub, action: "chapter.create", targetType: "Chapter", targetId: String(chapter._id) });

  return NextResponse.json({ chapter }, { status: 201 });
}
