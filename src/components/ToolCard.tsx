import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import type { Category, Tool } from "@/lib/tools";
import { cn } from "@/lib/utils";

export const CATEGORY_TINT: Record<Category, string> = {
  video: "bg-cat-video/15 text-cat-video",
  audio: "bg-cat-audio/15 text-cat-audio",
  photo: "bg-cat-photo/15 text-cat-photo",
};

export function ToolCard({ tool, style }: { tool: Tool; style?: React.CSSProperties }) {
  const Icon = tool.icon;
  const soon = tool.status === "soon";
  const inner = (
    <>
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "grid size-11 place-items-center rounded-xl transition-transform group-hover:scale-105",
            soon ? "bg-secondary text-cat-soon" : CATEGORY_TINT[tool.category],
          )}
        >
          <Icon className="size-5" />
        </span>
        {soon ? (
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Coming soon
          </span>
        ) : (
          <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary group-hover:opacity-100" />
        )}
      </div>
      <div className="mt-5 space-y-1">
        <h3 className={cn("font-display text-[15px] font-semibold", soon ? "text-foreground/70" : "text-foreground")}>
          {tool.title}
        </h3>
        <p className="text-sm leading-snug text-muted-foreground">{tool.short}</p>
      </div>
    </>
  );

  const className = cn(
    "group animate-rise relative flex flex-col rounded-2xl border bg-gradient-card p-5 shadow-card transition-all",
    soon ? "border-border/60 hover:border-border" : "border-border hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-glow",
  );

  if (tool.status === "soon") {
    return (
      <Link to="/soon/$slug" params={{ slug: tool.slug }} className={className} style={style}>
        {inner}
      </Link>
    );
  }
  return (
    <Link to={tool.path} className={className} style={style}>
      {inner}
    </Link>
  );
}
