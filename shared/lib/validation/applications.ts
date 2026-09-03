import { z } from "zod";

export const chapterApplicationSchema = z
  .object({
    type: z.enum(["join_existing", "propose_new"]),
    targetChapterId: z.string().optional(),
    proposedChapterName: z.string().trim().max(200).optional().default(""),
    proposedCity: z.string().trim().max(120).optional().default(""),
    proposedState: z.string().trim().max(120).optional().default(""),
    message: z.string().trim().max(4000).optional().default(""),
  })
  .refine((data) => (data.type === "join_existing" ? Boolean(data.targetChapterId) : true), {
    message: "Select a chapter to apply to",
    path: ["targetChapterId"],
  })
  .refine((data) => (data.type === "propose_new" ? Boolean(data.proposedChapterName) : true), {
    message: "A proposed chapter name is required",
    path: ["proposedChapterName"],
  });

export const applicationReviewSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reviewNotes: z.string().trim().max(2000).optional().default(""),
});
