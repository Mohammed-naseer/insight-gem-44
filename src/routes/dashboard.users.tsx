import { createFileRoute } from "@tanstack/react-router";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { Ban, Check, Search, Trash2, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/users")({
  component: Page,
});

type Role = "Admin" | "Analyst" | "Viewer";
type Status = "Active" | "Invited" | "Blocked";
type User = { id: string; name: string; email: string; role: Role; status: Status; activity: string };

const initialUsers: User[] = [
  { id: "u1", name: "Sarah Jenkins", email: "sarah@northwind.co", role: "Admin", status: "Active", activity: "4m ago" },
  { id: "u2", name: "Diego Ramos", email: "diego@contoso.com", role: "Analyst", status: "Active", activity: "1h ago" },
  { id: "u3", name: "Priya Patel", email: "priya@globex.co", role: "Analyst", status: "Active", activity: "3h ago" },
  { id: "u4", name: "Ayesha Khan", email: "ayesha@acmelabs.io", role: "Viewer", status: "Invited", activity: "—" },
  { id: "u5", name: "Mark Thorne", email: "mark@umbrella.co", role: "Viewer", status: "Blocked", activity: "2d ago" },
];

function Page() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [q, setQ] = useState("");
  const [toDelete, setToDelete] = useState<User | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || u.role.toLowerCase().includes(term));
  }, [users, q]);

  const setRole = (id: string, role: Role) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    toast.success(`Role updated to ${role}`);
  };
  const toggleBlock = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === "Blocked" ? "Active" : "Blocked" } : u)),
    );
    const u = users.find((x) => x.id === id);
    toast.success(u?.status === "Blocked" ? "User unblocked" : "User blocked");
  };
  const confirmDelete = () => {
    if (!toDelete) return;
    setUsers((prev) => prev.filter((u) => u.id !== toDelete.id));
    toast.success(`${toDelete.name} deleted`);
    setToDelete(null);
  };

  return (
    <>
      <DashboardTopbar title="Users" />
      <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email, or role…" className="input-field pl-9" />
          </div>
          <button className="bg-brand text-white text-sm px-4 py-2 rounded-lg font-medium hover:opacity-90 inline-flex items-center gap-1.5">
            <UserPlus className="size-4" /> Invite user
          </button>
        </div>
        <div className="rounded-xl bg-card ring-1 ring-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Last active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
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
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => setRole(u.id, e.target.value as Role)}
                      className="input-field h-8 py-0 text-xs"
                    >
                      <option>Admin</option>
                      <option>Analyst</option>
                      <option>Viewer</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded ${u.status === "Active" ? "bg-success/10 text-success" : u.status === "Invited" ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"}`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.activity}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => toggleBlock(u.id)}
                        className={`text-xs px-2 py-1 rounded ring-1 inline-flex items-center gap-1 ${u.status === "Blocked" ? "ring-success/40 text-success hover:bg-success/10" : "ring-border hover:bg-muted"}`}
                        aria-label={u.status === "Blocked" ? "Unblock" : "Block"}
                      >
                        {u.status === "Blocked" ? <><Check className="size-3" /> Unblock</> : <><Ban className="size-3" /> Block</>}
                      </button>
                      <button
                        onClick={() => setToDelete(u)}
                        className="text-xs px-2 py-1 rounded ring-1 ring-border hover:bg-danger/10 hover:text-danger inline-flex items-center gap-1"
                        aria-label="Delete"
                      >
                        <Trash2 className="size-3" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No users match "{q}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {toDelete?.name}?</DialogTitle>
            <DialogDescription>
              This permanently removes <span className="font-medium">{toDelete?.email}</span> and revokes all access. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button onClick={() => setToDelete(null)} className="ring-1 ring-border px-4 py-2 rounded-lg text-sm hover:bg-muted">Cancel</button>
            <button onClick={confirmDelete} className="bg-danger text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">Delete user</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}