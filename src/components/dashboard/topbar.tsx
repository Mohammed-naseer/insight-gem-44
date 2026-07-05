import { Search, Bell, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function DashboardTopbar({ title }: { title: string }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
      <div className="h-full px-6 flex items-center gap-4">
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Search reviews, products, aspects…" className="input-field pl-9 w-80" />
          </div>
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
    </header>
  );
}