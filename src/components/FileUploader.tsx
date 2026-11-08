import { UploadCloud } from "lucide-react";
import { useCallback, useId, useRef, useState, type DragEvent } from "react";

import { getExtension } from "@/lib/format";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  /** Allowed lowercase extensions, e.g. ["mp4", "mov"]. */
  extensions: string[];
  /** Optional MIME prefix also accepted (e.g. "video/"). */
  mimePrefix?: string;
  label?: string;
  onFile: (file: File) => void;
}

export function FileUploader({ extensions, mimePrefix, label = "Drop your file here", onFile }: FileUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = [...extensions.map((e) => `.${e}`), ...(mimePrefix ? [`${mimePrefix}*`] : [])].join(",");

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      const ext = getExtension(file.name);
      const ok = extensions.includes(ext) || (mimePrefix ? file.type.startsWith(mimePrefix) : false);
      if (!ok) {
        setError(`“.${ext || "?"}” files aren't supported here. Try: ${extensions.slice(0, 6).join(", ").toUpperCase()}.`);
        return;
      }
      setError(null);
      onFile(file);
    },
    [extensions, mimePrefix, onFile],
  );

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all",
          dragging
            ? "border-primary bg-primary/10 shadow-glow"
            : "border-border-strong bg-surface/60 hover:border-primary/60 hover:bg-surface",
        )}
      >
        <span
          className={cn(
            "grid size-14 place-items-center rounded-2xl bg-primary/15 text-primary transition-transform",
            dragging ? "scale-110" : "group-hover:-translate-y-0.5",
          )}
        >
          <UploadCloud className="size-7" />
        </span>
        <div className="space-y-1">
          <p className="font-display text-lg font-semibold text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">
            or <span className="font-medium text-primary underline-offset-4 group-hover:underline">browse files</span>
          </p>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/80">
          {extensions.slice(0, 8).join(" · ")}
        </p>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}
