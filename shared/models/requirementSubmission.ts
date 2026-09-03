import { Schema, Types, model, models, type Model, type InferSchemaType } from "mongoose";

const RequirementSubmissionSchema = new Schema(
  {
    requirementId: { type: Schema.Types.ObjectId, ref: "ChapterRequirement", required: true },
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    valueReported: { type: Number, default: 0 },
    notes: { type: String, trim: true, maxlength: 2000, default: "" },
    evidenceUrls: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "changes_requested"],
      default: "pending",
      required: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewNotes: { type: String, trim: true, maxlength: 2000, default: "" },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

RequirementSubmissionSchema.index({ requirementId: 1, createdAt: -1 });
RequirementSubmissionSchema.index({ chapterId: 1, status: 1 });

export type IRequirementSubmission = InferSchemaType<typeof RequirementSubmissionSchema> & { _id: Types.ObjectId };

export const RequirementSubmission: Model<IRequirementSubmission> =
  models.RequirementSubmission || model<IRequirementSubmission>("RequirementSubmission", RequirementSubmissionSchema);
