import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/shared/components/auth/loginForm";

export const metadata: Metadata = { title: "Sign in — AgriMinds" };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
