import { Schema, Types, model, models, type Model, type InferSchemaType } from "mongoose";

const ChapterApplicationSchema = new Schema(
  {
    applicantUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["join_existing", "propose_new"], required: true },
    // Set when type === "join_existing".
    targetChapterId: { type: Schema.Types.ObjectId, ref: "Chapter", default: null },
    // Set when type === "propose_new".
    proposedChapterName: { type: String, trim: true, maxlength: 200, default: "" },
    proposedCity: { type: String, trim: true, maxlength: 120, default: "" },
    proposedState: { type: String, trim: true, maxlength: 120, default: "" },
    message: { type: String, trim: true, maxlength: 4000, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", required: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewNotes: { type: String, trim: true, maxlength: 2000, default: "" },
    reviewedAt: { type: Date, default: null },
    // Set once approved and a Chapter is created/linked as a result.
    resultingChapterId: { type: Schema.Types.ObjectId, ref: "Chapter", default: null },
  },
  { timestamps: true },
);

ChapterApplicationSchema.index({ status: 1, createdAt: -1 });
ChapterApplicationSchema.index({ applicantUserId: 1 });

export type IChapterApplication = InferSchemaType<typeof ChapterApplicationSchema> & { _id: Types.ObjectId };

export const ChapterApplication: Model<IChapterApplication> =
  models.ChapterApplication || model<IChapterApplication>("ChapterApplication", ChapterApplicationSchema);
