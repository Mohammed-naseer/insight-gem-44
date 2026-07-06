import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Command } from "cmdk";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Boxes, MessageSquare, Tag, Search } from "lucide-react";
import { products, recentReviews } from "@/lib/mock-data";

const categories = [
  { id: "c-saas", name: "SaaS" },
  { id: "c-retail", name: "Retail" },
  { id: "c-fintech", name: "Fintech" },
  { id: "c-hardware", name: "Hardware" },
  { id: "c-support", name: "Customer Support" },
];

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

export function GlobalSearch({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const items = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filter = <T extends { name?: string; text?: string; author?: string; product?: string }>(arr: T[]) =>
      term
        ? arr.filter((x) =>
            [x.name, x.text, x.author, x.product].filter(Boolean).some((v) => v!.toLowerCase().includes(term)),
          )
        : arr;
    return {
      reviews: filter(recentReviews).slice(0, 6),
      products: filter(products).slice(0, 6),
      categories: term ? categories.filter((c) => c.name.toLowerCase().includes(term)) : categories,
    };
  }, [q]);

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };

  const empty = !items.reviews.length && !items.products.length && !items.categories.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl overflow-hidden gap-0">
        <DialogTitle className="sr-only">Global search</DialogTitle>
        <Command shouldFilter={false} className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-muted-foreground">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Search className="size-4 text-muted-foreground" />
            <Command.Input
              value={q}
              onValueChange={setQ}
              placeholder="Search reviews, products, categories…"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              autoFocus
            />
            <kbd className="hidden md:inline-flex text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">ESC</kbd>
          </div>
          <Command.List className="max-h-96 overflow-y-auto p-2">
            {empty && <div className="p-8 text-center text-sm text-muted-foreground">No results for "{q}"</div>}
            {items.reviews.length > 0 && (
              <Command.Group heading="Reviews">
                {items.reviews.map((r) => (
                  <Command.Item key={r.id} value={r.id} onSelect={() => go("/dashboard/analysis")} className="flex items-start gap-3 px-3 py-2 rounded-md cursor-pointer data-[selected=true]:bg-muted">
                    <MessageSquare className="size-4 mt-0.5 text-brand" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{r.author} · {r.product}</div>
                      <div className="text-xs text-muted-foreground truncate">{r.text}</div>
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${r.sentiment === "positive" ? "bg-success/10 text-success" : r.sentiment === "negative" ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"}`}>{r.sentiment}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            {items.products.length > 0 && (
              <Command.Group heading="Products">
                {items.products.map((p) => (
                  <Command.Item key={p.id} value={p.id} onSelect={() => go("/dashboard/products")} className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer data-[selected=true]:bg-muted">
                    <Boxes className="size-4 text-accent-cyan" />
                    <div className="flex-1 text-sm font-medium">{p.name}</div>
                    <div className="text-xs font-mono text-muted-foreground">{p.rating.toFixed(1)} · {p.reviews.toLocaleString()} reviews</div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            {items.categories.length > 0 && (
              <Command.Group heading="Categories">
                {items.categories.map((c) => (
                  <Command.Item key={c.id} value={c.id} onSelect={() => go("/dashboard/analytics")} className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer data-[selected=true]:bg-muted">
                    <Tag className="size-4 text-muted-foreground" />
                    <div className="text-sm">{c.name}</div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}