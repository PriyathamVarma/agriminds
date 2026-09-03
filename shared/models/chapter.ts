import { Schema, Types, model, models, type Model, type InferSchemaType } from "mongoose";

export const CHAPTER_STATUSES = ["pending", "active", "suspended", "archived"] as const;
export type ChapterStatus = (typeof CHAPTER_STATUSES)[number];

export const CHAPTER_TYPES = ["district", "state", "institutional", "regional"] as const;

const ChapterSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    // Short unique code, e.g. "AP-VZG" — assigned by the central team on creation.
    code: { type: String, required: true, trim: true, uppercase: true, unique: true, maxlength: 40 },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 200 },
    type: { type: String, enum: CHAPTER_TYPES, default: "district" },
    city: { type: String, trim: true, maxlength: 120, default: "" },
    district: { type: String, trim: true, maxlength: 120, default: "" },
    state: { type: String, required: true, trim: true, maxlength: 120 },
    address: { type: String, trim: true, maxlength: 500, default: "" },
    contactEmail: { type: String, trim: true, lowercase: true, default: "" },
    contactPhone: { type: String, trim: true, maxlength: 30, default: "" },
    description: { type: String, trim: true, maxlength: 4000, default: "" },
    mission: { type: String, trim: true, maxlength: 2000, default: "" },
    establishedDate: { type: Date, default: null },
    logoUrl: { type: String, trim: true, default: "" },
    coverImageUrl: { type: String, trim: true, default: "" },
    socialLinks: {
      website: { type: String, trim: true, default: "" },
      linkedin: { type: String, trim: true, default: "" },
      instagram: { type: String, trim: true, default: "" },
      x: { type: String, trim: true, default: "" },
    },
    status: { type: String, enum: CHAPTER_STATUSES, default: "pending", required: true },
    // The chapter_admin user primarily responsible for this chapter.
    adminUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true },
);

ChapterSchema.index({ status: 1 });
ChapterSchema.index({ state: 1, district: 1 });
ChapterSchema.index({ name: "text", city: "text", state: "text" });

export type IChapter = InferSchemaType<typeof ChapterSchema> & { _id: Types.ObjectId };

export const Chapter: Model<IChapter> = models.Chapter || model<IChapter>("Chapter", ChapterSchema);
