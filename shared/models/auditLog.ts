import { Schema, Types, model, models, type Model, type InferSchemaType } from "mongoose";

const AuditLogSchema = new Schema(
  {
    actorUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true, trim: true, maxlength: 100 },
    targetType: { type: String, required: true, trim: true, maxlength: 60 },
    targetId: { type: Schema.Types.ObjectId, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

AuditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
AuditLogSchema.index({ actorUserId: 1, createdAt: -1 });

export type IAuditLog = InferSchemaType<typeof AuditLogSchema> & { _id: Types.ObjectId };

export const AuditLog: Model<IAuditLog> = models.AuditLog || model<IAuditLog>("AuditLog", AuditLogSchema);

/** Fire-and-forget audit log write — never let a logging failure break the calling action. */
export async function recordAudit(entry: {
  actorUserId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await AuditLog.create({
      actorUserId: entry.actorUserId,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId ?? null,
      metadata: entry.metadata ?? {},
    });
  } catch (err) {
    console.error("[audit] failed to record entry", entry.action, err);
  }
}
