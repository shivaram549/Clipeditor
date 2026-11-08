import { Link2, Link2Off } from "lucide-react";
import { useState } from "react";

import { Field, NumberInput } from "@/components/Field";
import { FileSummary } from "@/components/FileSummary";
import { FileUploader } from "@/components/FileUploader";
import { ImagePreview } from "@/components/ImagePreview";
import { JobPanel } from "@/components/JobPanel";
import { OptionPicker } from "@/components/OptionPicker";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { useImageFile } from "@/hooks/use-image-file";
import { useJob } from "@/hooks/use-job";
import { buildOutputName } from "@/lib/format";
import { IMAGE_FORMATS, formatFromFile, loadImage, renderImage } from "@/lib/image";
import { IMAGE_EXTS } from "@/lib/media";
import { getLiveTool } from "@/lib/tools";

const tool = getLiveTool("resize-image");
const MAX_PX = 12000;

export function ResizeImage() {
  const img = useImageFile();
  const job = useJob();
  const [mode, setMode] = useState<"pixels" | "percent">("pixels");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [percent, setPercent] = useState(50);
  const [lock, setLock] = useState(true);

  const ratio = img.size ? img.size.width / img.size.height : 1;

  const onFile = async (f: File) => {
    job.reset();
    const s = await img.setFile(f);
    if (s) {
      setWidth(s.width);
      setHeight(s.height);
    }
  };

  const target =
    mode === "percent" && img.size
      ? { width: Math.round((img.size.width * percent) / 100), height: Math.round((img.size.height * percent) / 100) }
      : { width: Math.round(width), height: Math.round(height) };

  const invalidReason =
    !img.size
      ? "Couldn't read this image's dimensions."
      : !(target.width >= 1 && target.height >= 1)
        ? "Width and height must be at least 1 px."
        : target.width > MAX_PX || target.height > MAX_PX
          ? `Maximum size is ${MAX_PX} px per side.`
          : undefined;

  const process = () => {
    const file = img.file;
    if (!file) return;
    const format = formatFromFile(file) ?? "png";
    job.run(async (ctx) => {
      ctx.setProgress(0.3);
      const loaded = await loadImage(file);
      try {
        const blob = await renderImage({ image: loaded, ...target, format, quality: 0.92 });
        return {
          blob,
          filename: buildOutputName(file.name, `${target.width}x${target.height}`, IMAGE_FORMATS[format].ext),
        };
      } finally {
        loaded.close();
      }
    });
  };

  return (
    <ToolLayout tool={tool}>
      {!img.file ? (
        <FileUploader extensions={IMAGE_EXTS} mimePrefix="image/" label="Drop an image to resize" onFile={onFile} />
      ) : (
        <div className="space-y-6">
          <FileSummary
            file={img.file}
            kind="image"
            onClear={() => {
              job.reset();
              img.clear();
            }}
            meta={img.size ? <span>{img.size.width}×{img.size.height}</span> : null}
          />
          {job.phase !== "done" && <ImagePreview url={img.url} alt="Original image" />}
          <OptionPicker
            label="Resize by"
            value={mode}
            onChange={setMode}
            options={[
              { value: "pixels", label: "Pixels" },
              { value: "percent", label: "Percentage" },
            ]}
          />
          {mode === "pixels" ? (
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
              <Field label="Width">
                <NumberInput
                  value={width}
                  min={1}
                  max={MAX_PX}
                  suffix="px"
                  onChange={(w) => {
                    setWidth(w);
                    if (lock) setHeight(Math.round(w / ratio));
                  }}
                />
              </Field>
              <Button
                type="button"
                variant={lock ? "secondary" : "ghost"}
                size="icon"
                className="mb-0.5 h-10 w-10"
                onClick={() => setLock((l) => !l)}
                aria-label={lock ? "Unlock aspect ratio" : "Lock aspect ratio"}
                title={lock ? "Aspect ratio locked" : "Aspect ratio unlocked"}
              >
                {lock ? <Link2 className="text-primary" /> : <Link2Off />}
              </Button>
              <Field label="Height">
                <NumberInput
                  value={height}
                  min={1}
                  max={MAX_PX}
                  suffix="px"
                  onChange={(h) => {
                    setHeight(h);
                    if (lock) setWidth(Math.round(h * ratio));
                  }}
                />
              </Field>
            </div>
          ) : (
            <OptionPicker
              label="Scale"
              value={String(percent)}
              onChange={(v) => setPercent(Number(v))}
              options={["25", "50", "75", "150"].map((v) => ({ value: v, label: `${v}%` }))}
            />
          )}
          {img.size && !invalidReason && (
            <p className="font-mono text-xs text-muted-foreground">
              {img.size.width}×{img.size.height} → <span className="text-primary">{target.width}×{target.height}</span>
            </p>
          )}
          <JobPanel
            job={job}
            originalSize={img.file.size}
            preview="image"
            actionLabel="Resize image"
            onStart={process}
            onReset={job.reset}
            cancellable={false}
            disabled={!!invalidReason}
            disabledReason={invalidReason}
          />
        </div>
      )}
    </ToolLayout>
  );
}
