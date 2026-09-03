import { cx } from "@/shared/lib/utils";

export default function ProgressBar({ percent, className, label }: { percent: number; className?: string; label?: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className={className}>
      {label ? (
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-foreground-muted">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      ) : null}
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
        <div
          className={cx("h-full rounded-full transition-[width] duration-500", clamped >= 100 ? "bg-status-success" : "bg-primary")}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
