import type { LucideIcon } from "lucide-react";
import { cx } from "@/shared/lib/utils";

export default function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  className,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cx("rounded-2xl border border-border bg-surface-card p-5", className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-foreground-muted uppercase">{label}</p>
        {Icon ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <p className="font-display mt-2 text-3xl font-semibold text-foreground-heading">{value}</p>
      {hint ? <p className="mt-1 text-xs text-foreground-muted">{hint}</p> : null}
    </div>
  );
}
