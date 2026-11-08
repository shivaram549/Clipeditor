import { Slider } from "@/components/ui/slider";

export function QualitySlider({
  value,
  onChange,
  disabled,
  label = "Quality",
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs tabular-nums text-foreground">{value}%</span>
      </div>
      <Slider value={[value]} min={10} max={100} step={1} onValueChange={(v) => onChange(v[0] ?? value)} disabled={!!disabled} />
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>Smaller file</span>
        <span>Better quality</span>
      </div>
    </div>
  );
}
