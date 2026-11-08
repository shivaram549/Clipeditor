import { Link } from "@tanstack/react-router";
import { Cpu, ShieldCheck, Zap } from "lucide-react";
import type { ReactNode } from "react";

import { EngineBadge } from "@/components/EngineBadge";
import { Logo } from "@/components/Logo";

const NAV = [
  { to: "/video", label: "Video" },
  { to: "/audio", label: "Audio" },
  { to: "/photo", label: "Photo" },
] as const;

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link to="/" className="shrink-0" aria-label="ClipBench home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto hidden sm:block">
            <EngineBadge />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/70 bg-surface/50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Free media tools that run entirely in your browser. No accounts, no uploads, no watermarks.
            </p>
          </div>
          <FooterCol title="Video" links={[["/video/trim", "Trim"], ["/video/compress", "Compress"], ["/video/to-gif", "Video to GIF"], ["/video/convert-to-mp4", "Convert to MP4"]]} />
          <FooterCol title="Audio" links={[["/audio/converter", "Audio Converter"], ["/audio/cutter", "Audio Cutter"], ["/video/extract-audio", "Extract Audio"]]} />
          <FooterCol title="Photo" links={[["/photo/compress", "Compress Image"], ["/photo/resize", "Resize Image"], ["/photo/convert", "Convert Image"], ["/photo/heic-to-jpg", "HEIC to JPG"]]} />
        </div>
        <div className="border-t border-border/70">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-sm sm:flex-row sm:px-6">
            <p className="flex items-center gap-2 font-medium text-foreground">
              <ShieldCheck className="size-4 text-success" />
              100% client-side • Your files never leave your device
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Cpu className="size-3.5" /> Powered by FFmpeg WebAssembly
              </span>
              <span className="hidden items-center gap-1.5 md:flex">
                <Zap className="size-3.5" /> Free forever
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

type FooterPath =
  | "/video/trim"
  | "/video/compress"
  | "/video/to-gif"
  | "/video/convert-to-mp4"
  | "/video/extract-audio"
  | "/audio/converter"
  | "/audio/cutter"
  | "/photo/compress"
  | "/photo/resize"
  | "/photo/convert"
  | "/photo/heic-to-jpg";

function FooterCol({ title, links }: { title: string; links: [FooterPath, string][] }) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      <ul className="space-y-2">
        {links.map(([to, label]) => (
          <li key={to}>
            <Link to={to} className="text-sm text-foreground/80 transition-colors hover:text-primary">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
