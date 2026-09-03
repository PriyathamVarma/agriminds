import { Schema, Types, model, models, type Model, type InferSchemaType } from "mongoose";

export const REQUIREMENT_STATUSES = [
  "not_started",
  "in_progress",
  "submitted",
  "approved",
  "rejected",
  "overdue",
] as const;

const ChapterRequirementSchema = new Schema(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    templateId: { type: Schema.Types.ObjectId, ref: "RequirementTemplate", default: null },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    category: { type: String, trim: true, maxlength: 100, default: "general" },
    reportingPeriod: { type: String, trim: true, maxlength: 50, default: "" },
    targetValue: { type: Number, default: 0 },
    currentValue: { type: Number, default: 0 },
    unit: { type: String, trim: true, maxlength: 50, default: "" },
    dueDate: { type: Date, default: null },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    evidenceRequired: { type: Boolean, default: false },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    status: { type: String, enum: REQUIREMENT_STATUSES, default: "not_started", required: true },
    adminFeedback: { type: String, trim: true, maxlength: 2000, default: "" },
    assignedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

ChapterRequirementSchema.index({ chapterId: 1, status: 1 });
ChapterRequirementSchema.index({ dueDate: 1 });

export type IChapterRequirement = InferSchemaType<typeof ChapterRequirementSchema> & { _id: Types.ObjectId };

export const ChapterRequirement: Model<IChapterRequirement> =
  models.ChapterRequirement || model<IChapterRequirement>("ChapterRequirement", ChapterRequirementSchema);
