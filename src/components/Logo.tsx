import { Scissors } from "lucide-react";

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
        <Scissors className="size-4" strokeWidth={2.5} />
      </span>
      <span className="font-display text-[17px] font-semibold tracking-tight text-foreground">
        Clip<span className="text-primary">Bench</span>
      </span>
    </span>
  );
}
