"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

type Status = "loading" | "success" | "error";

export default function AcceptInvitationCard({ token }: { token: string | null }) {
  const [status, setStatus] = useState<Status>(token ? "loading" : "error");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/invitations/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok) {
          setMessage(data?.error || "This invitation could not be accepted.");
          setStatus("error");
          return;
        }
        setStatus("success");
      } catch {
        if (!cancelled) {
          setMessage("Could not reach the server.");
          setStatus("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="rounded-3xl border border-border bg-surface-card p-7 text-center shadow-xl sm:p-9">
      {status === "loading" ? (
        <p className="text-sm text-foreground-muted">Accepting your invitation…</p>
      ) : status === "success" ? (
        <>
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-status-success-surface text-status-success">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <h1 className="font-display mt-4 text-2xl font-semibold text-foreground-heading">You&apos;re in!</h1>
          <p className="mt-2 text-sm text-foreground-body">You&apos;ve joined the chapter. Head to your dashboard to get started.</p>
          <Link href="/dashboard/chapter" className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover">
            Go to chapter dashboard
          </Link>
        </>
      ) : (
        <>
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-status-danger-surface text-status-danger">
            <XCircle className="h-6 w-6" />
          </span>
          <h1 className="font-display mt-4 text-2xl font-semibold text-foreground-heading">Couldn&apos;t accept this invitation</h1>
          <p className="mt-2 text-sm text-foreground-body">{message || "This invitation link is missing or invalid."}</p>
          <Link href="/dashboard" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
            Go to your dashboard
          </Link>
        </>
      )}
    </div>
  );
}
