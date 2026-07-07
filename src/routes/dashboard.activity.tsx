import { createFileRoute } from "@tanstack/react-router";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { ActivityFeed } from "@/components/dashboard/activity-feed";

export const Route = createFileRoute("/dashboard/activity")({
  component: Page,
});

function Page() {
  return (
    <>
      <DashboardTopbar title="Audit Log" />
      <div className="p-6 max-w-4xl w-full mx-auto">
        <div className="p-6 rounded-xl bg-card ring-1 ring-border">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold tracking-tight">Audit trail</h3>
              <p className="text-xs text-muted-foreground">Searchable log of uploads, analyses, exports, and admin actions.</p>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Live</span>
          </div>
          <div className="mt-4">
            <ActivityFeed searchable />
          </div>
        </div>
      </div>
    </>
  );
}