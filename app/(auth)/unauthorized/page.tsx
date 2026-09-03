import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = { title: "Not authorized — AgriMinds" };

export default function UnauthorizedPage() {
  return (
    <div className="rounded-3xl border border-border bg-surface-card p-7 text-center shadow-xl sm:p-9">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-status-danger-surface text-status-danger">
        <ShieldAlert className="h-6 w-6" />
      </span>
      <h1 className="font-display mt-4 text-2xl font-semibold text-foreground-heading">You don&apos;t have access to this page</h1>
      <p className="mt-3 text-sm leading-relaxed text-foreground-body">
        Your account doesn&apos;t have permission to view this. If you think this is a mistake, contact your chapter administrator or the AgriMinds team.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover"
      >
        Go to your dashboard
      </Link>
    </div>
  );
}
