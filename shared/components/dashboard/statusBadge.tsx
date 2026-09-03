import { cx } from "@/shared/lib/utils";

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

const TONE_CLS: Record<StatusTone, string> = {
  neutral: "bg-surface text-foreground-muted border-border",
  success: "bg-status-success-surface text-status-success border-status-success/25",
  warning: "bg-accent-soft text-accent-foreground border-accent/30",
  danger: "bg-status-danger-surface text-status-danger border-status-danger/25",
  info: "bg-primary-soft text-primary border-primary/20",
};

export default function StatusBadge({ label, tone = "neutral", className }: { label: string; tone?: StatusTone; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        TONE_CLS[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}

/** Maps common status enum values across the app to a sensible badge tone. */
export function toneForStatus(status: string): StatusTone {
  switch (status) {
    case "active":
    case "approved":
    case "published":
    case "accepted":
      return "success";
    case "pending":
    case "submitted":
    case "in_progress":
    case "not_started":
      return "warning";
    case "rejected":
    case "suspended":
    case "overdue":
    case "expired":
    case "revoked":
      return "danger";
    case "draft":
    case "archived":
    case "inactive":
      return "neutral";
    default:
      return "info";
  }
}
