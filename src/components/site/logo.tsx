import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 group">
      <div className="size-7 rounded-lg bg-gradient-to-br from-brand to-accent-cyan grid place-items-center shadow-sm shadow-brand/30">
        <Sparkles className="size-4 text-white" strokeWidth={2.5} />
      </div>
      <span className="font-semibold tracking-tight text-[15px]">Lumina AI</span>
    </Link>
  );
}