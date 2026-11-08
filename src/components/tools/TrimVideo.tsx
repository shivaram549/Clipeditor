import { Crosshair } from "lucide-react";
import { useRef, useState } from "react";

import { TimeInput } from "@/components/Field";
import { FileSummary } from "@/components/FileSummary";
import { FileUploader } from "@/components/FileUploader";
import { JobPanel } from "@/components/JobPanel";
import { MediaPreview } from "@/components/MediaPreview";
import { OptionPicker } from "@/components/OptionPicker";
import { SegmentBar } from "@/components/SegmentBar";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { ffmpegCallbacks, useJob } from "@/hooks/use-job";
import { useMediaFile } from "@/hooks/use-media-file";
import { runFFmpeg, toBlob } from "@/lib/ffmpeg";
import { trimArgs, type TrimMode } from "@/lib/ffmpeg-args";
import { buildOutputName, formatTime, getExtension } from "@/lib/format";
import { mimeForExt, VIDEO_EXTS } from "@/lib/media";
import { getLiveTool } from "@/lib/tools";

const tool = getLiveTool("trim-video");

export function TrimVideo() {
  const media = useMediaFile("video");
  const job = useJob();
  const videoRef = useRef<HTMLVideoElement & HTMLAudioElement>(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [mode, setMode] = useState<TrimMode>("fast");
  const duration = media.info?.duration ?? null;

  const onFile = async (f: File) => {
    job.reset();
    const info = await media.setFile(f);
    setStart(0);
    setEnd(info.duration ? Math.min(info.duration, 30) : 10);
  };

  const invalidReason =
    end <= start ? "End time must be after the start time." : duration && start >= duration ? "Start is past the end of the video." : undefined;

  const process = () => {
    const file = media.file;
    if (!file) return;
    const clampedEnd = duration ? Math.min(end, duration) : end;
    job.run(async (ctx) => {
      const inExt = getExtension(file.name) || "mp4";
      const outExt = mode === "fast" ? inExt : "mp4";
      const data = await runFFmpeg({
        file,
        outputExt: outExt,
        expectedDuration: clampedEnd - start,
        args: (input, output) => trimArgs({ input, output, start, end: clampedEnd, mode }),
        ...ffmpegCallbacks(ctx),
      });
      return {
        blob: toBlob(data, mimeForExt(outExt)),
        filename: buildOutputName(file.name, "trimmed", outExt),
        note: mode === "fast" ? "Fast mode cuts on the nearest keyframe, so the start may be slightly earlier." : undefined,
      };
    });
  };

  const setFromPlayer = (which: "start" | "end") => {
    const t = videoRef.current?.currentTime;
    if (t == null) return;
    if (which === "start") setStart(Number(t.toFixed(2)));
    else setEnd(Number(t.toFixed(2)));
  };

  return (
    <ToolLayout tool={tool}>
      {!media.file ? (
        <FileUploader extensions={VIDEO_EXTS} mimePrefix="video/" label="Drop a video to trim" onFile={onFile} />
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
                {duration != null && <span>{formatTime(duration, 1)}</span>}
                {media.info?.width ? (
                  <span>
                    {media.info.width}×{media.info.height}
                  </span>
                ) : null}
              </>
            }
          />
          {media.info && <MediaPreview ref={videoRef} file={media.file} kind="video" playable={media.info.hasPreview} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <TimeInput
              label="Start"
              value={start}
              max={duration}
              onChange={setStart}
              disabled={job.busy}
              action={
                media.info?.hasPreview ? (
                  <PlayerButton onClick={() => setFromPlayer("start")} disabled={job.busy} />
                ) : undefined
              }
            />
            <TimeInput
              label="End"
              value={end}
              max={duration}
              onChange={setEnd}
              disabled={job.busy}
              action={
                media.info?.hasPreview ? <PlayerButton onClick={() => setFromPlayer("end")} disabled={job.busy} /> : undefined
              }
            />
          </div>
          <SegmentBar duration={duration} start={start} end={end} />

          <OptionPicker
            label="Trim mode"
            value={mode}
            onChange={setMode}
            disabled={job.busy}
            options={[
              { value: "fast", label: "Fast", description: "Stream copy · instant · no quality loss" },
              { value: "accurate", label: "Accurate", description: "Re-encode · frame-exact · MP4 output" },
            ]}
          />

          <JobPanel
            job={job}
            originalSize={media.file.size}
            preview="video"
            actionLabel="Trim video"
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

function PlayerButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="h-10 w-10 shrink-0 bg-surface"
      onClick={onClick}
      disabled={disabled}
      title="Use the player's current position"
      aria-label="Use the player's current position"
    >
      <Crosshair />
    </Button>
  );
}

export { PlayerButton };
