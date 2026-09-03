import ApplicationsAdminList from "@/shared/components/dashboard/applicationsAdminList";

export default function AdminApplicationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground-heading">Applications</h2>
        <p className="mt-1 text-sm text-foreground-muted">Requests to join an existing chapter, or to start a new one.</p>
      </div>
      <ApplicationsAdminList />
    </div>
  );
}
