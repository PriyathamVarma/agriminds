import { cx } from "@/shared/lib/utils";

export default function Skeleton({ className }: { className?: string }) {
  return <div className={cx("animate-pulse rounded-lg bg-surface", className)} />;
}

export function SkeletonCardGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-surface-card p-5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-8 w-16" />
        </div>
      ))}
    </div>
  );
}
