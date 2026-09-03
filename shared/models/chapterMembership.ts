import { Schema, Types, model, models, type Model, type InferSchemaType } from "mongoose";

const ChapterMembershipSchema = new Schema(
  {
    // Optional — many team profiles (e.g. a designated point of contact shown publicly) never
    // get a platform login. Set only for members who are actually invited/registered users.
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    name: { type: String, trim: true, maxlength: 200, default: "" },
    role: { type: String, enum: ["admin", "member"], default: "member", required: true },
    designation: { type: String, trim: true, maxlength: 150, default: "" },
    bio: { type: String, trim: true, maxlength: 2000, default: "" },
    photoUrl: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, trim: true, maxlength: 30, default: "" },
    linkedin: { type: String, trim: true, default: "" },
    joiningDate: { type: Date, default: () => new Date() },
    displayOrder: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: true },
    // Internal permissions a chapter_admin can grant a member (e.g. edit updates, upload docs).
    permissions: {
      manageUpdates: { type: Boolean, default: false },
      manageDocuments: { type: Boolean, default: false },
      manageRequirements: { type: Boolean, default: false },
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

ChapterMembershipSchema.index({ chapterId: 1, displayOrder: 1 });
// Partial: only enforced among documents that actually have a linked platform user — otherwise
// the many userId-less informational team profiles a chapter can have would collide on null.
ChapterMembershipSchema.index({ userId: 1, chapterId: 1 }, { unique: true, partialFilterExpression: { userId: { $type: "objectId" } } });

export type IChapterMembership = InferSchemaType<typeof ChapterMembershipSchema> & { _id: Types.ObjectId };

export const ChapterMembership: Model<IChapterMembership> =
  models.ChapterMembership || model<IChapterMembership>("ChapterMembership", ChapterMembershipSchema);
