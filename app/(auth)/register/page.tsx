import type { Metadata } from "next";
import RegisterForm from "@/shared/components/auth/registerForm";

export const metadata: Metadata = { title: "Create an account — AgriMinds" };

export default function RegisterPage() {
  return <RegisterForm />;
}
