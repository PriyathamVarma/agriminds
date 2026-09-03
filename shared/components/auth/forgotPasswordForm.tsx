"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FormField from "./formField";

type Values = { email: string };

export default function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ defaultValues: { email: "" } });

  const onSubmit = async (values: Values) => {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setServerError(data?.error || "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setServerError("Could not reach the server. Please try again.");
    }
  };

  if (sent) {
    return (
      <div className="rounded-3xl border border-border bg-surface-card p-7 text-center shadow-xl sm:p-9">
        <h1 className="font-display text-2xl font-semibold text-foreground-heading">Check your email</h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground-body">
          If that email is registered, we&apos;ve sent a link to reset your password. It expires in 1 hour.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-3xl border border-border bg-surface-card p-7 shadow-xl sm:p-9"
      noValidate
    >
      <h1 className="font-display text-2xl font-semibold text-foreground-heading">Reset your password</h1>
      <p className="mt-1.5 text-sm text-foreground-muted">We&apos;ll email you a link to reset it.</p>

      {serverError ? (
        <div role="alert" className="mt-5 rounded-xl border border-status-danger/30 bg-status-danger-surface px-4 py-3 text-sm text-status-danger">
          {serverError}
        </div>
      ) : null}

      <FormField
        label="Email"
        type="email"
        placeholder="you@example.com"
        registration={register("email", { required: "Email is required" })}
        error={errors.email?.message}
        disabled={isSubmitting}
        autoComplete="email"
        className="mt-6"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Sending…" : "Send reset link"}
        {!isSubmitting && <ArrowRight className="h-4 w-4" />}
      </button>

      <p className="mt-5 text-center text-sm text-foreground-muted">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
