import { createFileRoute } from "@tanstack/react-router";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Sparkles, RotateCcw, Download, FileSpreadsheet, X, Loader2, CheckCircle2, AlertTriangle, Brain } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { pushActivity } from "@/lib/activity-store";
import { downloadCSV, downloadPDF } from "@/lib/exports";
import { api } from "@/lib/api";

export const Route = createFileRoute("/dashboard/analysis")({
  component: Page,
});

type FormData = { text: string; product: string; category: string };
type Sentiment = "Positive" | "Neutral" | "Negative";

interface ModelResult {
  sentiment: Sentiment;
  confidence: number;
  emotion: string;
  summary: string;
}

interface AnalysisResult {
  id: string;
  text: string;
  models: {
    gemini: ModelResult;
    groq: ModelResult;
    huggingface: ModelResult;
  };
  finalResult: {
    sentiment: Sentiment;
    agreementPercentage: number;
    mostConfidentModel: string;
  };
}

interface ApiResponse {
  success: boolean;
  data: AnalysisResult;
}

type BatchRow = { text: string; sentiment: string; confidence: number; emotion: string; keywords: string };

const MODEL_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  gemini:      { label: "Google Gemini", color: "#4f46e5", icon: "✦" },
  groq:        { label: "Groq (Llama)",  color: "#06b6d4", icon: "⚡" },
  huggingface: { label: "HuggingFace",   color: "#f59e0b", icon: "🤗" },
};

const SENTIMENT_STYLE: Record<string, string> = {
  Positive: "bg-success/10 text-success border-success/20",
  Negative: "bg-danger/10 text-danger border-danger/20",
  Neutral:  "bg-warning/10 text-warning border-warning/20",
};

