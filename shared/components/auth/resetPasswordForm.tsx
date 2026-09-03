"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FormField from "./formField";

type Values = { password: string; confirmPassword: string };

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ defaultValues: { password: "", confirmPassword: "" } });

  const onSubmit = async (values: Values) => {
    setServerError(null);
    if (!token) {
      setServerError("This reset link is missing its token. Please request a new one.");
      return;
    }
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...values }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setServerError(data?.error || "Something went wrong. Please try again.");
        return;
      }
      router.push("/login");
    } catch {
      setServerError("Could not reach the server. Please try again.");
    }
  };

  if (!token) {
    return (
      <div className="rounded-3xl border border-border bg-surface-card p-7 text-center shadow-xl sm:p-9">
        <h1 className="font-display text-2xl font-semibold text-foreground-heading">Invalid link</h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground-body">
          This password reset link is missing or malformed.
        </p>
        <Link href="/forgot-password" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
          Request a new link
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
      <h1 className="font-display text-2xl font-semibold text-foreground-heading">Set a new password</h1>
      <p className="mt-1.5 text-sm text-foreground-muted">Choose a strong password for your account.</p>

      {serverError ? (
        <div role="alert" className="mt-5 rounded-xl border border-status-danger/30 bg-status-danger-surface px-4 py-3 text-sm text-status-danger">
          {serverError}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-4">
        <FormField
          label="New password"
          type="password"
          placeholder="At least 8 characters"
          registration={register("password", { required: "Password is required", minLength: { value: 8, message: "At least 8 characters" } })}
          error={errors.password?.message}
          disabled={isSubmitting}
          autoComplete="new-password"
        />
        <FormField
          label="Confirm new password"
          type="password"
          placeholder="Re-enter your password"
          registration={register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === getValues("password") || "Passwords do not match",
          })}
          error={errors.confirmPassword?.message}
          disabled={isSubmitting}
          autoComplete="new-password"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saving…" : "Reset password"}
        {!isSubmitting && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );
}
