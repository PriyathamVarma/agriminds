import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { RequirementTemplate } from "@/shared/models/requirementTemplate";
import { requireApiRole } from "@/shared/lib/auth/rbac";

const templateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().default(""),
  category: z.string().trim().max(100).optional().default("general"),
  defaultUnit: z.string().trim().max(50).optional().default(""),
  defaultPriority: z.enum(["low", "medium", "high"]).optional().default("medium"),
});

export async function GET() {
  const auth = await requireApiRole(["super_admin"]);
  if ("response" in auth) return auth.response;

  await connectToDatabase();
  const items = await RequirementTemplate.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ items });
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
  const parsed = templateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectToDatabase();
  const template = await RequirementTemplate.create({ ...parsed.data, createdBy: session.sub });
  return NextResponse.json({ template }, { status: 201 });
}
