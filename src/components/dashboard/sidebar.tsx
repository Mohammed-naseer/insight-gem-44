import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, MessageSquare, LineChart, Boxes, FileText, Users, Settings, LogOut, Activity, History, UserCheck } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { logout, useAuth } from "@/lib/auth-store";
import { toast } from "sonner";

const allNavItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, role: null },
  { to: "/dashboard/analysis", label: "Review Analysis", icon: MessageSquare, role: null },
  { to: "/dashboard/history", label: "History", icon: History, role: null },
  { to: "/dashboard/analytics", label: "Analytics", icon: LineChart, role: null },
  { to: "/dashboard/products", label: "Products", icon: Boxes, role: null },
  { to: "/dashboard/reports", label: "Reports", icon: FileText, role: null },
  { to: "/dashboard/activity", label: "Audit Log", icon: Activity, role: null },
  { to: "/dashboard/users", label: "Users", icon: Users, role: null },
  { to: "/dashboard/approval", label: "User Approval", icon: UserCheck, role: "Admin" as const },
  { to: "/dashboard/settings", label: "Settings", icon: Settings, role: null },
] as const;

export function DashboardSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav2 = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role || "Viewer";

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    nav2({ to: "/login" });
  };

  const visibleNav = allNavItems.filter((n) => !n.role || n.role === userRole);

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-sidebar hidden lg:flex flex-col">
      <div className="p-4 border-b border-border">
        <Logo />
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {visibleNav.map((n) => {
          const active = path === n.to || (n.to !== "/dashboard" && path.startsWith(n.to));
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
            >
              <n.icon className="size-4" /> {n.label}
              {n.to === "/dashboard/approval" && userRole === "Admin" && (
                <span className="ml-auto text-[10px] bg-brand text-white rounded-full px-1.5 py-0.5 font-medium">Admin</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}