import { createFileRoute } from "@tanstack/react-router";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { FileText, Download, Printer, Sparkles, FileType } from "lucide-react";
import { downloadCSV, downloadPDF, printReport, type ExportRow } from "@/lib/exports";
import { pushActivity } from "@/lib/activity-store";
import { sentimentTrend, aspectAnalysis, products } from "@/lib/mock-data";
import { toast } from "sonner";

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
  const handleExport = (report: Report, format: "pdf" | "csv" | "print") => {
    const { rows, summary } = buildRows(report.kind);
    const base = `${slug(report.name)}`;
    if (format === "pdf") {
      downloadPDF(`${base}.pdf`, `${report.name}`, rows, summary);
      pushActivity({ kind: "export", title: `${report.name} exported`, detail: "PDF" });
      toast.success("PDF downloaded");
    } else if (format === "csv") {
      downloadCSV(`${base}.csv`, rows);
      pushActivity({ kind: "export", title: `${report.name} exported`, detail: "CSV" });
      toast.success("CSV downloaded");
    } else {
      printReport(report.name, rows, summary);
      pushActivity({ kind: "export", title: `${report.name} sent to printer` });
    }
  };

  const generate = (kind: ReportKind, label: string) => {
    const { rows, summary, title } = buildRows(kind);
    downloadPDF(`${slug(label)}-${Date.now()}.pdf`, title, rows, summary);
    pushActivity({ kind: "export", title: `${label} report generated`, detail: "PDF" });
    toast.success(`${label} report generated`);
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
              <button onClick={() => generate(c.kind, c.t)} className="mt-4 bg-brand text-white text-sm px-3 py-1.5 rounded-lg font-medium hover:opacity-90 flex items-center gap-1.5">
                <Sparkles className="size-3.5" /> Generate PDF
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