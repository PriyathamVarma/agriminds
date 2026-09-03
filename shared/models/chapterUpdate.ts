import { Schema, Types, model, models, type Model, type InferSchemaType } from "mongoose";

export const CHAPTER_UPDATE_TYPES = [
  "general",
  "event",
  "workshop",
  "meeting",
  "success_story",
  "partnership",
  "support_activity",
  "impact_report",
] as const;

const ChapterUpdateSchema = new Schema(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    type: { type: String, enum: CHAPTER_UPDATE_TYPES, default: "general", required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 6000, default: "" },
    date: { type: Date, default: () => new Date() },
    location: { type: String, trim: true, maxlength: 200, default: "" },
    category: { type: String, trim: true, maxlength: 100, default: "" },
    images: { type: [String], default: [] },
    documents: { type: [String], default: [] },
    participantCount: { type: Number, default: 0 },
    beneficiaryCount: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "submitted", "approved", "published", "rejected"], default: "draft", required: true },
    visibility: { type: String, enum: ["public", "private"], default: "private" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewNotes: { type: String, trim: true, maxlength: 2000, default: "" },
  },
  { timestamps: true },
);

ChapterUpdateSchema.index({ chapterId: 1, date: -1 });
ChapterUpdateSchema.index({ status: 1, visibility: 1 });

export type IChapterUpdate = InferSchemaType<typeof ChapterUpdateSchema> & { _id: Types.ObjectId };

export const ChapterUpdate: Model<IChapterUpdate> =
  models.ChapterUpdate || model<IChapterUpdate>("ChapterUpdate", ChapterUpdateSchema);
