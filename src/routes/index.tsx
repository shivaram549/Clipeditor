import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Cpu, Infinity as InfinityIcon, ShieldCheck, WifiOff } from "lucide-react";

import { ToolCard } from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { CATEGORIES, TOOLS, toolsIn, type Category } from "@/lib/tools";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "ClipBench — Free, Private Video, Audio & Photo Tools",
      "Trim, compress and convert videos, audio and images directly in your browser. 100% client-side — your files never leave your device.",
    ),
  component: Home,
});

const ORDER: Category[] = ["video", "audio", "photo"];

function Home() {
  const liveCount = TOOLS.filter((t) => t.status === "live").length;
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 bg-hero" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-grid" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24">
          <span className="animate-rise inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
            <ShieldCheck className="size-3.5" /> Your files never leave your device
          </span>
          <h1
            className="animate-rise mx-auto mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.05] text-foreground sm:text-6xl"
            style={{ animationDelay: "60ms" }}
          >
            Edit media in your browser.
            <br />
            <span className="text-gradient">No uploads. No waiting.</span>
          </h1>
          <p
            className="animate-rise mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg"
            style={{ animationDelay: "120ms" }}
          >
            {liveCount} free tools to trim, compress and convert video, audio and photos — processed locally with
            WebAssembly.
          </p>
          <div className="animate-rise mt-8 flex flex-wrap justify-center gap-3" style={{ animationDelay: "180ms" }}>
            <Button asChild size="lg" className="h-12 bg-gradient-primary px-6 text-base shadow-glow hover:opacity-95">
              <Link to="/video/trim">
                Trim a video <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 bg-surface px-6 text-base">
              <Link to="/video/compress">Compress a video</Link>
            </Button>
          </div>

          <dl
            className="animate-rise mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-3 text-left sm:grid-cols-3"
            style={{ animationDelay: "240ms" }}
          >
            <Feature icon={<Cpu className="size-4" />} title="On-device" text="Powered by FFmpeg compiled to WebAssembly." />
            <Feature icon={<WifiOff className="size-4" />} title="Private" text="Files stay in memory and vanish when you close the tab." />
            <Feature icon={<InfinityIcon className="size-4" />} title="Unlimited" text="No sign-up, no watermark, no daily limits." />
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-16 sm:px-6">
        {ORDER.map((cat) => {
          const meta = CATEGORIES[cat];
          const tools = toolsIn(cat);
          return (
            <section key={cat} aria-labelledby={`cat-${cat}`}>
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <h2 id={`cat-${cat}`} className="font-display text-2xl font-semibold text-foreground">
                    {meta.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{meta.blurb}</p>
                </div>
                <Link
                  to={cat === "video" ? "/video" : cat === "audio" ? "/audio" : "/photo"}
                  className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
                >
                  View all <ArrowRight className="size-3.5" />
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {tools.map((tool, i) => (
                  <ToolCard key={tool.id} tool={tool} style={{ animationDelay: `${i * 35}ms` }} />
                ))}
              </div>
            </section>
          );
        })}

        <section className="rounded-3xl border border-border bg-gradient-card p-8 shadow-card sm:p-10">
          <div className="grid gap-8 md:grid-cols-3">
            <Step n="1" title="Pick a file" text="Drag it in or browse. It's read straight into your browser's memory." />
            <Step n="2" title="Choose options" text="Times, presets, formats — tweak until it looks right." />
            <Step n="3" title="Download" text="Processing happens on your CPU, then you save the result." />
          </div>
        </section>
      </div>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/70 p-4 backdrop-blur">
      <dt className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="text-primary">{icon}</span>
        {title}
      </dt>
      <dd className="mt-1 text-sm text-muted-foreground">{text}</dd>
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="flex gap-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 font-mono text-sm font-semibold text-primary">
        {n}
      </span>
      <div>
        <h3 className="font-display font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
