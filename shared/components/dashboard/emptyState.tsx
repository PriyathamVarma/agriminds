import type { LucideIcon } from "lucide-react";
import { cx } from "@/shared/lib/utils";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center", className)}>
      {Icon ? (
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-card text-foreground-muted">
          <Icon className="h-5 w-5" />
        </span>
      ) : null}
      <p className="text-sm font-semibold text-foreground-heading">{title}</p>
      {description ? <p className="mt-1.5 max-w-sm text-sm text-foreground-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
