import { useState } from "react";

import { FileSummary } from "@/components/FileSummary";
import { FileUploader } from "@/components/FileUploader";
import { JobPanel } from "@/components/JobPanel";
import { OptionPicker } from "@/components/OptionPicker";
import { QualitySlider } from "@/components/QualitySlider";
import { ToolLayout } from "@/components/ToolLayout";
import { useJob } from "@/hooks/use-job";
import { buildOutputName } from "@/lib/format";
import { IMAGE_FORMATS, loadImage, renderImage } from "@/lib/image";
import { HEIC_EXTS } from "@/lib/media";
import { getLiveTool } from "@/lib/tools";

const tool = getLiveTool("heic-to-jpg");

type Target = "jpeg" | "png";

export function HeicToJpg() {
  const job = useJob();
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Target>("jpeg");
  const [quality, setQuality] = useState(90);

  const process = () => {
    if (!file) return;
    job.run(async (ctx) => {
      ctx.setProgress(0.15);
      const mime = IMAGE_FORMATS[format].mime;
      let blob: Blob;
      try {
        // Loaded on demand: heic2any is a large, browser-only decoder.
        const { default: heic2any } = await import("heic2any");
        ctx.setProgress(0.4);
        const out = await heic2any({ blob: file, toType: mime, quality: quality / 100 });
        const first = Array.isArray(out) ? out[0] : out;
        if (!first) throw new Error("No image found in this HEIC file.");
        blob = first;
      } catch {
        // Safari can decode HEIC natively — try the browser as a fallback.
        const loaded = await loadImage(file).catch(() => {
          throw new Error("This HEIC file couldn't be decoded. It may be damaged or use an unsupported variant.");
        });
        try {
          blob = await renderImage({ image: loaded, width: loaded.width, height: loaded.height, format, quality: quality / 100 });
        } finally {
          loaded.close();
        }
      }
      return { blob, filename: buildOutputName(file.name, "", IMAGE_FORMATS[format].ext) };
    });
  };

  return (
    <ToolLayout tool={tool}>
      {!file ? (
        <FileUploader
          extensions={HEIC_EXTS}
          label="Drop a HEIC / HEIF photo"
          onFile={(f) => {
            job.reset();
            setFile(f);
          }}
        />
      ) : (
        <div className="space-y-6">
          <FileSummary
            file={file}
            kind="image"
            disabled={job.busy}
            onClear={() => {
              job.reset();
              setFile(null);
            }}
            meta={<span>HEIC</span>}
          />
          <OptionPicker
            label="Convert to"
            value={format}
            onChange={(v) => {
              setFormat(v);
              job.reset();
            }}
            disabled={job.busy}
            options={[
              { value: "jpeg", label: "JPG", description: "Smaller, works everywhere" },
              { value: "png", label: "PNG", description: "Lossless, larger" },
            ]}
          />
          {format === "jpeg" && <QualitySlider value={quality} onChange={setQuality} disabled={job.busy} />}
          <JobPanel
            job={job}
            originalSize={file.size}
            preview="image"
            actionLabel={`Convert to ${IMAGE_FORMATS[format].label}`}
            processingLabel="Decoding HEIC photo…"
            onStart={process}
            onReset={job.reset}
            cancellable={false}
          />
        </div>
      )}
    </ToolLayout>
  );
}
