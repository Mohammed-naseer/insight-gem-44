import { createFileRoute } from "@tanstack/react-router";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Sparkles, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/analysis")({
  component: Page,
});

type FormData = { text: string; product: string; category: string };

type Result = {
  sentiment: "positive" | "neutral" | "negative";
  confidence: number;
  emotion: string;
  aspects: { name: string; sentiment: "positive" | "neutral" | "negative"; score: number }[];
  keywords: string[];
  summary: string;
  recommendation: string;
};

function Page() {
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: { text: "The new titanium chassis feels incredible, but the software still hangs when uploading 4K timelines. Support was fast but the issue persists.", product: "Enterprise Plan", category: "SaaS" },
  });
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (_: FormData) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setResult({
      sentiment: "positive",
      confidence: 0.87,
      emotion: "Trust · Frustration",
      aspects: [
        { name: "Build quality", sentiment: "positive", score: 0.94 },
        { name: "Performance", sentiment: "negative", score: 0.72 },
        { name: "Support", sentiment: "neutral", score: 0.61 },
      ],
      keywords: ["titanium", "chassis", "4K", "upload", "support"],
      summary: "Overall positive with a targeted performance regression during 4K uploads. Customer remains loyal but at churn risk if patch not shipped in v2.1.",
      recommendation: "Prioritize a v2.1 hotfix for the 4K upload pipeline and follow up with the customer within 48 hours.",
    });
    setLoading(false);
    toast.success("Analysis complete");
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
          <label className="flex items-center gap-3 rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground cursor-pointer hover:bg-muted/40">
            <Upload className="size-4" /> Upload CSV or Excel <span className="text-xs">(drag & drop)</span>
            <input type="file" className="sr-only" />
          </label>
          <div className="flex gap-2">
            <button disabled={loading} className="flex-1 bg-brand text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2">
              <Sparkles className="size-4" /> {loading ? "Analyzing…" : "Analyze"}
            </button>
            <button type="button" onClick={() => { reset(); setResult(null); }} className="ring-1 ring-border px-4 rounded-lg text-sm hover:bg-muted flex items-center gap-2">
              <RotateCcw className="size-4" /> Reset
            </button>
          </div>
        </form>

        <div className="lg:col-span-3 space-y-4">
          {!result && !loading && (
            <div className="p-12 rounded-xl bg-card ring-1 ring-border text-center text-muted-foreground">
              <Sparkles className="size-8 mx-auto text-brand/70 mb-3" />
              <p className="font-medium text-foreground">Ready when you are</p>
              <p className="text-sm mt-1">Enter or upload a review and hit Analyze to see AI predictions.</p>
            </div>
          )}
          {loading && (
            <div className="space-y-3">
              {[0,1,2].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
            </div>
          )}
          {result && (
            <>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-xl bg-card ring-1 ring-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Sentiment</div>
                    <div className="text-3xl font-semibold text-success mt-1 capitalize">{result.sentiment}</div>
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
        </div>
      </div>
    </>
  );
}