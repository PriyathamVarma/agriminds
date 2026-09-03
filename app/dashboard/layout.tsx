import { redirect } from "next/navigation";
import { getCurrentUser } from "@/shared/lib/auth/getCurrentUser";
import DashboardShell from "@/shared/components/dashboard/dashboardShell";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  chapter_admin: "Chapter Admin",
  chapter_member: "Chapter Member",
  registered_user: "Member",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Defense in depth — proxy.ts already blocks unauthenticated requests to /dashboard/*, but a
  // server component should never assume that alone; re-verify here too.
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard");

  const isChapterRole = user.role === "chapter_admin" || user.role === "chapter_member" || user.role === "super_admin";

  return (
    <DashboardShell variant={isChapterRole ? "chapter" : "general"} sectionLabel="Dashboard" userName={user.name} userRoleLabel={ROLE_LABEL[user.role] ?? user.role}>
      {children}
    </DashboardShell>
  );
}
