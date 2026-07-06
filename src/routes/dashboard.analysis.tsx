import { createFileRoute } from "@tanstack/react-router";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Sparkles, RotateCcw, Download, FileSpreadsheet, X } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { pushActivity } from "@/lib/activity-store";
import { downloadCSV, downloadPDF } from "@/lib/exports";

export const Route = createFileRoute("/dashboard/analysis")({
  component: Page,
});

type FormData = { text: string; product: string; category: string };

type Sentiment = "positive" | "neutral" | "negative";
type Result = {
  sentiment: Sentiment;
  confidence: number;
  emotion: string;
  aspects: { name: string; sentiment: Sentiment; score: number }[];
  keywords: string[];
  summary: string;
  recommendation: string;
};
type BatchRow = { text: string; sentiment: Sentiment; confidence: number; emotion: string; keywords: string };

const POS_WORDS = ["love", "great", "excellent", "amazing", "fast", "perfect", "incredible", "fantastic", "smooth", "reliable", "best"];
const NEG_WORDS = ["bad", "slow", "hang", "hangs", "broken", "terrible", "awful", "worst", "buggy", "crash", "fail", "failed", "issue"];
const STOP = new Set(["the","a","and","or","but","is","was","of","to","in","on","for","with","it","this","that","i","we","our","my","be","are","as","at","an","not"]);

function analyze(text: string): Result {
  const words = text.toLowerCase().split(/\W+/).filter(Boolean);
  let pos = 0, neg = 0;
  words.forEach((w) => {
    if (POS_WORDS.includes(w)) pos++;
    if (NEG_WORDS.includes(w)) neg++;
  });
  let sentiment: Sentiment = "neutral";
  if (pos > neg) sentiment = "positive";
  else if (neg > pos) sentiment = "negative";
  const total = pos + neg;
  const confidence = total === 0 ? 0.55 + Math.random() * 0.15 : Math.min(0.99, 0.6 + Math.abs(pos - neg) / (total + 1) * 0.4);
  const emotion = sentiment === "positive" ? (pos > 2 ? "Delight · Trust" : "Trust") : sentiment === "negative" ? (neg > 2 ? "Frustration · Anger" : "Frustration") : "Neutral";
  const keywords = Array.from(new Set(words.filter((w) => w.length > 4 && !STOP.has(w)))).slice(0, 6);
  const aspectSeed: [string, Sentiment][] = [
    ["Quality", sentiment],
    ["Performance", neg > 0 ? "negative" : "positive"],
    ["Support", sentiment === "negative" ? "neutral" : "positive"],
  ];
  const aspects = aspectSeed.map(([name, s]) => ({ name, sentiment: s, score: 0.55 + Math.random() * 0.4 }));
  const summary = sentiment === "positive"
    ? "Customer expresses satisfaction with core value. Loyalty signals are strong; expansion opportunity."
    : sentiment === "negative"
      ? "Customer reports a specific pain point. Elevated churn risk — remediation recommended within 48h."
      : "Mixed signals detected. Follow up to clarify use case and monitor next interaction.";
  const recommendation = sentiment === "negative"
    ? "Route to support with high priority and issue a proactive apology + credit."
    : sentiment === "positive"
      ? "Invite to case-study program and cross-sell adjacent products."
      : "Add to nurture sequence and schedule a check-in.";
  return { sentiment, confidence, emotion, aspects, keywords, summary, recommendation };
}

