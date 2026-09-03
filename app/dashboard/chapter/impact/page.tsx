import { redirect } from "next/navigation";
import { getCurrentUser } from "@/shared/lib/auth/getCurrentUser";
import ImpactManager from "@/shared/components/dashboard/impactManager";

export default async function ChapterImpactPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard/chapter/impact");
  if (!user.chapterId) redirect("/dashboard");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground-heading">Impact Metrics</h2>
        <p className="mt-1 text-sm text-foreground-muted">Report your chapter&apos;s reach on a monthly, quarterly, or annual basis.</p>
      </div>
      <ImpactManager chapterId={String(user.chapterId)} canManage={user.role === "chapter_admin" || user.role === "super_admin"} />
    </div>
  );
}
