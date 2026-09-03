import { NextResponse } from "next/server";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { ChapterApplication } from "@/shared/models/chapterApplication";
import { requireApiSession } from "@/shared/lib/auth/rbac";
import { chapterApplicationSchema } from "@/shared/lib/validation/applications";
import { rateLimit, clientIp } from "@/shared/lib/auth/rateLimit";

export async function GET(request: Request) {
  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const { session } = auth;

  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));

  const filter: Record<string, unknown> = session.role === "super_admin" ? {} : { applicantUserId: session.sub };
  if (status) filter.status = status;

  const [items, total] = await Promise.all([
    ChapterApplication.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("applicantUserId", "name email")
      .populate("targetChapterId", "name code")
      .lean(),
    ChapterApplication.countDocuments(filter),
  ]);

  return NextResponse.json({ items, total, page, limit });
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit(`applications:${ip}`, 10, 15 * 60 * 1000);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const auth = await requireApiSession();
  if ("response" in auth) return auth.response;
  const { session } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = chapterApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectToDatabase();
  const application = await ChapterApplication.create({
    applicantUserId: session.sub,
    type: parsed.data.type,
    targetChapterId: parsed.data.type === "join_existing" ? parsed.data.targetChapterId : null,
    proposedChapterName: parsed.data.proposedChapterName,
    proposedCity: parsed.data.proposedCity,
    proposedState: parsed.data.proposedState,
    message: parsed.data.message,
  });

  return NextResponse.json({ application }, { status: 201 });
}
