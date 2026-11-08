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
import { AUDIO_FORMATS, convertAudioArgs, type AudioFormat } from "@/lib/ffmpeg-args";
import { buildOutputName, formatTime, getExtension } from "@/lib/format";
import { AUDIO_EXTS, VIDEO_EXTS } from "@/lib/media";
import { getLiveTool } from "@/lib/tools";

const tool = getLiveTool("audio-converter");

export function AudioConverter() {
  const media = useMediaFile("audio");
  const job = useJob();
  const [format, setFormat] = useState<AudioFormat>("mp3");
  const [bitrate, setBitrate] = useState("192");

  const process = () => {
    const file = media.file;
    if (!file) return;
    job.run(async (ctx) => {
      const data = await runFFmpeg({
        file,
        outputExt: format,
        expectedDuration: media.info?.duration,
        args: (input, output) => convertAudioArgs({ input, output, format, bitrateKbps: Number(bitrate) }),
        ...ffmpegCallbacks(ctx),
      });
      const sameExt = getExtension(file.name) === format;
      return {
        blob: toBlob(data, AUDIO_FORMATS[format].mime),
        filename: buildOutputName(file.name, sameExt ? "converted" : "", format),
      };
    });
  };

  return (
    <ToolLayout tool={tool}>
      {!media.file ? (
        <FileUploader
          extensions={[...AUDIO_EXTS, ...VIDEO_EXTS.slice(0, 4)]}
          mimePrefix="audio/"
          label="Drop an audio file to convert"
          onFile={(f) => {
            job.reset();
            void media.setFile(f);
          }}
        />
      ) : (
        <div className="space-y-6">
          <FileSummary
            file={media.file}
            kind="audio"
            disabled={job.busy}
            onClear={() => {
              job.reset();
              media.clear();
            }}
            meta={
              <>
                <span className="uppercase">{getExtension(media.file.name)}</span>
                {media.info?.duration != null && <span>{formatTime(media.info.duration, 1)}</span>}
              </>
            }
          />
          {media.info && job.phase !== "done" && <MediaPreview file={media.file} kind="audio" playable={media.info.hasPreview} />}
          <OptionPicker
            label="Convert to"
            value={format}
            onChange={setFormat}
            disabled={job.busy}
            options={[
              { value: "mp3", label: "MP3", description: "Universal" },
              { value: "m4a", label: "M4A", description: "AAC · Apple friendly" },
              { value: "wav", label: "WAV", description: "Lossless PCM" },
            ]}
          />
          {AUDIO_FORMATS[format].lossy && (
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
            actionLabel={`Convert to ${AUDIO_FORMATS[format].label}`}
            processingLabel="Converting audio…"
            onStart={process}
            onReset={job.reset}
            disabled={media.probing}
          />
        </div>
      )}
    </ToolLayout>
  );
}
