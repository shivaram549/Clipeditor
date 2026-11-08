import { useState } from "react";

import { FileSummary } from "@/components/FileSummary";
import { FileUploader } from "@/components/FileUploader";
import { JobPanel } from "@/components/JobPanel";
import { OptionPicker } from "@/components/OptionPicker";
import { ToolLayout } from "@/components/ToolLayout";
import { ffmpegCallbacks, useJob, type JobContext } from "@/hooks/use-job";
import { useMediaFile } from "@/hooks/use-media-file";
import { CancelledError, runFFmpeg, toBlob } from "@/lib/ffmpeg";
import { toMp4Args, type Mp4Mode } from "@/lib/ffmpeg-args";
import { buildOutputName, formatTime, getExtension } from "@/lib/format";
import { VIDEO_EXTS } from "@/lib/media";
import { getLiveTool } from "@/lib/tools";

const tool = getLiveTool("convert-to-mp4");

type Strategy = "auto" | "encode";

/** Read codec names from FFmpeg's input stream log lines. */
function detectCodecs(logs: string[]) {
  let video: string | null = null;
  let audio: string | null = null;
  for (const line of logs) {
    const v = /Stream #0:\d+.*?Video: (\w+)/.exec(line);
    if (v?.[1] && !video) video = v[1].toLowerCase();
    const a = /Stream #0:\d+.*?Audio: (\w+)/.exec(line);
    if (a?.[1] && !audio) audio = a[1].toLowerCase();
  }
  return { video, audio };
}

const MP4_VIDEO_OK = ["h264", "hevc"];
const MP4_AUDIO_OK = ["aac", "mp3"];

export function ConvertToMp4() {
  const media = useMediaFile("video");
  const job = useJob();
  const [strategy, setStrategy] = useState<Strategy>("auto");

  const process = () => {
    const file = media.file;
    if (!file) return;
    const duration = media.info?.duration;

    const run = (mode: Mp4Mode, ctx: JobContext, logs?: string[]) =>
      runFFmpeg({
        file,
        outputExt: "mp4",
        expectedDuration: duration,
        args: (input, output) => toMp4Args({ input, output, mode }),
        onLog: logs ? (m) => logs.push(m) : undefined,
        ...ffmpegCallbacks(ctx),
      });

    job.run(async (ctx) => {
      const filename = buildOutputName(file.name, "", "mp4");
      if (strategy === "auto" && getExtension(file.name) !== "webm") {
        const logs: string[] = [];
        try {
          const data = await run("copy", ctx, logs);
          const { video, audio } = detectCodecs(logs);
          if (video && MP4_VIDEO_OK.includes(video) && (!audio || MP4_AUDIO_OK.includes(audio))) {
            return { blob: toBlob(data, "video/mp4"), filename, note: "Remuxed without re-encoding — full original quality." };
          }
          if (video && MP4_VIDEO_OK.includes(video)) {
            const data2 = await run("copy-video", ctx);
            return { blob: toBlob(data2, "video/mp4"), filename, note: "Video copied as-is; audio converted to AAC." };
          }
        } catch (err) {
          if (err instanceof CancelledError) throw err;
          // fall through to a full re-encode
        }
      }
      const data = await run("encode", ctx);
      return { blob: toBlob(data, "video/mp4"), filename, note: "Re-encoded to H.264 + AAC for maximum compatibility." };
    });
  };

  return (
    <ToolLayout tool={tool}>
      {!media.file ? (
        <FileUploader
          extensions={VIDEO_EXTS}
          mimePrefix="video/"
          label="Drop a MOV, WebM, MKV or AVI file"
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
                <span className="uppercase">{getExtension(media.file.name)}</span>
                {media.info?.duration != null && <span>{formatTime(media.info.duration, 1)}</span>}
              </>
            }
          />
          <OptionPicker
            label="Conversion method"
            value={strategy}
            onChange={setStrategy}
            disabled={job.busy}
            options={[
              { value: "auto", label: "Smart (fastest)", description: "Remux when possible, re-encode only if needed" },
              { value: "encode", label: "Always re-encode", description: "H.264 + AAC, plays everywhere" },
            ]}
          />
          <JobPanel
            job={job}
            originalSize={media.file.size}
            preview="video"
            actionLabel="Convert to MP4"
            processingLabel="Converting on your device…"
            onStart={process}
            onReset={job.reset}
            disabled={media.probing}
          />
        </div>
      )}
    </ToolLayout>
  );
}
