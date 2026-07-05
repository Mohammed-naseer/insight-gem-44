import { createFileRoute } from "@tanstack/react-router";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { products } from "@/lib/mock-data";
import { Star, GitCompare, Search } from "lucide-react";

export const Route = createFileRoute("/dashboard/products")({
  component: Page,
});

function Page() {
  return (
    <>
      <DashboardTopbar title="Products" />
      <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Search products…" className="input-field pl-9" />
          </div>
          <select className="input-field max-w-40"><option>All categories</option><option>SaaS</option><option>Retail</option></select>
          <select className="input-field max-w-40"><option>Sort: Reviews</option><option>Rating</option><option>Positive %</option></select>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div key={p.id} className="p-5 rounded-xl bg-card ring-1 ring-border hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="h-32 rounded-lg bg-gradient-to-br from-brand/10 via-accent-cyan/10 to-transparent mb-4 grid place-items-center text-brand/40 font-mono text-xs">
                {p.name.split(" ").map((w) => w[0]).join("")}
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold tracking-tight">{p.name}</h3>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Star className="size-3 fill-warning text-warning" /> {p.rating} · {p.reviews.toLocaleString()} reviews
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Bar label="Positive" value={p.positive} color="bg-success" />
                <Bar label="Negative" value={p.negative} color="bg-danger" />
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-brand text-white py-2 rounded-lg text-sm font-medium hover:opacity-90">View details</button>
                <button className="ring-1 ring-border px-3 rounded-lg hover:bg-muted" aria-label="Compare"><GitCompare className="size-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1"><span className="text-muted-foreground">{label}</span><span className="font-mono">{value}%</span></div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className={`h-full ${color}`} style={{ width: `${value}%` }} /></div>
    </div>
  );
}