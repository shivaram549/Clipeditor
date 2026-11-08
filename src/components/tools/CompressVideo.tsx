import { useState } from "react";

import { FileSummary } from "@/components/FileSummary";
import { FileUploader } from "@/components/FileUploader";
import { JobPanel } from "@/components/JobPanel";
import { MediaPreview } from "@/components/MediaPreview";
import { OptionPicker } from "@/components/OptionPicker";
import { ToolLayout } from "@/components/ToolLayout";
import { ffmpegCallbacks, useJob } from "@/hooks/use-job";
import { useMediaFile } from "@/hooks/use-media-file";
import { runFFmpeg, toBlob } from "@/lib/ffmpeg";
import { COMPRESS_PRESETS, compressArgs, type CompressPreset } from "@/lib/ffmpeg-args";
import { buildOutputName, formatTime } from "@/lib/format";
import { VIDEO_EXTS } from "@/lib/media";
import { getLiveTool } from "@/lib/tools";

const tool = getLiveTool("compress-video");

export function CompressVideo() {
  const media = useMediaFile("video");
  const job = useJob();
  const [preset, setPreset] = useState<CompressPreset>("balanced");

  const process = () => {
    const file = media.file;
    if (!file) return;
    job.run(async (ctx) => {
      const data = await runFFmpeg({
        file,
        outputExt: "mp4",
        expectedDuration: media.info?.duration,
        args: (input, output) => compressArgs({ input, output, preset }),
        ...ffmpegCallbacks(ctx),
      });
      const blob = toBlob(data, "video/mp4");
      return {
        blob,
        filename: buildOutputName(file.name, "compressed", "mp4"),
        note:
          blob.size >= file.size
            ? "This video was already efficiently compressed. Try the “Smaller” preset for a bigger reduction."
            : undefined,
      };
    });
  };

  return (
    <ToolLayout tool={tool}>
      {!media.file ? (
        <FileUploader
          extensions={VIDEO_EXTS}
          mimePrefix="video/"
          label="Drop a video to compress"
          onFile={(f) => {
            job.reset();
            void media.setFile(f);
          }}
        />
      ) : (
        <div className="space-y-6">
          <FileSummary
            file={media.file}
            kind="video"
            disabled={job.busy}
            onClear={() => {
              job.reset();
              media.clear();
            }}
            meta={
              <>
                {media.info?.duration != null && <span>{formatTime(media.info.duration, 1)}</span>}
                {media.info?.width ? (
                  <span>
                    {media.info.width}×{media.info.height}
                  </span>
                ) : null}
              </>
            }
          />
          {media.info && job.phase !== "done" && (
            <MediaPreview file={media.file} kind="video" playable={media.info.hasPreview} />
          )}
          <OptionPicker
            label="Compression preset"
            value={preset}
            onChange={setPreset}
            disabled={job.busy}
            options={(Object.keys(COMPRESS_PRESETS) as CompressPreset[]).map((key) => ({
              value: key,
              label: COMPRESS_PRESETS[key].label,
              description: COMPRESS_PRESETS[key].description,
            }))}
          />
          <JobPanel
            job={job}
            originalSize={media.file.size}
            preview="video"
            actionLabel="Compress video"
            processingLabel="Compressing on your device…"
            onStart={process}
            onReset={job.reset}
            disabled={media.probing}
          />
        </div>
      )}
    </ToolLayout>
  );
}
