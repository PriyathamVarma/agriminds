import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const ContactSubmissionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    role: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, trim: true, maxlength: 4000, default: "" },
  },
  { timestamps: true },
);

export type IContactSubmission = InferSchemaType<typeof ContactSubmissionSchema>;

export const ContactSubmission: Model<IContactSubmission> =
  models.ContactSubmission || model<IContactSubmission>("ContactSubmission", ContactSubmissionSchema);
