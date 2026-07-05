import { createFileRoute } from "@tanstack/react-router";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { MoreHorizontal, Search } from "lucide-react";

export const Route = createFileRoute("/dashboard/users")({
  component: Page,
});

const users = [
  { name: "Sarah Jenkins", email: "sarah@northwind.co", role: "Admin", status: "Active", activity: "4m ago" },
  { name: "Diego Ramos", email: "diego@contoso.com", role: "Analyst", status: "Active", activity: "1h ago" },
  { name: "Priya Patel", email: "priya@globex.co", role: "Analyst", status: "Active", activity: "3h ago" },
  { name: "Ayesha Khan", email: "ayesha@acmelabs.io", role: "Viewer", status: "Invited", activity: "—" },
  { name: "Mark Thorne", email: "mark@umbrella.co", role: "Viewer", status: "Blocked", activity: "2d ago" },
];

function Page() {
  return (
    <>
      <DashboardTopbar title="Users" />
      <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Search users…" className="input-field pl-9" />
          </div>
          <button className="bg-brand text-white text-sm px-4 py-2 rounded-lg font-medium hover:opacity-90">Invite user</button>
        </div>
        <div className="rounded-xl bg-card ring-1 ring-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Last active</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.email} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-gradient-to-br from-brand to-accent-cyan grid place-items-center text-white text-xs font-semibold">
                        {u.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded ${u.status === "Active" ? "bg-success/10 text-success" : u.status === "Invited" ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"}`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.activity}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="size-8 grid place-items-center rounded-lg hover:bg-muted ml-auto" aria-label="More"><MoreHorizontal className="size-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}