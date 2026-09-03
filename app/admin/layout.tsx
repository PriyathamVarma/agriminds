import { redirect } from "next/navigation";
import { getCurrentUser } from "@/shared/lib/auth/getCurrentUser";
import DashboardShell from "@/shared/components/dashboard/dashboardShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Defense in depth — proxy.ts already restricts /admin/* to super_admin, but never trust that
  // alone in a server component.
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/admin");
  if (user.role !== "super_admin") redirect("/unauthorized");

  return (
    <DashboardShell variant="admin" sectionLabel="AgriMinds Admin" userName={user.name} userRoleLabel="Super Admin">
      {children}
    </DashboardShell>
  );
}
