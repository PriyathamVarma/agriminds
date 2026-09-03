import { redirect } from "next/navigation";
import { getCurrentUser } from "@/shared/lib/auth/getCurrentUser";
import DocumentsManager from "@/shared/components/dashboard/documentsManager";

export default async function ChapterDocumentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard/chapter/documents");
  if (!user.chapterId) redirect("/dashboard");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground-heading">Document Centre</h2>
        <p className="mt-1 text-sm text-foreground-muted">Registration papers, meeting minutes, reports, and compliance records — metadata and links only, files live on Cloudinary.</p>
      </div>
      <DocumentsManager chapterId={String(user.chapterId)} canManage={user.role === "chapter_admin" || user.role === "super_admin"} />
    </div>
  );
}
