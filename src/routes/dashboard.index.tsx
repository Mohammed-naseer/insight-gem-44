import { createFileRoute } from "@tanstack/react-router";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { kpis, sentimentTrend, sentimentDistribution, aspectAnalysis, recentReviews } from "@/lib/mock-data";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: Page,
});

function Page() {
  return (
    <>
      <DashboardTopbar title="Overview" />
      <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        {/* KPI strip */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {kpis.map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="p-4 rounded-xl bg-card ring-1 ring-border"
            >
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <div className="text-2xl font-semibold mt-1 tracking-tight">{k.value}</div>
              <div className={`text-[11px] mt-1 flex items-center gap-1 ${k.trend === "up" ? "text-success" : "text-danger"}`}>
                {k.trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                {k.delta}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 p-6 rounded-xl bg-card ring-1 ring-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold tracking-tight">Sentiment trendline</h3>
                <p className="text-xs text-muted-foreground">Last 12 months</p>
              </div>
              <div className="flex gap-3 text-xs">
                <Legend2 color="#4f46e5" label="Positive" />
                <Legend2 color="#06b6d4" label="Neutral" />
                <Legend2 color="#ef4444" label="Negative" />
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sentimentTrend}>
                  <defs>
                    <linearGradient id="p" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4f46e5" stopOpacity={0.4} /><stop offset="100%" stopColor="#4f46e5" stopOpacity={0} /></linearGradient>
                    <linearGradient id="n" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} /><stop offset="100%" stopColor="#06b6d4" stopOpacity={0} /></linearGradient>
                    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="100%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--color-border)" }} />
                  <Area dataKey="positive" stroke="#4f46e5" fill="url(#p)" strokeWidth={2} />
                  <Area dataKey="neutral" stroke="#06b6d4" fill="url(#n)" strokeWidth={2} />
                  <Area dataKey="negative" stroke="#ef4444" fill="url(#ng)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-card ring-1 ring-border">
            <h3 className="font-semibold tracking-tight mb-1">Sentiment distribution</h3>
            <p className="text-xs text-muted-foreground mb-4">All-time breakdown</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sentimentDistribution} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={3}>
                    {sentimentDistribution.map((e) => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-xs mt-2">
              {sentimentDistribution.map((s) => (
                <div key={s.name} className="flex justify-between items-center">
                  <span className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ background: s.color }} />{s.name}</span>
                  <span className="font-mono">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Aspect + activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 p-6 rounded-xl bg-card ring-1 ring-border">
            <h3 className="font-semibold tracking-tight mb-4">Aspect analysis</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aspectAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="aspect" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="positive" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="negative" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="p-6 rounded-xl bg-card ring-1 ring-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold tracking-tight">Activity timeline</h3>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Live</span>
            </div>
            <ActivityFeed limit={8} />
          </div>
        </div>

        {/* Recent reviews table */}
        <div className="p-6 rounded-xl bg-card ring-1 ring-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold tracking-tight">Recent reviews</h3>
            <button className="text-xs font-medium text-brand">View all</button>
          </div>
          <div className="divide-y divide-border">
            {recentReviews.map((r) => (
              <div key={r.id} className="py-3 flex items-start gap-4 text-sm">
                <div className="size-9 rounded-full bg-muted grid place-items-center text-xs font-semibold shrink-0">
                  {r.author.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{r.author}</span>
                    <span className="text-xs text-muted-foreground">· {r.product}</span>
                    <span className="text-xs text-muted-foreground">· {r.time}</span>
                  </div>
                  <p className="text-muted-foreground mt-1 line-clamp-2">"{r.text}"</p>
                </div>
                <SentimentBadge s={r.sentiment} score={r.score} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Legend2({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5 text-muted-foreground"><span className="size-2 rounded-full" style={{ background: color }} />{label}</span>;
}

function SentimentBadge({ s, score }: { s: "positive" | "neutral" | "negative"; score: number }) {
  const styles = {
    positive: "bg-success/10 text-success",
    neutral: "bg-warning/10 text-warning",
    negative: "bg-danger/10 text-danger",
  }[s];
  return (
    <div className="text-right shrink-0">
      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded ${styles}`}>{s}</span>
      <div className="text-[10px] font-mono text-muted-foreground mt-1">{score.toFixed(2)}</div>
    </div>
  );
}