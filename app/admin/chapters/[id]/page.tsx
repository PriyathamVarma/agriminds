import { notFound } from "next/navigation";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { Chapter } from "@/shared/models/chapter";
import AdminChapterDetail from "@/shared/components/dashboard/adminChapterDetail";

export default async function AdminChapterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectToDatabase();
  const chapter = await Chapter.findById(id).lean().catch(() => null);
  if (!chapter) notFound();

  return (
    <AdminChapterDetail
      chapter={{
        _id: String(chapter._id),
        name: chapter.name,
        code: chapter.code,
        city: chapter.city,
        state: chapter.state,
        status: chapter.status,
        isPublic: chapter.isPublic,
        adminUserId: chapter.adminUserId ? String(chapter.adminUserId) : null,
      }}
    />
  );
}
