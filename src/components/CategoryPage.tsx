import { ToolCard, CATEGORY_TINT } from "@/components/ToolCard";
import { CATEGORIES, toolsIn, type Category } from "@/lib/tools";
import { cn } from "@/lib/utils";

export function CategoryPage({ category }: { category: Category }) {
  const meta = CATEGORIES[category];
  const Icon = meta.icon;
  const tools = toolsIn(category);
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-hero" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16">
        <header className="mb-10 flex items-center gap-4">
          <span className={cn("grid size-14 place-items-center rounded-2xl", CATEGORY_TINT[category])}>
            <Icon className="size-7" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">{meta.title}</h1>
            <p className="mt-1 text-muted-foreground">{meta.blurb}</p>
          </div>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} style={{ animationDelay: `${i * 40}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
