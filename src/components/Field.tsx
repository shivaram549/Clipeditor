import { useEffect, useId, useState, type ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { formatTime, parseTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Field({ label, hint, children, className }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <span className="block text-sm font-medium text-foreground">{label}</span>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

interface TimeInputProps {
  label: string;
  value: number;
  onChange: (seconds: number) => void;
  max?: number | null;
  disabled?: boolean;
  action?: ReactNode;
}

/** Text input that accepts "1:23.5" style timestamps and commits on blur/enter. */
export function TimeInput({ label, value, onChange, max, disabled, action }: TimeInputProps) {
  const id = useId();
  const [text, setText] = useState(formatTime(value, 2));
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setText(formatTime(value, 2));
    setInvalid(false);
  }, [value]);

  const commit = () => {
    const parsed = parseTime(text);
    if (parsed === null || (max != null && parsed > max + 0.001)) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    onChange(parsed);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="flex gap-2">
        <Input
          id={id}
          value={text}
          disabled={disabled}
          inputMode="decimal"
          placeholder="0:00.00"
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          aria-invalid={invalid}
          className={cn("h-10 bg-surface font-mono tabular-nums", invalid && "border-destructive")}
        />
        {action}
      </div>
      {invalid && (
        <p className="text-xs text-destructive">
          Use m:ss or seconds{max != null ? `, up to ${formatTime(max, 1)}` : ""}.
        </p>
      )}
    </div>
  );
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  disabled,
  id,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
  id?: string;
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        type="number"
        value={Number.isFinite(value) ? value : ""}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn("h-10 bg-surface font-mono tabular-nums", suffix && "pr-12")}
      />
      {suffix && (
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  );
}
