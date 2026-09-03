import { Schema, Types, model, models, type Model, type InferSchemaType } from "mongoose";

export const USER_ROLES = ["super_admin", "chapter_admin", "chapter_member", "registered_user"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, trim: true, maxlength: 30, default: "" },
    city: { type: String, trim: true, maxlength: 120, default: "" },
    state: { type: String, trim: true, maxlength: 120, default: "" },
    organisation: { type: String, trim: true, maxlength: 200, default: "" },
    areaOfInterest: { type: String, trim: true, maxlength: 200, default: "" },
    role: { type: String, enum: USER_ROLES, default: "registered_user", required: true },
    // Set only for chapter_admin / chapter_member — which chapter they belong to.
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", default: null },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    emailVerified: { type: Boolean, default: false },
    // Password-reset flow (hashed token + expiry; never store the raw token).
    resetTokenHash: { type: String, select: false, default: null },
    resetTokenExpiresAt: { type: Date, select: false, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

UserSchema.index({ role: 1 });
UserSchema.index({ chapterId: 1 });

export type IUser = InferSchemaType<typeof UserSchema> & { _id: Types.ObjectId };

export const User: Model<IUser> = models.User || model<IUser>("User", UserSchema);
