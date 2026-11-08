import { useState } from "react";

import { FileSummary } from "@/components/FileSummary";
import { FileUploader } from "@/components/FileUploader";
import { ImagePreview } from "@/components/ImagePreview";
import { JobPanel } from "@/components/JobPanel";
import { OptionPicker } from "@/components/OptionPicker";
import { QualitySlider } from "@/components/QualitySlider";
import { ToolLayout } from "@/components/ToolLayout";
import { useImageFile } from "@/hooks/use-image-file";
import { useJob } from "@/hooks/use-job";
import { buildOutputName } from "@/lib/format";
import { IMAGE_FORMATS, fitWithin, formatFromFile, loadImage, renderImage, type ImageFormat } from "@/lib/image";
import { IMAGE_EXTS } from "@/lib/media";
import { getLiveTool } from "@/lib/tools";

const tool = getLiveTool("compress-image");

export function CompressImage() {
  const img = useImageFile();
  const job = useJob();
  const [quality, setQuality] = useState(72);
  const [format, setFormat] = useState<ImageFormat>("jpeg");
  const [maxSide, setMaxSide] = useState("0");

  const onFile = (f: File) => {
    job.reset();
    const src = formatFromFile(f);
    setFormat(src === "png" || src === null ? "webp" : src);
    void img.setFile(f);
  };

  const process = () => {
    const file = img.file;
    if (!file) return;
    job.run(async (ctx) => {
      ctx.setProgress(0.2);
      const loaded = await loadImage(file);
      try {
        const dims = fitWithin(loaded.width, loaded.height, Number(maxSide) || null);
        ctx.setProgress(0.5);
        const blob = await renderImage({ image: loaded, ...dims, format, quality: quality / 100 });
        const resized = dims.width !== loaded.width;
        return {
          blob,
          filename: buildOutputName(file.name, "compressed", IMAGE_FORMATS[format].ext),
          note:
            blob.size >= file.size
              ? "The original was already well optimized. Lower the quality or limit the size for a smaller file."
              : resized
                ? `Resized to ${dims.width}×${dims.height}.`
                : undefined,
        };
      } finally {
        loaded.close();
      }
    });
  };

  return (
    <ToolLayout tool={tool}>
      {!img.file ? (
        <FileUploader extensions={IMAGE_EXTS} mimePrefix="image/" label="Drop an image to compress" onFile={onFile} />
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
            label="Output format"
            value={format}
            onChange={(v) => {
              setFormat(v);
              job.reset();
            }}
            options={[
              { value: "jpeg", label: "JPG", description: "Best for photos" },
              { value: "webp", label: "WebP", description: "Smallest, modern" },
              { value: "png", label: "PNG", description: "Lossless, keeps transparency" },
            ]}
          />
          {IMAGE_FORMATS[format].lossy && <QualitySlider value={quality} onChange={setQuality} />}
          <OptionPicker
            label="Max dimension"
            value={maxSide}
            onChange={setMaxSide}
            options={[
              { value: "0", label: "Original" },
              { value: "2560", label: "2560 px" },
              { value: "1920", label: "1920 px" },
              { value: "1280", label: "1280 px" },
            ]}
          />
          <JobPanel
            job={job}
            originalSize={img.file.size}
            preview="image"
            actionLabel="Compress image"
            onStart={process}
            onReset={job.reset}
            cancellable={false}
          />
        </div>
      )}
    </ToolLayout>
  );
}
