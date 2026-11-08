import { formatTime } from "@/lib/format";

/** Visual timeline showing the selected [start, end] range of a clip. */
export function SegmentBar({ duration, start, end }: { duration: number | null; start: number; end: number }) {
  if (!duration || duration <= 0) return null;
  const left = Math.max(0, Math.min(100, (start / duration) * 100));
  const right = Math.max(left, Math.min(100, (end / duration) * 100));
  return (
    <div className="space-y-1.5">
      <div className="relative h-8 overflow-hidden rounded-lg border border-border bg-surface">
        <div className="absolute inset-0 opacity-40 [background-image:repeating-linear-gradient(90deg,var(--color-border-strong)_0_1px,transparent_1px_10px)]" />
        <div
          className="absolute inset-y-0 border-x-2 border-primary bg-primary/25"
          style={{ left: `${left}%`, width: `${right - left}%` }}
        />
      </div>
      <div className="flex justify-between font-mono text-[11px] tabular-nums text-muted-foreground">
        <span>0:00</span>
        <span className="text-primary">Selected {formatTime(Math.max(0, end - start), 2)}</span>
        <span>{formatTime(duration, 1)}</span>
      </div>
    </div>
  );
}
