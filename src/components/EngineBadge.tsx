import { useSyncExternalStore } from "react";

import { engineStore } from "@/lib/ffmpeg";
import { cn } from "@/lib/utils";

export function useEngineState() {
  return useSyncExternalStore(engineStore.subscribe, engineStore.getSnapshot, engineStore.getServerSnapshot);
}

export function EngineBadge() {
  const engine = useEngineState();
  const label =
    engine.status === "ready"
      ? "Engine ready"
      : engine.status === "loading"
        ? `Loading engine ${engine.progress}%`
        : engine.status === "error"
          ? "Engine failed"
          : "Runs locally";
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
      <span
        className={cn(
          "size-1.5 rounded-full",
          engine.status === "ready" && "bg-success",
          engine.status === "loading" && "animate-pulse bg-primary",
          engine.status === "error" && "bg-destructive",
          engine.status === "idle" && "bg-success/70",
        )}
      />
      <span className="font-mono tabular-nums">{label}</span>
    </span>
  );
}
