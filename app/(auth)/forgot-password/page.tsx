import type { Metadata } from "next";
import ForgotPasswordForm from "@/shared/components/auth/forgotPasswordForm";

export const metadata: Metadata = { title: "Forgot password — AgriMinds" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
