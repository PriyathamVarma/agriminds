import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/shared/lib/auth/getSession";
import AcceptInvitationCard from "@/shared/components/auth/acceptInvitationCard";

export const metadata: Metadata = { title: "Accept invitation — AgriMinds" };

export default async function AcceptInvitationPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const session = await getSession();
  if (!session) {
    const redirectTo = token ? `/invitations/accept?token=${encodeURIComponent(token)}` : "/invitations/accept";
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }

  return (
    <Suspense fallback={null}>
      <AcceptInvitationCard token={token || null} />
    </Suspense>
  );
}
