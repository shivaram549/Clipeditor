import { EyeOff } from "lucide-react";
import { forwardRef, useEffect, useState } from "react";

/** Local preview of the selected file. Falls back gracefully for formats the browser can't play. */
export const MediaPreview = forwardRef<HTMLVideoElement & HTMLAudioElement, { file: File; kind: "video" | "audio"; playable: boolean }>(
  function MediaPreview({ file, kind, playable }, ref) {
    const [url, setUrl] = useState<string | null>(null);
    useEffect(() => {
      const u = URL.createObjectURL(file);
      setUrl(u);
      return () => URL.revokeObjectURL(u);
    }, [file]);

    if (!playable) {
      return (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-surface/60 p-4 text-sm text-muted-foreground">
          <EyeOff className="size-4 shrink-0" />
          Your browser can't preview this format, but it can still be processed.
        </div>
      );
    }
    if (!url) return null;
    return kind === "video" ? (
      <video ref={ref} src={url} controls playsInline className="max-h-[380px] w-full rounded-xl border border-border bg-background" />
    ) : (
      <div className="rounded-xl border border-border bg-surface p-3">
        <audio ref={ref} src={url} controls className="w-full" />
      </div>
    );
  },
);
