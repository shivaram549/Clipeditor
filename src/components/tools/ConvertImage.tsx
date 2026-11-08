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
import { buildOutputName, getExtension } from "@/lib/format";
import { IMAGE_FORMATS, formatFromFile, loadImage, renderImage, type ImageFormat } from "@/lib/image";
import { IMAGE_EXTS } from "@/lib/media";
import { getLiveTool } from "@/lib/tools";

const tool = getLiveTool("convert-image");

export function ConvertImage() {
  const img = useImageFile();
  const job = useJob();
  const [format, setFormat] = useState<ImageFormat>("png");
  const [quality, setQuality] = useState(90);

  const onFile = (f: File) => {
    job.reset();
    const src = formatFromFile(f);
    setFormat(src === "jpeg" ? "png" : src === "png" ? "jpeg" : src === "webp" ? "jpeg" : "png");
    void img.setFile(f);
  };

  const process = () => {
    const file = img.file;
    if (!file) return;
    job.run(async (ctx) => {
      ctx.setProgress(0.3);
      const loaded = await loadImage(file);
      try {
        const blob = await renderImage({
          image: loaded,
          width: loaded.width,
          height: loaded.height,
          format,
          quality: quality / 100,
        });
        return { blob, filename: buildOutputName(file.name, "", IMAGE_FORMATS[format].ext) };
      } finally {
        loaded.close();
      }
    });
  };

  return (
    <ToolLayout tool={tool}>
      {!img.file ? (
        <FileUploader extensions={IMAGE_EXTS} mimePrefix="image/" label="Drop an image to convert" onFile={onFile} />
      ) : (
        <div className="space-y-6">
          <FileSummary
            file={img.file}
            kind="image"
            onClear={() => {
              job.reset();
              img.clear();
            }}
            meta={
              <>
                <span className="uppercase">{getExtension(img.file.name)}</span>
                {img.size && (
                  <span>
                    {img.size.width}×{img.size.height}
                  </span>
                )}
              </>
            }
          />
          {job.phase !== "done" && <ImagePreview url={img.url} alt="Original image" />}
          <OptionPicker
            label="Convert to"
            value={format}
            onChange={(v) => {
              setFormat(v);
              job.reset();
            }}
            options={[
              { value: "jpeg", label: "JPG", description: "Transparency → white" },
              { value: "png", label: "PNG", description: "Lossless" },
              { value: "webp", label: "WebP", description: "Small & modern" },
            ]}
          />
          {IMAGE_FORMATS[format].lossy && <QualitySlider value={quality} onChange={setQuality} />}
          <JobPanel
            job={job}
            originalSize={img.file.size}
            preview="image"
            actionLabel={`Convert to ${IMAGE_FORMATS[format].label}`}
            onStart={process}
            onReset={job.reset}
            cancellable={false}
          />
        </div>
      )}
    </ToolLayout>
  );
}
