"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FormField from "./formField";

type RegisterFormValues = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  city: string;
  state: string;
  organisation: string;
  areaOfInterest: string;
  acceptTerms: boolean;
};

export default function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      city: "",
      state: "",
      organisation: "",
      areaOfInterest: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setServerError(data?.error || "Something went wrong. Please try again.");
        return;
      }
      router.push("/dashboard");
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
      <h1 className="font-display text-2xl font-semibold text-foreground-heading">Create your account</h1>
      <p className="mt-1.5 text-sm text-foreground-muted">Join the AgriMinds movement.</p>

      {serverError ? (
        <div role="alert" className="mt-5 rounded-xl border border-status-danger/30 bg-status-danger-surface px-4 py-3 text-sm text-status-danger">
          {serverError}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <FormField
          label="Full name"
          placeholder="Your full name"
          registration={register("name", { required: "Name is required" })}
          error={errors.name?.message}
          disabled={isSubmitting}
          className="sm:col-span-2"
          autoComplete="name"
        />
        <FormField
          label="Email"
          type="email"
          placeholder="you@example.com"
          registration={register("email", { required: "Email is required" })}
          error={errors.email?.message}
          disabled={isSubmitting}
          className="sm:col-span-2"
          autoComplete="email"
        />
        <FormField
          label="Phone number"
          type="tel"
          placeholder="+91 9xxxxxxxxx"
          registration={register("phone")}
          error={errors.phone?.message}
          disabled={isSubmitting}
          autoComplete="tel"
        />
        <FormField
          label="Area of interest"
          placeholder="e.g. Value addition, Finance"
          registration={register("areaOfInterest")}
          error={errors.areaOfInterest?.message}
          disabled={isSubmitting}
        />
        <FormField
          label="City"
          placeholder="Your city"
          registration={register("city")}
          error={errors.city?.message}
          disabled={isSubmitting}
        />
        <FormField
          label="State"
          placeholder="Your state"
          registration={register("state")}
          error={errors.state?.message}
          disabled={isSubmitting}
        />
        <FormField
          label="Organisation / institution (optional)"
          placeholder="Optional"
          registration={register("organisation")}
          error={errors.organisation?.message}
          disabled={isSubmitting}
          className="sm:col-span-2"
        />
        <FormField
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          registration={register("password", { required: "Password is required", minLength: { value: 8, message: "At least 8 characters" } })}
          error={errors.password?.message}
          disabled={isSubmitting}
          autoComplete="new-password"
        />
        <FormField
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          registration={register("confirmPassword", { required: "Please confirm your password" })}
          error={errors.confirmPassword?.message}
          disabled={isSubmitting}
          autoComplete="new-password"
        />
      </div>

      <label className="mt-5 flex items-start gap-2.5 text-sm text-foreground-body">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 flex-none rounded border-border text-primary focus:ring-primary/30"
          {...register("acceptTerms", { required: "You must accept the terms and privacy policy" })}
        />
        I accept the AgriMinds terms of use and privacy policy.
      </label>
      {errors.acceptTerms ? <p className="mt-1.5 text-xs font-medium text-status-danger">{errors.acceptTerms.message}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating your account…" : "Create account"}
        {!isSubmitting && <ArrowRight className="h-4 w-4" />}
      </button>

      <p className="mt-5 text-center text-sm text-foreground-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
