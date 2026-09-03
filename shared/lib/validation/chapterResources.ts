import { z } from "zod";
import { CHAPTER_UPDATE_TYPES } from "@/shared/models/chapterUpdate";
import { CHAPTER_DOCUMENT_CATEGORIES } from "@/shared/models/chapterDocument";

export const teamMemberSchema = z.object({
  userId: z.string().optional(),
  name: z.string().trim().min(1).max(200).optional(),
  role: z.enum(["admin", "member"]).optional().default("member"),
  designation: z.string().trim().max(150).optional().default(""),
  bio: z.string().trim().max(2000).optional().default(""),
  photoUrl: z.string().trim().max(2000).optional().default(""),
  email: z.string().trim().max(200).optional().default(""),
  phone: z.string().trim().max(30).optional().default(""),
  linkedin: z.string().trim().max(500).optional().default(""),
  displayOrder: z.number().optional().default(0),
  isPublic: z.boolean().optional().default(true),
  permissions: z
    .object({
      manageUpdates: z.boolean().optional().default(false),
      manageDocuments: z.boolean().optional().default(false),
      manageRequirements: z.boolean().optional().default(false),
    })
    .optional(),
});

export const requirementAssignSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().default(""),
  category: z.string().trim().max(100).optional().default("general"),
  reportingPeriod: z.string().trim().max(50).optional().default(""),
  targetValue: z.number().optional().default(0),
  unit: z.string().trim().max(50).optional().default(""),
  dueDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
  evidenceRequired: z.boolean().optional().default(false),
  assignedTo: z.string().optional(),
  templateId: z.string().optional(),
});

export const requirementProgressSchema = z.object({
  currentValue: z.number().optional(),
  progressPercentage: z.number().min(0).max(100).optional(),
  status: z.enum(["not_started", "in_progress", "submitted"]).optional(),
});

export const requirementReviewSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  adminFeedback: z.string().trim().max(2000).optional().default(""),
});

export const submissionCreateSchema = z.object({
  valueReported: z.number().optional().default(0),
  notes: z.string().trim().max(2000).optional().default(""),
  evidenceUrls: z.array(z.string().trim().max(2000)).optional().default([]),
});

export const submissionReviewSchema = z.object({
  status: z.enum(["approved", "rejected", "changes_requested"]),
  reviewNotes: z.string().trim().max(2000).optional().default(""),
});

export const chapterUpdateSchema = z.object({
  type: z.enum(CHAPTER_UPDATE_TYPES).optional().default("general"),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(6000).optional().default(""),
  date: z.string().optional(),
  location: z.string().trim().max(200).optional().default(""),
  category: z.string().trim().max(100).optional().default(""),
  images: z.array(z.string().trim().max(2000)).optional().default([]),
  documents: z.array(z.string().trim().max(2000)).optional().default([]),
  participantCount: z.number().optional().default(0),
  beneficiaryCount: z.number().optional().default(0),
  visibility: z.enum(["public", "private"]).optional().default("private"),
  status: z.enum(["draft", "submitted"]).optional().default("draft"),
});

// Only the file types a chapter document centre actually needs — keeps the metadata honest even
// though, without a real upload widget wired in yet, the client is the one reporting these.
const ALLOWED_DOCUMENT_FILE_TYPES = ["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg", "webp"] as const;
const MAX_DOCUMENT_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

export const chapterDocumentSchema = z.object({
  category: z.enum(CHAPTER_DOCUMENT_CATEGORIES),
  title: z.string().trim().min(1).max(200),
  fileUrl: z.string().trim().min(1).max(2000).refine((url) => /^https:\/\//.test(url), "File URL must be a secure (https) link"),
  fileType: z
    .string()
    .trim()
    .toLowerCase()
    .max(10)
    .refine((t) => t === "" || (ALLOWED_DOCUMENT_FILE_TYPES as readonly string[]).includes(t), "Unsupported file type")
    .optional()
    .default(""),
  fileSize: z.number().min(0).max(MAX_DOCUMENT_FILE_SIZE_BYTES, "File is too large (20MB max)").optional().default(0),
});

export const impactReportSchema = z.object({
  period: z.enum(["monthly", "quarterly", "annual"]),
  periodStart: z.string(),
  periodEnd: z.string(),
  metrics: z.object({
    eventsConducted: z.number().optional().default(0),
    farmersReached: z.number().optional().default(0),
    fpoSupported: z.number().optional().default(0),
    startupsSupported: z.number().optional().default(0),
    studentsEngaged: z.number().optional().default(0),
    womenEntrepreneursSupported: z.number().optional().default(0),
    partnershipsCreated: z.number().optional().default(0),
    mentorshipSessions: z.number().optional().default(0),
    fundingFacilitated: z.number().optional().default(0),
    jobsCreated: z.number().optional().default(0),
  }),
});
