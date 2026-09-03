import AnnouncementsAdminManager from "@/shared/components/dashboard/announcementsAdminManager";

export default function AdminAnnouncementsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground-heading">Announcements</h2>
        <p className="mt-1 text-sm text-foreground-muted">Send a platform-wide update to every member.</p>
      </div>
      <AnnouncementsAdminManager />
    </div>
  );
}
