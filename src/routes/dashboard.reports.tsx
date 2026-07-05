import { createFileRoute } from "@tanstack/react-router";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { FileText, Download, Printer, Sparkles } from "lucide-react";

export const Route = createFileRoute("/dashboard/reports")({
  component: Page,
});

const reports = [
  { name: "Q4 Executive Summary", type: "Quarterly", date: "Dec 30", size: "2.4 MB" },
  { name: "November Sentiment Digest", type: "Monthly", date: "Nov 30", size: "1.8 MB" },
  { name: "Week 48 Aspect Report", type: "Weekly", date: "Nov 26", size: "820 KB" },
  { name: "October Executive Summary", type: "Monthly", date: "Oct 31", size: "1.6 MB" },
  { name: "Product Comparison — Enterprise vs Pro", type: "Ad hoc", date: "Oct 22", size: "1.2 MB" },
];

function Page() {
  return (
    <>
      <DashboardTopbar title="Reports" />
      <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { t: "Weekly", d: "Auto-generated every Monday" },
            { t: "Monthly", d: "Executive summary + trends" },
            { t: "Custom", d: "Ad hoc build & schedule" },
          ].map((c) => (
            <div key={c.t} className="p-6 rounded-xl bg-card ring-1 ring-border">
              <div className="text-sm font-semibold">{c.t} report</div>
              <p className="text-xs text-muted-foreground mt-1">{c.d}</p>
              <button className="mt-4 bg-brand text-white text-sm px-3 py-1.5 rounded-lg font-medium hover:opacity-90 flex items-center gap-1.5">
                <Sparkles className="size-3.5" /> Generate
              </button>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-xl bg-card ring-1 ring-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold tracking-tight">Recent reports</h3>
          </div>
          <div className="divide-y divide-border">
            {reports.map((r) => (
              <div key={r.name} className="py-3 flex items-center gap-4">
                <div className="size-9 rounded-lg bg-muted grid place-items-center"><FileText className="size-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.type} · {r.date} · {r.size}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="size-8 grid place-items-center rounded-lg hover:bg-muted" aria-label="Download"><Download className="size-4" /></button>
                  <button className="size-8 grid place-items-center rounded-lg hover:bg-muted" aria-label="Print"><Printer className="size-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-br from-brand/5 to-accent-cyan/5 ring-1 ring-brand/20">
          <div className="text-xs uppercase tracking-widest text-brand mb-3">AI executive summary</div>
          <p className="text-sm leading-relaxed">
            Positive sentiment climbed 3.2 points month-over-month, driven primarily by improved onboarding and integration reliability.
            The single active risk is a 6-point aspect drift in Shipping — a hotfix is recommended before the holiday peak.
          </p>
        </div>
      </div>
    </>
  );
}