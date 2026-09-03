import { redirect } from "next/navigation";
import { getCurrentUser } from "@/shared/lib/auth/getCurrentUser";
import UpdatesManager from "@/shared/components/dashboard/updatesManager";

export default async function ChapterUpdatesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard/chapter/updates");
  if (!user.chapterId) redirect("/dashboard");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground-heading">Updates & Activities</h2>
        <p className="mt-1 text-sm text-foreground-muted">Events, workshops, success stories, and more — publish to your chapter&apos;s public page once approved.</p>
      </div>
      <UpdatesManager chapterId={String(user.chapterId)} canManage={user.role === "chapter_admin" || user.role === "super_admin"} />
    </div>
  );
}
