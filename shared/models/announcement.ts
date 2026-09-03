import { Schema, Types, model, models, type Model, type InferSchemaType } from "mongoose";

const AnnouncementSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, trim: true, maxlength: 6000 },
    scope: { type: String, enum: ["platform", "chapter"], default: "platform", required: true },
    // Set only when scope === "chapter".
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);

AnnouncementSchema.index({ scope: 1, publishedAt: -1 });
AnnouncementSchema.index({ chapterId: 1, publishedAt: -1 });

export type IAnnouncement = InferSchemaType<typeof AnnouncementSchema> & { _id: Types.ObjectId };

export const Announcement: Model<IAnnouncement> =
  models.Announcement || model<IAnnouncement>("Announcement", AnnouncementSchema);
