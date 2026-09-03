"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FormField from "./formField";

type LoginFormValues = { email: string; password: string; rememberMe: boolean };

const DEFAULT_ROUTE_BY_ROLE: Record<string, string> = {
  super_admin: "/admin",
  chapter_admin: "/dashboard/chapter",
  chapter_member: "/dashboard/chapter",
  registered_user: "/dashboard",
};

/** Only ever follow a same-site relative path from the `redirect` query param — never let it
 * carry the user off to an arbitrary external URL. */
function safeRedirectTarget(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ defaultValues: { email: "", password: "", rememberMe: false } });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setServerError(data?.error || "Something went wrong. Please try again.");
        return;
      }
      const role = data?.user?.role as string | undefined;
      const destination = safeRedirectTarget(searchParams.get("redirect")) || (role && DEFAULT_ROUTE_BY_ROLE[role]) || "/dashboard";
      router.push(destination);
      router.refresh();
    } catch {
      setServerError("Could not reach the server. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-3xl border border-border bg-surface-card p-7 shadow-xl sm:p-9"
      noValidate
    >
      <h1 className="font-display text-2xl font-semibold text-foreground-heading">Welcome back</h1>
      <p className="mt-1.5 text-sm text-foreground-muted">Sign in to your AgriMinds account.</p>

      {serverError ? (
        <div role="alert" className="mt-5 rounded-xl border border-status-danger/30 bg-status-danger-surface px-4 py-3 text-sm text-status-danger">
          {serverError}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-4">
        <FormField
          label="Email"
          type="email"
          placeholder="you@example.com"
          registration={register("email", { required: "Email is required" })}
          error={errors.email?.message}
          disabled={isSubmitting}
          autoComplete="email"
        />
        <FormField
          label="Password"
          type="password"
          placeholder="Your password"
          registration={register("password", { required: "Password is required" })}
          error={errors.password?.message}
          disabled={isSubmitting}
          autoComplete="current-password"
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-foreground-body">
          <input type="checkbox" className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30" {...register("rememberMe")} />
          Remember me
        </label>
        <Link href="/forgot-password" className="font-medium text-primary hover:underline">
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
        {!isSubmitting && <ArrowRight className="h-4 w-4" />}
      </button>

      <p className="mt-5 text-center text-sm text-foreground-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
