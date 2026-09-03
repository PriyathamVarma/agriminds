import ChaptersAdminList from "@/shared/components/dashboard/chaptersAdminList";

export default function AdminChaptersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground-heading">Chapters</h2>
        <p className="mt-1 text-sm text-foreground-muted">Create chapters, assign administrators, and review submissions.</p>
      </div>
      <ChaptersAdminList />
    </div>
  );
}
