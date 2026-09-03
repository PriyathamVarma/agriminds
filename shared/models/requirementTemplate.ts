import { Schema, Types, model, models, type Model, type InferSchemaType } from "mongoose";

const RequirementTemplateSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    category: { type: String, trim: true, maxlength: 100, default: "general" },
    defaultUnit: { type: String, trim: true, maxlength: 50, default: "" },
    defaultPriority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export type IRequirementTemplate = InferSchemaType<typeof RequirementTemplateSchema> & { _id: Types.ObjectId };

export const RequirementTemplate: Model<IRequirementTemplate> =
  models.RequirementTemplate || model<IRequirementTemplate>("RequirementTemplate", RequirementTemplateSchema);
