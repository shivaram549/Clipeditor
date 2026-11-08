import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock } from "lucide-react";

import { ToolCard } from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { CATEGORIES, TOOLS, soonTool } from "@/lib/tools";

export const Route = createFileRoute("/soon/$slug")({
  loader: ({ params }) => {
    const tool = soonTool(params.slug);
    if (!tool) throw notFound();
    return { id: tool.id };
  },
  head: ({ params }) => {
    const tool = soonTool(params.slug);
    if (!tool) return { meta: [{ title: "Tool not found | ClipBench" }, { name: "robots", content: "noindex" }] };
    return pageHead(`${tool.title} (Coming Soon) | ClipBench`, tool.description);
  },
  component: SoonPage,
});

function SoonPage() {
  const { slug } = Route.useParams();
  const tool = soonTool(slug);
  if (!tool) return null;
  const Icon = tool.icon;
  const alternatives = TOOLS.filter((t) => t.category === tool.category && t.status === "live").slice(0, 3);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-hero" aria-hidden />
      <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-16 text-center sm:px-6">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-secondary text-cat-soon">
          <Icon className="size-8" />
        </span>
        <span className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Clock className="size-3" /> Coming soon
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold text-foreground sm:text-4xl">{tool.title}</h1>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">{tool.description}</p>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Like everything here, it will run fully on your device — we're making sure it's fast enough first.
        </p>
        <Button asChild variant="outline" className="mt-8 bg-surface">
          <Link to="/">
            <ArrowLeft /> Back to all tools
          </Link>
        </Button>

        {alternatives.length > 0 && (
          <section className="mt-16 text-left">
            <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
              Available {CATEGORIES[tool.category].label.toLowerCase()} tools
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {alternatives.map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
