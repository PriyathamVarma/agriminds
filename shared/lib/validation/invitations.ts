import { z } from "zod";

export const createInvitationSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  chapterId: z.string().min(1),
  role: z.enum(["chapter_admin", "chapter_member"]),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1),
});
