import { createFileRoute } from "@tanstack/react-router";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { sentimentTrend, sentimentDistribution, aspectAnalysis, emotions } from "@/lib/mock-data";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Download } from "lucide-react";

export const Route = createFileRoute("/dashboard/analytics")({
  component: Page,
});

function Page() {
  return (
    <>
      <DashboardTopbar title="Analytics" />
      <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Interactive visualizations across sentiment, aspect, and product dimensions.</p>
          <div className="flex gap-2">
            {["CSV", "PDF", "Excel"].map((f) => (
              <button key={f} className="ring-1 ring-border px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-muted flex items-center gap-1.5">
                <Download className="size-3.5" /> {f}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Chart title="Monthly review growth">
            <ResponsiveContainer><AreaChart data={sentimentTrend}>
              <defs><linearGradient id="a1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4f46e5" stopOpacity={0.5}/><stop offset="100%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" /><XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} /><YAxis fontSize={11} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area dataKey="positive" stroke="#4f46e5" fill="url(#a1)" strokeWidth={2} />
            </AreaChart></ResponsiveContainer>
          </Chart>
          <Chart title="Aspect distribution">
            <ResponsiveContainer><BarChart data={aspectAnalysis} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" /><XAxis type="number" fontSize={11} tickLine={false} axisLine={false} /><YAxis dataKey="aspect" type="category" fontSize={11} tickLine={false} axisLine={false} width={80} /><Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="positive" fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart></ResponsiveContainer>
          </Chart>
          <Chart title="Sentiment trend">
            <ResponsiveContainer><LineChart data={sentimentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" /><XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} /><YAxis fontSize={11} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line dataKey="positive" stroke="#4f46e5" strokeWidth={2} dot={false} />
              <Line dataKey="negative" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart></ResponsiveContainer>
          </Chart>
          <Chart title="Emotion radar">
            <ResponsiveContainer><RadarChart data={emotions}>
              <PolarGrid stroke="rgba(0,0,0,0.1)" /><PolarAngleAxis dataKey="emotion" fontSize={11} /><PolarRadiusAxis fontSize={10} />
              <Radar dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
            </RadarChart></ResponsiveContainer>
          </Chart>
          <Chart title="Customer satisfaction">
            <ResponsiveContainer><PieChart>
              <Pie data={sentimentDistribution} dataKey="value" innerRadius={60} outerRadius={90} paddingAngle={3}>
                {sentimentDistribution.map((e) => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart></ResponsiveContainer>
          </Chart>
          <Chart title="Top keywords">
            <div className="flex flex-wrap gap-2 p-2">
              {["fast", "reliable", "expensive", "documentation", "onboarding", "support", "latency", "accurate", "aspect", "integration", "workflow", "insights", "shipping", "premium", "seamless"].map((k, i) => (
                <span key={k} className="px-3 py-1.5 rounded-full bg-muted text-sm font-medium" style={{ fontSize: `${12 + (15 - i) * 0.7}px`, opacity: 0.4 + (15 - i) * 0.04 }}>{k}</span>
              ))}
            </div>
          </Chart>
        </div>
      </div>
    </>
  );
}

function Chart({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-xl bg-card ring-1 ring-border">
      <h3 className="font-semibold tracking-tight mb-4">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
}