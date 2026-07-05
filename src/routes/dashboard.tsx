import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [
    { title: "Dashboard — Lumina AI" },
    { name: "description", content: "Enterprise review intelligence dashboard." },
  ]}),
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <div className="min-h-dvh flex bg-background">
      <DashboardSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}