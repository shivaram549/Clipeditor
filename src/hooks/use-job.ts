import { useCallback, useEffect, useRef, useState } from "react";

import { CancelledError, cancelFFmpeg } from "@/lib/ffmpeg";

export type JobPhase = "idle" | "engine" | "processing" | "done" | "error";

export interface JobResult {
  blob: Blob;
  filename: string;
  note?: string | undefined;
}

export interface JobContext {
  setPhase: (phase: "engine" | "processing") => void;
  setProgress: (fraction: number) => void;
}

export function useJob() {
  const [phase, setPhase] = useState<JobPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<JobResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const runId = useRef(0);
  const running = useRef(false);

  const reset = useCallback(() => {
    runId.current++;
    setPhase("idle");
    setProgress(0);
    setResult(null);
    setError(null);
  }, []);

  const run = useCallback(async (fn: (ctx: JobContext) => Promise<JobResult>) => {
    const id = ++runId.current;
    running.current = true;
    setResult(null);
    setError(null);
    setProgress(0);
    setPhase("processing");
    const ctx: JobContext = {
      setPhase: (p) => id === runId.current && setPhase(p),
      setProgress: (f) => id === runId.current && setProgress(Math.max(0, Math.min(1, f))),
    };
    try {
      const res = await fn(ctx);
      if (id !== runId.current) return;
      setResult(res);
      setProgress(1);
      setPhase("done");
    } catch (err) {
      if (id !== runId.current) return;
      if (err instanceof CancelledError) {
        setPhase("idle");
        setProgress(0);
        return;
      }
      setError(err instanceof Error ? err.message : String(err));
      setPhase("error");
    } finally {
      if (id === runId.current) running.current = false;
    }
  }, []);

  const cancel = useCallback(() => {
    cancelFFmpeg();
    runId.current++;
    running.current = false;
    setPhase("idle");
    setProgress(0);
  }, []);

  // Stop work if the user navigates away mid-job.
  useEffect(
    () => () => {
      if (running.current) cancelFFmpeg();
    },
    [],
  );

  const busy = phase === "engine" || phase === "processing";
  return { phase, progress, result, error, busy, run, reset, cancel };
}

export type Job = ReturnType<typeof useJob>;

/** Wire runFFmpeg callbacks into a job context. */
export function ffmpegCallbacks(ctx: JobContext) {
  return {
    onEngine: () => ctx.setPhase("engine"),
    onProgress: (fraction: number) => {
      ctx.setPhase("processing");
      ctx.setProgress(fraction);
    },
  };
}
