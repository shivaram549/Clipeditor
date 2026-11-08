import { FileAudio, FileImage, FileVideo, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/format";

const ICONS = { video: FileVideo, audio: FileAudio, image: FileImage };

export function FileSummary({
  file,
  kind,
  meta,
  onClear,
  disabled,
}: {
  file: File;
  kind: "video" | "audio" | "image";
  meta?: ReactNode;
  onClear: () => void;
  disabled?: boolean;
}) {
  const Icon = ICONS[kind];
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 pr-3">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground" title={file.name}>
          {file.name}
        </p>
        <p className="flex flex-wrap gap-x-3 font-mono text-xs tabular-nums text-muted-foreground">
          <span>{formatBytes(file.size)}</span>
          {meta}
        </p>
      </div>
      <Button variant="ghost" size="sm" onClick={onClear} disabled={disabled}>
        <RefreshCw /> Change
      </Button>
    </div>
  );
}
