import { Schema, Types, model, models, type Model, type InferSchemaType } from "mongoose";

const ImpactReportSchema = new Schema(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    period: { type: String, enum: ["monthly", "quarterly", "annual"], required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    metrics: {
      eventsConducted: { type: Number, default: 0 },
      farmersReached: { type: Number, default: 0 },
      fpoSupported: { type: Number, default: 0 },
      startupsSupported: { type: Number, default: 0 },
      studentsEngaged: { type: Number, default: 0 },
      womenEntrepreneursSupported: { type: Number, default: 0 },
      partnershipsCreated: { type: Number, default: 0 },
      mentorshipSessions: { type: Number, default: 0 },
      fundingFacilitated: { type: Number, default: 0 },
      jobsCreated: { type: Number, default: 0 },
    },
    submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["draft", "submitted", "approved"], default: "draft", required: true },
  },
  { timestamps: true },
);

ImpactReportSchema.index({ chapterId: 1, period: 1, periodStart: -1 });

export type IImpactReport = InferSchemaType<typeof ImpactReportSchema> & { _id: Types.ObjectId };

export const ImpactReport: Model<IImpactReport> =
  models.ImpactReport || model<IImpactReport>("ImpactReport", ImpactReportSchema);
