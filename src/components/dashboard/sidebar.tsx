import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, MessageSquare, LineChart, Boxes, FileText, Users, Settings, LogOut, Activity } from "lucide-react";
import { Logo } from "@/components/site/logo";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/analysis", label: "Review Analysis", icon: MessageSquare },
  { to: "/dashboard/analytics", label: "Analytics", icon: LineChart },
  { to: "/dashboard/products", label: "Products", icon: Boxes },
  { to: "/dashboard/reports", label: "Reports", icon: FileText },
  { to: "/dashboard/activity", label: "Audit Log", icon: Activity },
  { to: "/dashboard/users", label: "Users", icon: Users },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export function DashboardSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="w-60 shrink-0 border-r border-border bg-sidebar hidden lg:flex flex-col">
      <div className="p-4 border-b border-border">
        <Logo />
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map((n) => {
          const active = path === n.to;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
            >
              <n.icon className="size-4" /> {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border">
        <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors">
          <LogOut className="size-4" /> Sign out
        </Link>
      </div>
    </aside>
  );
}