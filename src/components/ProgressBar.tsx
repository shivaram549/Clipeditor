import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  sublabel?: string;
  indeterminate?: boolean;
  className?: string;
}

export function ProgressBar({ value, label, sublabel, indeterminate, className }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("space-y-2", className)}>
      {(label || !indeterminate) && (
        <div className="flex items-baseline justify-between gap-4 text-sm">
          <span className="font-medium text-foreground">{label}</span>
          {!indeterminate && <span className="font-mono text-xs tabular-nums text-muted-foreground">{pct.toFixed(0)}%</span>}
        </div>
      )}
      <div
        className="relative h-2.5 overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : Math.round(pct)}
        aria-label={label}
      >
        <div
          className={cn(
            "progress-stripes absolute inset-y-0 left-0 rounded-full bg-gradient-primary transition-[width] duration-300 ease-out",
            indeterminate && "w-1/3 animate-pulse",
          )}
          style={indeterminate ? undefined : { width: `${Math.max(pct, 2)}%` }}
        />
      </div>
      {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
    </div>
  );
}
