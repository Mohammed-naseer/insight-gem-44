import { Search, Bell, Sun, Moon, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { GlobalSearch } from "@/components/dashboard/global-search";
import { ROLES, setRole, useRole, type Role } from "@/lib/rbac";
import { pushActivity } from "@/lib/activity-store";
import { useAuth } from "@/lib/auth-store";

export function DashboardTopbar({ title }: { title: string }) {
  const [dark, setDark] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const role = useRole();
  const { user } = useAuth();
  
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
      <div className="h-full px-6 flex items-center gap-4">
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 h-9 pl-2 pr-1 rounded-lg ring-1 ring-border bg-background text-xs">
            <ShieldCheck className="size-3.5 text-brand" />
            <span className="text-muted-foreground">Role</span>
            <select
              value={role}
              onChange={(e) => {
                const next = e.target.value as Role;
                setRole(next);
                pushActivity({ kind: "admin", title: `Session role switched to ${next}` });
              }}
              className="bg-transparent outline-none font-medium pr-1"
              aria-label="Switch active role"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 h-9 w-80 px-3 rounded-lg ring-1 ring-border bg-background hover:bg-muted/50 text-left text-sm text-muted-foreground transition-colors"
          >
            <Search className="size-4" />
            <span className="flex-1">Search reviews, products, categories…</span>
            <kbd className="text-[10px] font-mono border border-border rounded px-1.5 py-0.5">⌘K</kbd>
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden size-9 grid place-items-center rounded-lg hover:bg-muted"
            aria-label="Search"
          >
            <Search className="size-4" />
          </button>
          <button onClick={() => setDark((d) => !d)} className="size-9 grid place-items-center rounded-lg hover:bg-muted transition-colors" aria-label="Toggle theme">
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button className="size-9 grid place-items-center rounded-lg hover:bg-muted transition-colors relative" aria-label="Notifications">
            <Bell className="size-4" />
            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-danger" />
          </button>
          <div className="size-9 rounded-full bg-gradient-to-br from-brand to-accent-cyan grid place-items-center text-white text-xs font-semibold" title={user?.name}>
            {initials}
          </div>
        </div>
      </div>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}