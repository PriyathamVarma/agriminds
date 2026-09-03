import { redirect } from "next/navigation";
import { getCurrentUser } from "@/shared/lib/auth/getCurrentUser";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { Chapter } from "@/shared/models/chapter";
import ChapterProfileForm from "@/shared/components/dashboard/chapterProfileForm";

export default async function ChapterProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard/chapter/profile");
  if (!user.chapterId) redirect("/dashboard");

  await connectToDatabase();
  const chapter = await Chapter.findById(user.chapterId).lean();
  if (!chapter) redirect("/unauthorized");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground-heading">Chapter Profile</h2>
        <p className="mt-1 text-sm text-foreground-muted">This is what visitors see once your chapter is approved and made public.</p>
      </div>
      <ChapterProfileForm
        chapterId={String(chapter._id)}
        initial={{
          name: chapter.name,
          code: chapter.code,
          type: chapter.type,
          city: chapter.city,
          district: chapter.district,
          state: chapter.state,
          address: chapter.address,
          contactEmail: chapter.contactEmail,
          contactPhone: chapter.contactPhone,
          description: chapter.description,
          mission: chapter.mission,
          logoUrl: chapter.logoUrl,
          coverImageUrl: chapter.coverImageUrl,
          status: chapter.status,
          isPublic: chapter.isPublic,
          socialLinks: chapter.socialLinks ?? undefined,
        }}
      />
    </div>
  );
}
