import { cn } from "@/lib/utils";

export interface Option<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface OptionPickerProps<T extends string> {
  label?: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
}

export function OptionPicker<T extends string>({ label, value, options, onChange, disabled, className }: OptionPickerProps<T>) {
  const hasDescriptions = options.some((o) => o.description);
  return (
    <fieldset className={cn("space-y-2", className)} disabled={disabled}>
      {label && <legend className="mb-2 text-sm font-medium text-foreground">{label}</legend>}
      <div
        className={cn(
          "grid gap-2",
          options.length === 2 && "grid-cols-2",
          options.length === 3 && "grid-cols-1 sm:grid-cols-3",
          options.length >= 4 && "grid-cols-2 sm:grid-cols-4",
        )}
        role="radiogroup"
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.value)}
              className={cn(
                "rounded-xl border px-3.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50",
                hasDescriptions ? "py-3" : "py-2.5 text-center",
                active
                  ? "border-primary bg-primary/12 shadow-glow"
                  : "border-border bg-surface hover:border-border-strong hover:bg-surface-raised",
              )}
            >
              <span className={cn("block text-sm font-semibold", active ? "text-foreground" : "text-foreground/90")}>
                {opt.label}
              </span>
              {opt.description && <span className="mt-0.5 block text-xs text-muted-foreground">{opt.description}</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
