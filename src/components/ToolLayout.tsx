import { Link } from "@tanstack/react-router";
import { ChevronRight, Lightbulb, Lock, Sparkles, Zap } from "lucide-react";
import type { ReactNode } from "react";

import { CATEGORY_TINT, ToolCard } from "@/components/ToolCard";
import { CATEGORIES, TOOLS, type Tool } from "@/lib/tools";
import { cn } from "@/lib/utils";

const CATEGORY_PATH = { video: "/video", audio: "/audio", photo: "/photo" } as const;

export function ToolLayout({ tool, children }: { tool: Tool; children: ReactNode }) {
  const Icon = tool.icon;
  const related = TOOLS.filter((t) => t.category === tool.category && t.id !== tool.id && t.status === "live").slice(0, 3);
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-hero" aria-hidden />
      <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground">
            Tools
          </Link>
          <ChevronRight className="size-3.5" />
          <Link to={CATEGORY_PATH[tool.category]} className="hover:text-foreground">
            {CATEGORIES[tool.category].label}
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground">{tool.title}</span>
        </nav>

        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start">
          <span className={cn("grid size-14 shrink-0 place-items-center rounded-2xl", CATEGORY_TINT[tool.category])}>
            <Icon className="size-7" />
          </span>
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">{tool.title}</h1>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">{tool.description}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Chip icon={<Lock className="size-3" />}>No uploads</Chip>
              <Chip icon={<Zap className="size-3" />}>Runs on your device</Chip>
              <Chip icon={<Sparkles className="size-3" />}>Free, no watermark</Chip>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-border bg-card/80 p-4 shadow-card backdrop-blur sm:p-6">{children}</section>

        {tool.tips && tool.tips.length > 0 && (
          <section className="mt-6 rounded-2xl border border-border/70 bg-surface/60 p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Lightbulb className="size-4 text-warning" /> Tips
            </h2>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {tool.tips.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground" />
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
              More {CATEGORIES[tool.category].label.toLowerCase()} tools
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {related.map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Chip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/80 px-2.5 py-1 text-xs font-medium text-muted-foreground">
      <span className="text-success">{icon}</span>
      {children}
    </span>
  );
}
