import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordForm from "@/shared/components/auth/resetPasswordForm";

export const metadata: Metadata = { title: "Reset password — AgriMinds" };

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