function Page() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      text: "The new titanium chassis feels incredible, but the software still hangs when uploading 4K timelines. Support was fast but the issue persists.",
      product: "Enterprise Plan",
      category: "SaaS",
    },
  });

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [batch, setBatch] = useState<BatchRow[] | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [uploadName, setUploadName] = useState<string | null>(null);

  // ── Single analysis via real backend ──────────────────────────────────────
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post<ApiResponse>("/api/sentiment/analyze", { text: data.text });
      if (res.success) {
        setResult(res.data);
        pushActivity({
          kind: "analysis",
          title: "Multi-model analysis complete",
          detail: `${data.product} · ${res.data.finalResult.sentiment} · ${res.data.finalResult.agreementPercentage}% agreement`,
        });
        toast.success("Analysis complete — all 3 AI models responded!");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Batch analysis (local XLSX parsing + per-row API call) ────────────────
  const runOnBuffer = async (fileName: string, _size: number, buf: ArrayBuffer) => {
    setBatchLoading(true);
    try {
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      const textCol = rows.length
        ? Object.keys(rows[0]).find((k) => /text|review|comment|message/i.test(k)) ?? Object.keys(rows[0])[0]
        : null;
      if (!textCol) throw new Error("Could not detect a text column");

      const analyzed: BatchRow[] = [];
      const slice = rows.slice(0, 50); // cap at 50 for speed
      for (const row of slice) {
        const text = String(row[textCol] ?? "");
        if (!text.trim()) continue;
        try {
          const res = await api.post<ApiResponse>("/api/sentiment/analyze", { text });
          analyzed.push({
            text,
            sentiment: res.data.finalResult.sentiment,
            confidence: res.data.models.gemini.confidence,
            emotion: res.data.models.gemini.emotion,
            keywords: "",
          });
        } catch {
          analyzed.push({ text, sentiment: "Neutral", confidence: 50, emotion: "Unknown", keywords: "" });
        }
      }
      setBatch(analyzed);
      pushActivity({ kind: "upload", title: `${fileName} batch complete`, detail: `${analyzed.length} rows analyzed` });
      toast.success(`Analyzed ${analyzed.length} reviews`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to parse file");
      setBatch(null);
      setUploadName(null);
    } finally {
      setBatchLoading(false);
    }
  };

  const onFile = async (file: File) => {
    setUploadName(file.name);
    const buf = await file.arrayBuffer();
    await runOnBuffer(file.name, file.size, buf);
  };

  return (
    <>
      <DashboardTopbar title="AI Analysis" />
      <div className="p-6 space-y-6 max-w-[1400px] w-full mx-auto">

        {/* ── Input form ─────────────────────────────────────────────── */}
        <div className="p-6 rounded-xl bg-card ring-1 ring-border space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="size-5 text-brand" />
            <h3 className="font-semibold tracking-tight">Multi-Model Sentiment Analysis</h3>
            <span className="text-[10px] uppercase tracking-widest bg-brand/10 text-brand px-2 py-0.5 rounded-full font-semibold ml-auto">
              Gemini + Groq + HuggingFace
            </span>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <textarea
              rows={4}
              {...register("text", { required: true })}
              className="input-field resize-none text-sm"
              placeholder="Enter customer review or any text to analyse…"
            />
            <div className="flex gap-3 flex-wrap">
              <input {...register("product")} className="input-field flex-1 min-w-40 text-sm" placeholder="Product / Plan" />
              <input {...register("category")} className="input-field w-36 text-sm" placeholder="Category" />
              <button
                disabled={loading}
                className="bg-brand text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-60 flex items-center gap-2 shrink-0"
              >
                {loading ? <><Loader2 className="size-4 animate-spin" /> Analysing…</> : <><Sparkles className="size-4" /> Analyse</>}
              </button>
              <button type="button" onClick={() => { reset(); setResult(null); }} className="ring-1 ring-border px-3 py-2 rounded-lg text-sm hover:bg-muted">
                <RotateCcw className="size-4" />
              </button>
            </div>
          </form>
        </div>

        {/* ── Loading skeleton ────────────────────────────────────────── */}
        {loading && (
          <div className="grid gap-4 md:grid-cols-3">
            {["Gemini", "Groq", "HuggingFace"].map((m) => (
              <div key={m} className="p-5 rounded-xl bg-card ring-1 ring-border animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-5/6" />
              </div>
            ))}
          </div>
        )}

        {/* ── Results: 3 model cards ──────────────────────────────────── */}
        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Model cards */}
            <div className="grid gap-4 md:grid-cols-3">
              {(["gemini", "groq", "huggingface"] as const).map((key, i) => {
                const m = result.models[key];
                const meta = MODEL_LABELS[key];
                const isBest = result.finalResult.mostConfidentModel.toLowerCase().includes(key) ||
                  result.finalResult.mostConfidentModel.toLowerCase() === key;
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className={`p-5 rounded-xl bg-card ring-1 ${isBest ? "ring-brand shadow-lg shadow-brand/10" : "ring-border"} space-y-3`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {meta.icon} {meta.label}
                      </span>
                      {isBest && (
                        <span className="text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded-full font-semibold">
                          Most Confident
                        </span>
                      )}
                    </div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold ${SENTIMENT_STYLE[m.sentiment]}`}>
                      {m.sentiment === "Positive" ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
                      {m.sentiment}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Confidence</span>
                        <span className="font-mono font-semibold">{m.confidence}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${m.confidence}%`, background: meta.color }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{m.emotion} · {m.summary}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Final verdict */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className="p-6 rounded-xl bg-gradient-to-br from-brand/5 to-accent-cyan/5 ring-1 ring-brand/20"
            >
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Final Verdict</p>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-lg font-bold ${SENTIMENT_STYLE[result.finalResult.sentiment]}`}>
                    {result.finalResult.sentiment === "Positive" ? "😊" : result.finalResult.sentiment === "Negative" ? "😞" : "😐"}
                    {result.finalResult.sentiment}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Model agreement</p>
                  <div className="text-3xl font-bold tabular-nums text-brand">{result.finalResult.agreementPercentage}%</div>
                  <p className="text-xs text-muted-foreground mt-0.5">Best: {result.finalResult.mostConfidentModel}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => downloadCSV([{ text: result.text, ...result.finalResult }], "analysis")}
                  className="ring-1 ring-border px-3 py-1.5 rounded-lg text-xs hover:bg-muted flex items-center gap-1.5"
                >
                  <Download className="size-3" /> CSV
                </button>
                <button
                  onClick={() => downloadPDF([{ text: result.text, ...result.finalResult }], "analysis")}
                  className="ring-1 ring-border px-3 py-1.5 rounded-lg text-xs hover:bg-muted flex items-center gap-1.5"
                >
                  <Download className="size-3" /> PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── Batch upload ────────────────────────────────────────────── */}
        <div className="p-6 rounded-xl bg-card ring-1 ring-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold tracking-tight">Batch Analysis</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Upload an Excel/CSV with a text column — up to 50 rows via AI</p>
            </div>
            {uploadName && (
              <button onClick={() => { setUploadName(null); setBatch(null); }} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            )}
          </div>

          {!uploadName ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-xl py-10 flex flex-col items-center gap-3 hover:border-brand/50 hover:bg-brand/5 transition-colors"
            >
              <Upload className="size-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Drop an Excel/CSV here or click to browse</span>
              <span className="text-xs text-muted-foreground/60">.xlsx, .xls, .csv — max 50 rows</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
              <FileSpreadsheet className="size-8 text-brand shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{uploadName}</p>
                {batchLoading && <p className="text-xs text-muted-foreground animate-pulse">Sending rows to AI…</p>}
              </div>
              {batchLoading && <Loader2 className="size-5 animate-spin text-brand shrink-0" />}
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }}
          />

          {batch && batch.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{batch.length} rows analyzed</p>
                <button
                  onClick={() => downloadCSV(batch, "batch-analysis")}
                  className="ring-1 ring-border px-3 py-1.5 rounded-lg text-xs hover:bg-muted flex items-center gap-1.5"
                >
                  <Download className="size-3" /> Export CSV
                </button>
              </div>
              <div className="overflow-x-auto rounded-xl ring-1 ring-border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>{["Text", "Sentiment", "Confidence", "Emotion"].map((h) => (
                      <th key={h} className="text-left px-4 py-2.5 text-muted-foreground font-medium">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {batch.slice(0, 20).map((row, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="px-4 py-2.5 max-w-[280px] truncate text-muted-foreground">{row.text}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${SENTIMENT_STYLE[row.sentiment] ?? "bg-muted"}`}>
                            {row.sentiment}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-mono">{row.confidence}%</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{row.emotion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {batch.length > 20 && (
                  <p className="text-xs text-center text-muted-foreground py-3">Showing 20 of {batch.length} rows. Export CSV for full data.</p>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
}