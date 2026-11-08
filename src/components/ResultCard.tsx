import { ArrowRight, CheckCircle2, Download, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { JobResult } from "@/hooks/use-job";
import { formatBytes, sizeChangePercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export type PreviewKind = "video" | "audio" | "image" | "none";

export function ResultCard({
  result,
  originalSize,
  preview,
  onReset,
}: {
  result: JobResult;
  originalSize: number;
  preview: PreviewKind;
  onReset: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(result.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [result.blob]);

  const change = sizeChangePercent(originalSize, result.blob.size);
  const smaller = change < -0.5;

  return (
    <div className="animate-rise space-y-4 rounded-2xl border border-success/30 bg-success/5 p-4 sm:p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-success">
        <CheckCircle2 className="size-4" /> Done — your file is ready
      </div>

      {url && preview !== "none" && (
        <div className="overflow-hidden rounded-xl border border-border bg-background">
          {preview === "video" && <video src={url} controls playsInline className="max-h-[420px] w-full bg-background" />}
          {preview === "audio" && (
            <div className="p-4">
              <audio src={url} controls className="w-full" />
            </div>
          )}
          {preview === "image" && (
            <img src={url} alt="Processed output preview" className="mx-auto max-h-[420px] w-auto object-contain" />
          )}
        </div>
      )}

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border border-border bg-surface p-3">
        <SizeStat label="Original" value={formatBytes(originalSize)} />
        <ArrowRight className="size-4 text-muted-foreground" />
        <SizeStat
          label="Output"
          value={formatBytes(result.blob.size)}
          badge={
            Math.abs(change) >= 0.5 ? (
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold",
                  smaller ? "bg-success/15 text-success" : "bg-warning/15 text-warning",
                )}
              >
                {change > 0 ? "+" : ""}
                {change.toFixed(0)}%
              </span>
            ) : null
          }
        />
      </div>

      {result.note && <p className="text-xs text-muted-foreground">{result.note}</p>}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild size="lg" className="flex-1 bg-gradient-primary shadow-glow hover:opacity-95">
          <a href={url ?? undefined} download={result.filename}>
            <Download /> Download {result.filename.split(".").pop()?.toUpperCase()}
          </a>
        </Button>
        <Button variant="outline" size="lg" onClick={onReset} className="bg-surface">
          <RotateCcw /> Start over
        </Button>
      </div>
      <p className="truncate text-center font-mono text-xs text-muted-foreground">{result.filename}</p>
    </div>
  );
}

function SizeStat({ label, value, badge }: { label: string; value: string; badge?: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="flex items-center gap-2 font-mono text-base font-semibold tabular-nums text-foreground">
        {value} {badge}
      </p>
    </div>
  );
}
