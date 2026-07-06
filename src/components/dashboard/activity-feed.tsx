import { useEffect, useState } from "react";
import { Upload, Sparkles, Download, Bell, User, Settings2, Activity as ActivityIcon } from "lucide-react";
import { useActivity, relativeTime, type ActivityKind } from "@/lib/activity-store";

const iconFor: Record<ActivityKind, typeof Upload> = {
  upload: Upload,
  analysis: Sparkles,
  export: Download,
  alert: Bell,
  user: User,
  system: Settings2,
};

const colorFor: Record<ActivityKind, string> = {
  upload: "text-accent-cyan bg-accent-cyan/10",
  analysis: "text-brand bg-brand/10",
  export: "text-success bg-success/10",
  alert: "text-danger bg-danger/10",
  user: "text-warning bg-warning/10",
  system: "text-muted-foreground bg-muted",
};

export function ActivityFeed({ limit }: { limit?: number }) {
  const items = useActivity();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <ol className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <li key={i} className="flex gap-3">
            <div className="size-8 rounded-lg bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 rounded bg-muted animate-pulse w-3/4" />
              <div className="h-2.5 rounded bg-muted animate-pulse w-1/3" />
            </div>
          </li>
        ))}
      </ol>
    );
  }

  const shown = limit ? items.slice(0, limit) : items;

  if (!shown.length) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        <ActivityIcon className="size-8 mx-auto mb-2 text-muted-foreground/40" />
        <p className="font-medium text-foreground">No recent activity</p>
        <p className="text-xs mt-1">Uploads, analyses, and exports will appear here.</p>
      </div>
    );
  }

  return (
    <ol className="relative">
      {shown.map((a, i) => {
        const Icon = iconFor[a.kind];
        return (
          <li key={a.id} className="flex gap-3 pb-4 relative">
            {i < shown.length - 1 && <span className="absolute left-4 top-8 bottom-0 w-px bg-border" />}
            <div className={`size-8 rounded-lg grid place-items-center shrink-0 ${colorFor[a.kind]}`}>
              <Icon className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{a.title}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="capitalize">{a.kind}</span>
                {a.detail && <><span>·</span><span>{a.detail}</span></>}
                <span>·</span>
                <span className="font-mono">{relativeTime(a.at)}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}