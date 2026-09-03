import { z } from "zod";
import { CHAPTER_STATUSES, CHAPTER_TYPES } from "@/shared/models/chapter";

export const createChapterSchema = z.object({
  name: z.string().trim().min(2).max(200),
  type: z.enum(CHAPTER_TYPES).optional().default("district"),
  city: z.string().trim().max(120).optional().default(""),
  district: z.string().trim().max(120).optional().default(""),
  state: z.string().trim().min(1).max(120),
  address: z.string().trim().max(500).optional().default(""),
  contactEmail: z.string().trim().email().optional().or(z.literal("")).default(""),
  contactPhone: z.string().trim().max(30).optional().default(""),
  description: z.string().trim().max(4000).optional().default(""),
  mission: z.string().trim().max(2000).optional().default(""),
  adminUserId: z.string().optional(),
});

export const updateChapterSchema = z.object({
  name: z.string().trim().min(2).max(200).optional(),
  type: z.enum(CHAPTER_TYPES).optional(),
  city: z.string().trim().max(120).optional(),
  district: z.string().trim().max(120).optional(),
  state: z.string().trim().max(120).optional(),
  address: z.string().trim().max(500).optional(),
  contactEmail: z.string().trim().max(200).optional(),
  contactPhone: z.string().trim().max(30).optional(),
  description: z.string().trim().max(4000).optional(),
  mission: z.string().trim().max(2000).optional(),
  establishedDate: z.string().optional(),
  logoUrl: z.string().trim().max(2000).optional(),
  coverImageUrl: z.string().trim().max(2000).optional(),
  socialLinks: z
    .object({
      website: z.string().trim().max(500).optional(),
      linkedin: z.string().trim().max(500).optional(),
      instagram: z.string().trim().max(500).optional(),
      x: z.string().trim().max(500).optional(),
    })
    .optional(),
  status: z.enum(CHAPTER_STATUSES).optional(),
  adminUserId: z.string().nullable().optional(),
  isPublic: z.boolean().optional(),
});