function Page() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset, setValue } = useForm<FormData>({
    defaultValues: { text: "The new titanium chassis feels incredible, but the software still hangs when uploading 4K timelines. Support was fast but the issue persists.", product: "Enterprise Plan", category: "SaaS" },
  });
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [batch, setBatch] = useState<BatchRow[] | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [uploadName, setUploadName] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const r = analyze(data.text);
    setResult(r);
    setLoading(false);
    pushActivity({ kind: "analysis", title: "Single review analyzed", detail: `${data.product} · ${r.sentiment}` });
    toast.success("Analysis complete");
  };

  const onFile = async (file: File) => {
    setBatchLoading(true);
    setUploadName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      const textCol = rows.length ? Object.keys(rows[0]).find((k) => /text|review|comment|message/i.test(k)) ?? Object.keys(rows[0])[0] : null;
      if (!textCol) throw new Error("Could not detect a text column");
      await new Promise((r) => setTimeout(r, 500));
      const analyzed: BatchRow[] = rows.slice(0, 500).map((row) => {
        const text = String(row[textCol] ?? "");
        const a = analyze(text);
        return { text, sentiment: a.sentiment, confidence: Number(a.confidence.toFixed(2)), emotion: a.emotion, keywords: a.keywords.join(", ") };
      });
      setBatch(analyzed);
      pushActivity({ kind: "upload", title: `${file.name} uploaded`, detail: `${analyzed.length} rows` });
      pushActivity({ kind: "analysis", title: "Batch analysis completed", detail: `${analyzed.length} reviews` });
      toast.success(`Analyzed ${analyzed.length} reviews`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to parse file";
      toast.error(msg);
      setBatch(null);
      setUploadName(null);
    } finally {
      setBatchLoading(false);
    }
  };

  const exportBatchCSV = () => {
    if (!batch) return;
    downloadCSV("analysis-results.csv", batch);
    pushActivity({ kind: "export", title: "Batch analysis exported", detail: "CSV" });
    toast.success("CSV downloaded");
  };
  const exportBatchPDF = () => {
    if (!batch) return;
    const summary = `Analyzed ${batch.length} reviews. Positive: ${batch.filter((b) => b.sentiment === "positive").length}, Neutral: ${batch.filter((b) => b.sentiment === "neutral").length}, Negative: ${batch.filter((b) => b.sentiment === "negative").length}.`;
    downloadPDF("analysis-results.pdf", "Review Analysis — Batch Results", batch.slice(0, 60).map((b) => ({ text: b.text.slice(0, 60), sentiment: b.sentiment, confidence: b.confidence, emotion: b.emotion })), summary);
    pushActivity({ kind: "export", title: "Batch analysis exported", detail: "PDF" });
    toast.success("PDF downloaded");
  };

  return (
    <>
      <DashboardTopbar title="Review Analysis" />
      <div className="p-6 grid gap-6 lg:grid-cols-5 max-w-[1600px] w-full mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 p-6 rounded-xl bg-card ring-1 ring-border space-y-4 h-fit">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Review text</label>
            <textarea {...register("text", { required: true })} rows={8} className="input-field mt-1.5 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Product</label>
              <select {...register("product")} className="input-field mt-1.5">
                <option>Enterprise Plan</option><option>Analytics Pro</option><option>Reviews API</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <select {...register("category")} className="input-field mt-1.5">
                <option>SaaS</option><option>Retail</option><option>Fintech</option>
              </select>
            </div>
          </div>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) onFile(f);
            }}
            className="rounded-lg border border-dashed border-border px-4 py-5 text-sm"
          >
            <label className="flex items-center gap-3 text-muted-foreground cursor-pointer">
              <Upload className="size-4" />
              <span className="flex-1">{uploadName ?? "Upload CSV or Excel (drag & drop)"}</span>
              <span className="text-xs">.csv · .xlsx</span>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFile(f);
                }}
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button disabled={loading} className="flex-1 bg-brand text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2">
              <Sparkles className="size-4" /> {loading ? "Analyzing…" : "Analyze"}
            </button>
            <button type="button" onClick={() => { reset(); setResult(null); setBatch(null); setUploadName(null); if (fileRef.current) fileRef.current.value = ""; }} className="ring-1 ring-border px-4 rounded-lg text-sm hover:bg-muted flex items-center gap-2">
              <RotateCcw className="size-4" /> Reset
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">Tip: files with a <span className="font-mono">text</span> or <span className="font-mono">review</span> column are auto-detected.</p>
          {batch && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <button type="button" onClick={() => { setBatch(null); setUploadName(null); if (fileRef.current) fileRef.current.value = ""; }} className="inline-flex items-center gap-1 hover:text-foreground">
                <X className="size-3" /> Clear batch
              </button>
            </div>
          )}
        </form>

        <div className="lg:col-span-3 space-y-4">
          {!result && !loading && !batch && !batchLoading && (
            <div className="p-12 rounded-xl bg-card ring-1 ring-border text-center text-muted-foreground">
              <Sparkles className="size-8 mx-auto text-brand/70 mb-3" />
              <p className="font-medium text-foreground">Ready when you are</p>
              <p className="text-sm mt-1">Enter or upload a review and hit Analyze to see AI predictions.</p>
            </div>
          )}
          {(loading || batchLoading) && (
            <div className="space-y-3">
              {[0,1,2].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
            </div>
          )}
          {result && !batch && (
            <>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-xl bg-card ring-1 ring-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Sentiment</div>
                    <div className={`text-3xl font-semibold mt-1 capitalize ${result.sentiment === "positive" ? "text-success" : result.sentiment === "negative" ? "text-danger" : "text-warning"}`}>{result.sentiment}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Confidence</div>
                    <div className="text-3xl font-semibold mt-1 font-mono">{(result.confidence * 100).toFixed(1)}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Emotion</div>
                    <div className="text-lg font-semibold mt-1">{result.emotion}</div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="p-6 rounded-xl bg-card ring-1 ring-border">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Aspect analysis</div>
                <div className="space-y-3">
                  {result.aspects.map((a) => (
                    <div key={a.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{a.name}</span>
                        <span className="font-mono text-muted-foreground">{(a.score * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${a.sentiment === "positive" ? "bg-success" : a.sentiment === "negative" ? "bg-danger" : "bg-warning"}`} style={{ width: `${a.score * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-xl bg-card ring-1 ring-border">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Keywords</div>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((k) => (
                    <span key={k} className="px-2.5 py-1 rounded-md bg-muted text-xs font-mono">{k}</span>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="p-6 rounded-xl bg-gradient-to-br from-brand/5 to-accent-cyan/5 ring-1 ring-brand/20">
                <div className="text-xs uppercase tracking-widest text-brand mb-2">AI summary</div>
                <p className="text-sm leading-relaxed">{result.summary}</p>
                <div className="text-xs uppercase tracking-widest text-brand mt-4 mb-2">Recommendation</div>
                <p className="text-sm leading-relaxed">{result.recommendation}</p>
              </motion.div>
            </>
          )}
          {batch && !batchLoading && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {(["positive","neutral","negative"] as Sentiment[]).map((s) => {
                  const count = batch.filter((b) => b.sentiment === s).length;
                  const pct = ((count / batch.length) * 100).toFixed(1);
                  return (
                    <div key={s} className="p-4 rounded-xl bg-card ring-1 ring-border">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground capitalize">{s}</div>
                      <div className={`text-2xl font-semibold mt-1 ${s === "positive" ? "text-success" : s === "negative" ? "text-danger" : "text-warning"}`}>{count}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">{pct}%</div>
                    </div>
                  );
                })}
              </div>
              <div className="p-6 rounded-xl bg-card ring-1 ring-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="size-4 text-brand" />
                    <h3 className="font-semibold tracking-tight">Batch results</h3>
                    <span className="text-xs text-muted-foreground">{batch.length} rows</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={exportBatchCSV} className="text-xs ring-1 ring-border px-2.5 py-1.5 rounded-lg hover:bg-muted inline-flex items-center gap-1.5"><Download className="size-3.5" /> CSV</button>
                    <button onClick={exportBatchPDF} className="text-xs ring-1 ring-border px-2.5 py-1.5 rounded-lg hover:bg-muted inline-flex items-center gap-1.5"><Download className="size-3.5" /> PDF</button>
                  </div>
                </div>
                <div className="max-h-96 overflow-auto">
                  <table className="w-full text-xs">
                    <thead className="text-[10px] uppercase tracking-widest text-muted-foreground sticky top-0 bg-card">
                      <tr><th className="text-left py-2">Review</th><th className="text-left py-2">Sentiment</th><th className="text-left py-2">Confidence</th><th className="text-left py-2">Emotion</th></tr>
                    </thead>
                    <tbody>
                      {batch.slice(0, 100).map((b, i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="py-2 pr-3 max-w-md truncate text-muted-foreground">{b.text}</td>
                          <td className="py-2 pr-3"><span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${b.sentiment === "positive" ? "bg-success/10 text-success" : b.sentiment === "negative" ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"}`}>{b.sentiment}</span></td>
                          <td className="py-2 pr-3 font-mono">{(b.confidence * 100).toFixed(0)}%</td>
                          <td className="py-2 pr-3 text-muted-foreground">{b.emotion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {batch.length > 100 && <div className="text-[11px] text-muted-foreground text-center py-2">Showing first 100 of {batch.length}. Export to see all.</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}