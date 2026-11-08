import { useRef, useState } from "react";

import { Field, NumberInput, TimeInput } from "@/components/Field";
import { FileSummary } from "@/components/FileSummary";
import { FileUploader } from "@/components/FileUploader";
import { JobPanel } from "@/components/JobPanel";
import { MediaPreview } from "@/components/MediaPreview";
import { OptionPicker } from "@/components/OptionPicker";
import { SegmentBar } from "@/components/SegmentBar";
import { ToolLayout } from "@/components/ToolLayout";
import { PlayerButton } from "@/components/tools/TrimVideo";
import { ffmpegCallbacks, useJob } from "@/hooks/use-job";
import { useMediaFile } from "@/hooks/use-media-file";
import { runFFmpeg, toBlob } from "@/lib/ffmpeg";
import { gifArgs } from "@/lib/ffmpeg-args";
import { buildOutputName, formatTime } from "@/lib/format";
import { VIDEO_EXTS } from "@/lib/media";
import { getLiveTool } from "@/lib/tools";

const tool = getLiveTool("video-to-gif");
const MAX_GIF_SECONDS = 30;

export function VideoToGif() {
  const media = useMediaFile("video");
  const job = useJob();
  const videoRef = useRef<HTMLVideoElement & HTMLAudioElement>(null);
  const [start, setStart] = useState(0);
  const [length, setLength] = useState(4);
  const [fps, setFps] = useState("12");
  const [width, setWidth] = useState("480");
  const duration = media.info?.duration ?? null;

  const effectiveLength = duration ? Math.min(length, Math.max(0, duration - start)) : length;
  const invalidReason =
    !(length > 0) || length > MAX_GIF_SECONDS
      ? `Duration must be between 0.1 and ${MAX_GIF_SECONDS} seconds.`
      : effectiveLength <= 0
        ? "Start time is past the end of the video."
        : undefined;

  const process = () => {
    const file = media.file;
    if (!file) return;
    job.run(async (ctx) => {
      const data = await runFFmpeg({
        file,
        outputExt: "gif",
        expectedDuration: effectiveLength,
        args: (input, output) =>
          gifArgs({ input, output, start, duration: effectiveLength, fps: Number(fps), width: Number(width) }),
        ...ffmpegCallbacks(ctx),
      });
      return { blob: toBlob(data, "image/gif"), filename: buildOutputName(file.name, "", "gif") };
    });
  };

  return (
    <ToolLayout tool={tool}>
      {!media.file ? (
        <FileUploader
          extensions={VIDEO_EXTS}
          mimePrefix="video/"
          label="Drop a video to make a GIF"
          onFile={(f) => {
            job.reset();
            setStart(0);
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
            meta={duration != null ? <span>{formatTime(duration, 1)}</span> : null}
          />
          {media.info && job.phase !== "done" && (
            <MediaPreview ref={videoRef} file={media.file} kind="video" playable={media.info.hasPreview} />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <TimeInput
              label="Start time"
              value={start}
              max={duration}
              onChange={setStart}
              disabled={job.busy}
              action={
                media.info?.hasPreview ? (
                  <PlayerButton
                    disabled={job.busy}
                    onClick={() => {
                      const t = videoRef.current?.currentTime;
                      if (t != null) setStart(Number(t.toFixed(2)));
                    }}
                  />
                ) : undefined
              }
            />
            <Field label="Duration" hint={`Up to ${MAX_GIF_SECONDS} seconds`}>
              <NumberInput value={length} onChange={setLength} min={0.5} max={MAX_GIF_SECONDS} step={0.5} suffix="sec" disabled={job.busy} />
            </Field>
          </div>
          <SegmentBar duration={duration} start={start} end={start + effectiveLength} />
          <OptionPicker
            label="Frame rate"
            value={fps}
            onChange={setFps}
            disabled={job.busy}
            options={["8", "12", "15", "24"].map((v) => ({ value: v, label: `${v} fps` }))}
          />
          <OptionPicker
            label="Width"
            value={width}
            onChange={setWidth}
            disabled={job.busy}
            options={["320", "480", "640", "800"].map((v) => ({ value: v, label: `${v} px` }))}
          />
          <JobPanel
            job={job}
            originalSize={media.file.size}
            preview="image"
            actionLabel="Create GIF"
            processingLabel="Rendering GIF…"
            onStart={process}
            onReset={job.reset}
            disabled={!!invalidReason || media.probing}
            disabledReason={invalidReason}
          />
        </div>
      )}
    </ToolLayout>
  );
}
