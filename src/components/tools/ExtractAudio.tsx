import { useState } from "react";

import { FileSummary } from "@/components/FileSummary";
import { FileUploader } from "@/components/FileUploader";
import { JobPanel } from "@/components/JobPanel";
import { OptionPicker } from "@/components/OptionPicker";
import { ToolLayout } from "@/components/ToolLayout";
import { ffmpegCallbacks, useJob } from "@/hooks/use-job";
import { useMediaFile } from "@/hooks/use-media-file";
import { runFFmpeg, toBlob } from "@/lib/ffmpeg";
import { AUDIO_FORMATS, extractAudioArgs } from "@/lib/ffmpeg-args";
import { buildOutputName, formatTime } from "@/lib/format";
import { VIDEO_EXTS } from "@/lib/media";
import { getLiveTool } from "@/lib/tools";

const tool = getLiveTool("extract-audio");

export function ExtractAudio() {
  const media = useMediaFile("video");
  const job = useJob();
  const [format, setFormat] = useState<"mp3" | "wav">("mp3");
  const [bitrate, setBitrate] = useState("192");

  const process = () => {
    const file = media.file;
    if (!file) return;
    job.run(async (ctx) => {
      const data = await runFFmpeg({
        file,
        outputExt: format,
        expectedDuration: media.info?.duration,
        args: (input, output) => extractAudioArgs({ input, output, format, bitrateKbps: Number(bitrate) }),
        ...ffmpegCallbacks(ctx),
      });
      return { blob: toBlob(data, AUDIO_FORMATS[format].mime), filename: buildOutputName(file.name, "audio", format) };
    });
  };

  return (
    <ToolLayout tool={tool}>
      {!media.file ? (
        <FileUploader
          extensions={VIDEO_EXTS}
          mimePrefix="video/"
          label="Drop a video to extract its audio"
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
            meta={media.info?.duration != null ? <span>{formatTime(media.info.duration, 1)}</span> : null}
          />
          <OptionPicker
            label="Output format"
            value={format}
            onChange={setFormat}
            disabled={job.busy}
            options={[
              { value: "mp3", label: "MP3", description: "Small, plays everywhere" },
              { value: "wav", label: "WAV", description: "Lossless, large files" },
            ]}
          />
          {format === "mp3" && (
            <OptionPicker
              label="Bitrate"
              value={bitrate}
              onChange={setBitrate}
              disabled={job.busy}
              options={["128", "192", "256", "320"].map((v) => ({ value: v, label: `${v} kbps` }))}
            />
          )}
          <JobPanel
            job={job}
            originalSize={media.file.size}
            preview="audio"
            actionLabel={`Extract ${format.toUpperCase()}`}
            processingLabel="Extracting audio…"
            onStart={process}
            onReset={job.reset}
            disabled={media.probing}
          />
        </div>
      )}
    </ToolLayout>
  );
}
