import { AlertTriangle, Loader2, Play, X } from "lucide-react";

import { useEngineState } from "@/components/EngineBadge";
import { ProgressBar } from "@/components/ProgressBar";
import { ResultCard, type PreviewKind } from "@/components/ResultCard";
import { Button } from "@/components/ui/button";
import type { Job } from "@/hooks/use-job";

interface JobPanelProps {
  job: Job;
  originalSize: number;
  preview: PreviewKind;
  actionLabel: string;
  onStart: () => void;
  onReset: () => void;
  disabled?: boolean | undefined;
  disabledReason?: string | undefined;
  /** ffmpeg jobs can be cancelled; canvas jobs are near-instant. */
  cancellable?: boolean;
  processingLabel?: string | undefined;
}

export function JobPanel({
  job,
  originalSize,
  preview,
  actionLabel,
  onStart,
  onReset,
  disabled,
  disabledReason,
  cancellable = true,
  processingLabel = "Processing on your device…",
}: JobPanelProps) {
  const engine = useEngineState();

  if (job.phase === "done" && job.result) {
    return <ResultCard result={job.result} originalSize={originalSize} preview={preview} onReset={onReset} />;
  }

  if (job.busy) {
    const loadingEngine = job.phase === "engine" || engine.status === "loading";
    return (
      <div className="space-y-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
        {loadingEngine ? (
          <ProgressBar
            value={engine.progress}
            label="Loading processing engine"
            sublabel="One-time ~31 MB download, cached by your browser. Your file stays on this device."
          />
        ) : (
          <ProgressBar
            value={job.progress * 100}
            label={processingLabel}
            sublabel="Keep this tab open. Large files can take a few minutes."
          />
        )}
        {cancellable && (
          <Button variant="ghost" size="sm" onClick={job.cancel} className="text-muted-foreground">
            <X /> Cancel
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {job.phase === "error" && job.error && (
        <div className="flex gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="min-w-0">
            <p className="font-semibold text-foreground">That didn't work</p>
            <p className="mt-0.5 break-words text-muted-foreground">{job.error}</p>
          </div>
        </div>
      )}
      <Button
        size="lg"
        onClick={onStart}
        disabled={disabled}
        className="h-12 w-full bg-gradient-primary text-base font-semibold shadow-glow hover:opacity-95"
      >
        {engine.status === "loading" ? <Loader2 className="animate-spin" /> : <Play className="fill-current" />}
        {job.phase === "error" ? "Try again" : actionLabel}
      </Button>
      {disabled && disabledReason && <p className="text-center text-xs text-warning">{disabledReason}</p>}
    </div>
  );
}
