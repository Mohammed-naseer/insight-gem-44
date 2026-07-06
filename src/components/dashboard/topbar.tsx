import { Search, Bell, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { GlobalSearch } from "@/components/dashboard/global-search";

export function DashboardTopbar({ title }: { title: string }) {
  const [dark, setDark] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
      <div className="h-full px-6 flex items-center gap-4">
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
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
          <div className="size-9 rounded-full bg-gradient-to-br from-brand to-accent-cyan grid place-items-center text-white text-xs font-semibold">SJ</div>
        </div>
      </div>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}