import { redirect } from "next/navigation";
import { getCurrentUser } from "@/shared/lib/auth/getCurrentUser";
import TeamManager from "@/shared/components/dashboard/teamManager";

export default async function ChapterTeamPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard/chapter/team");
  if (!user.chapterId) redirect("/dashboard");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground-heading">Chapter Team</h2>
        <p className="mt-1 text-sm text-foreground-muted">Manage who represents your chapter — public profiles and internal permissions.</p>
      </div>
      <TeamManager chapterId={String(user.chapterId)} canManage={user.role === "chapter_admin" || user.role === "super_admin"} />
    </div>
  );
}
