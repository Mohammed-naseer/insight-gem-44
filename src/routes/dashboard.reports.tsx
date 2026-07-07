import { createFileRoute } from "@tanstack/react-router";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { FileText, Download, Printer, Sparkles, FileType, RotateCcw, X, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { downloadCSV, downloadPDF, printReport, type ExportRow } from "@/lib/exports";
import { pushActivity } from "@/lib/activity-store";
import { sentimentTrend, aspectAnalysis, products } from "@/lib/mock-data";
import { toast } from "sonner";
import { removeJob, retryJob, runExport, useExportJobs, type ExportFormat } from "@/lib/export-jobs-store";
import { useCan } from "@/lib/rbac";

export const Route = createFileRoute("/dashboard/reports")({
  component: Page,
});

type ReportKind = "weekly" | "monthly" | "quarterly" | "adhoc";
type Report = { id: string; name: string; type: string; kind: ReportKind; date: string; size: string };

const reports: Report[] = [
  { id: "r1", name: "Q4 Executive Summary", type: "Quarterly", kind: "quarterly", date: "Dec 30", size: "2.4 MB" },
  { id: "r2", name: "November Sentiment Digest", type: "Monthly", kind: "monthly", date: "Nov 30", size: "1.8 MB" },
  { id: "r3", name: "Week 48 Aspect Report", type: "Weekly", kind: "weekly", date: "Nov 26", size: "820 KB" },
  { id: "r4", name: "October Executive Summary", type: "Monthly", kind: "monthly", date: "Oct 31", size: "1.6 MB" },
  { id: "r5", name: "Product Comparison — Enterprise vs Pro", type: "Ad hoc", kind: "adhoc", date: "Oct 22", size: "1.2 MB" },
];

function buildRows(kind: ReportKind): { rows: ExportRow[]; summary: string; title: string } {
  if (kind === "weekly") {
    const rows: ExportRow[] = aspectAnalysis.map((a) => ({ aspect: a.aspect, positive: `${a.positive}%`, negative: `${a.negative}%` }));
    return {
      title: "Weekly Aspect Report",
      rows,
      summary: "Weekly aspect-level sentiment breakdown across product categories. Shipping shows the largest week-over-week regression.",
    };
  }
  if (kind === "quarterly") {
    const rows: ExportRow[] = sentimentTrend.map((m) => ({ month: m.month, positive: m.positive, neutral: m.neutral, negative: m.negative }));
    return {
      title: "Quarterly Executive Summary",
      rows,
      summary: "Rolling 12-month sentiment trend. Positive volume grew 133% YoY while negative volume declined 29%.",
    };
  }
  const rows: ExportRow[] = products.map((p) => ({ product: p.name, rating: p.rating, positive: `${p.positive}%`, negative: `${p.negative}%`, reviews: p.reviews }));
  return {
    title: kind === "monthly" ? "Monthly Sentiment Report" : "Ad-hoc Report",
    rows,
    summary: "Product-level breakdown of sentiment, rating, and review volume across the current cohort.",
  };
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function Page() {
  const jobs = useExportJobs();
  const canGenerate = useCan("reports:generate");

  const startExport = (name: string, format: ExportFormat, rows: ExportRow[], summary: string) => {
    const base = slug(name);
    const finalize = () => {
      if (format === "pdf") downloadPDF(`${base}.pdf`, name, rows, summary);
      else if (format === "csv") downloadCSV(`${base}.csv`, rows);
      else printReport(name, rows, summary);
      pushActivity({ kind: "export", title: `${name} exported`, detail: format.toUpperCase() });
    };
    runExport(name, format, finalize);
    toast.success(`${format.toUpperCase()} export queued`);
  };

  const handleExport = (report: Report, format: ExportFormat) => {
    const { rows, summary } = buildRows(report.kind);
    startExport(report.name, format, rows, summary);
  };

  const generate = (kind: ReportKind, label: string) => {
    if (!canGenerate) { toast.error("You don't have permission to generate reports"); return; }
    const { rows, summary, title } = buildRows(kind);
    startExport(`${label} — ${title}`, "pdf", rows, summary);
  };

  const retry = (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    // Look up the matching report to reproduce data.
    const report = reports.find((r) => job.name.includes(r.name)) ?? reports[0];
    const { rows, summary } = buildRows(report.kind);
    const base = slug(job.name);
    retryJob(id, () => {
      if (job.format === "pdf") downloadPDF(`${base}.pdf`, job.name, rows, summary);
      else if (job.format === "csv") downloadCSV(`${base}.csv`, rows);
      else printReport(job.name, rows, summary);
      pushActivity({ kind: "export", title: `${job.name} exported`, detail: `${job.format.toUpperCase()} · retry` });
    });
  };

  return (
    <>
      <DashboardTopbar title="Reports" />
      <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { t: "Weekly", d: "Auto-generated every Monday", kind: "weekly" as ReportKind },
            { t: "Monthly", d: "Executive summary + trends", kind: "monthly" as ReportKind },
            { t: "Quarterly", d: "12-month executive rollup", kind: "quarterly" as ReportKind },
          ].map((c) => (
            <div key={c.t} className="p-6 rounded-xl bg-card ring-1 ring-border">
              <div className="text-sm font-semibold">{c.t} report</div>
              <p className="text-xs text-muted-foreground mt-1">{c.d}</p>
              <button
                onClick={() => generate(c.kind, c.t)}
                disabled={!canGenerate}
                title={canGenerate ? "" : "Requires Admin or Analyst role"}
                className="mt-4 bg-brand text-white text-sm px-3 py-1.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Sparkles className="size-3.5" /> Generate PDF
              </button>
            </div>
          ))}
        </div>

        {jobs.length > 0 && (
          <div className="p-6 rounded-xl bg-card ring-1 ring-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold tracking-tight">Export jobs</h3>
              <span className="text-xs text-muted-foreground font-mono">{jobs.length} recent</span>
            </div>
            <ul className="space-y-3">
              {jobs.map((j) => (
                <li key={j.id} className="p-3 rounded-lg ring-1 ring-border bg-background">
                  <div className="flex items-center gap-3">
                    <div className={`size-8 rounded-lg grid place-items-center shrink-0 ${
                      j.status === "done" ? "bg-success/10 text-success"
                      : j.status === "failed" ? "bg-danger/10 text-danger"
                      : "bg-brand/10 text-brand"
                    }`}>
                      {j.status === "done" ? <CheckCircle2 className="size-4" />
                        : j.status === "failed" ? <AlertTriangle className="size-4" />
                        : <Loader2 className="size-4 animate-spin" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{j.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="uppercase tracking-wider text-[10px] font-mono">{j.format}</span>
                        <span>·</span>
                        <span className="capitalize">{j.status}</span>
                        {j.error && <><span>·</span><span className="text-danger">{j.error}</span></>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {j.status === "failed" && (
                        <button onClick={() => retry(j.id)} className="text-xs ring-1 ring-border px-2 py-1 rounded hover:bg-muted inline-flex items-center gap-1">
                          <RotateCcw className="size-3" /> Retry
                        </button>
                      )}
                      <button onClick={() => removeJob(j.id)} className="size-7 grid place-items-center rounded hover:bg-muted" aria-label="Dismiss">
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full transition-all ${j.status === "failed" ? "bg-danger" : j.status === "done" ? "bg-success" : "bg-brand"}`}
                      style={{ width: `${j.progress}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-6 rounded-xl bg-card ring-1 ring-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold tracking-tight">Recent reports</h3>
          </div>
          <div className="divide-y divide-border">
            {reports.map((r) => (
              <div key={r.id} className="py-3 flex items-center gap-4">
                <div className="size-9 rounded-lg bg-muted grid place-items-center"><FileText className="size-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.type} · {r.date} · {r.size}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleExport(r, "pdf")} className="text-xs ring-1 ring-border px-2.5 py-1.5 rounded-lg hover:bg-muted inline-flex items-center gap-1.5" aria-label="Download PDF"><FileType className="size-3.5" /> PDF</button>
                  <button onClick={() => handleExport(r, "csv")} className="text-xs ring-1 ring-border px-2.5 py-1.5 rounded-lg hover:bg-muted inline-flex items-center gap-1.5" aria-label="Download CSV"><Download className="size-3.5" /> CSV</button>
                  <button onClick={() => handleExport(r, "print")} className="size-8 grid place-items-center rounded-lg hover:bg-muted" aria-label="Print"><Printer className="size-4" /></button>
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