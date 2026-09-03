import { Schema, Types, model, models, type Model, type InferSchemaType } from "mongoose";

export const CHAPTER_DOCUMENT_CATEGORIES = [
  "registration",
  "team_authorisation",
  "minutes",
  "activity_report",
  "financial",
  "partnership",
  "compliance",
  "photo_evidence",
] as const;

const ChapterDocumentSchema = new Schema(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    category: { type: String, enum: CHAPTER_DOCUMENT_CATEGORIES, required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    // Metadata + URL only — the actual file lives in Cloudinary (or another external store),
    // never as binary data in MongoDB.
    fileUrl: { type: String, required: true, trim: true },
    fileType: { type: String, trim: true, maxlength: 50, default: "" },
    fileSize: { type: Number, default: 0 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

ChapterDocumentSchema.index({ chapterId: 1, category: 1 });

export type IChapterDocument = InferSchemaType<typeof ChapterDocumentSchema> & { _id: Types.ObjectId };

export const ChapterDocument: Model<IChapterDocument> =
  models.ChapterDocument || model<IChapterDocument>("ChapterDocument", ChapterDocumentSchema);
