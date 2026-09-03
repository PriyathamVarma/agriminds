import { Schema, Types, model, models, type Model, type InferSchemaType } from "mongoose";

const InvitationSchema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    role: { type: String, enum: ["chapter_admin", "chapter_member"], required: true },
    // Store only a hash of the token — the raw token is emailed/shared once and never persisted.
    tokenHash: { type: String, required: true, unique: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
    status: { type: String, enum: ["pending", "accepted", "expired", "revoked"], default: "pending", required: true },
    acceptedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    acceptedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

InvitationSchema.index({ email: 1, chapterId: 1 });
InvitationSchema.index({ expiresAt: 1 });

export type IInvitation = InferSchemaType<typeof InvitationSchema> & { _id: Types.ObjectId };

export const Invitation: Model<IInvitation> = models.Invitation || model<IInvitation>("Invitation", InvitationSchema);
