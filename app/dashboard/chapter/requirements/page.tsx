import { redirect } from "next/navigation";
import { getCurrentUser } from "@/shared/lib/auth/getCurrentUser";
import RequirementsManager from "@/shared/components/dashboard/requirementsManager";

export default async function ChapterRequirementsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard/chapter/requirements");
  if (!user.chapterId) redirect("/dashboard");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground-heading">Requirements & Milestones</h2>
        <p className="mt-1 text-sm text-foreground-muted">Track progress against what the AgriMinds team has assigned this chapter, and submit evidence for review.</p>
      </div>
      <RequirementsManager chapterId={String(user.chapterId)} canManage={user.role === "chapter_admin" || user.role === "super_admin"} />
    </div>
  );
}
