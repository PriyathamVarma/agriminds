import { connectToDatabase } from "@/shared/lib/mongodb";
import { ContactSubmission } from "@/shared/models/contact";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, email, role, message } = body as Record<string, unknown>;

  if (typeof name !== "string" || !name.trim()) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return Response.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (typeof role !== "string" || !role.trim()) {
    return Response.json({ error: "Role is required" }, { status: 400 });
  }
  if (message !== undefined && typeof message !== "string") {
    return Response.json({ error: "Invalid message" }, { status: 400 });
  }

  await connectToDatabase();

  const submission = await ContactSubmission.create({
    name: name.trim(),
    email: email.trim(),
    role: role.trim(),
    message: typeof message === "string" ? message.trim() : "",
  });

  return Response.json({ id: submission._id }, { status: 201 });
}
