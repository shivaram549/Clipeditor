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
import { AUDIO_FORMATS, cutAudioArgs, type AudioFormat } from "@/lib/ffmpeg-args";
import { buildOutputName, formatTime, getExtension } from "@/lib/format";
import { AUDIO_EXTS } from "@/lib/media";
import { getLiveTool } from "@/lib/tools";

const tool = getLiveTool("audio-cutter");

function defaultFormat(name: string): AudioFormat {
  const ext = getExtension(name);
  if (ext === "wav") return "wav";
  if (ext === "m4a" || ext === "aac") return "m4a";
  return "mp3";
}

export function AudioCutter() {
  const media = useMediaFile("audio");
  const job = useJob();
  const audioRef = useRef<HTMLVideoElement & HTMLAudioElement>(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  const [format, setFormat] = useState<AudioFormat>("mp3");
  const duration = media.info?.duration ?? null;

  const onFile = async (f: File) => {
    job.reset();
    setFormat(defaultFormat(f.name));
    const info = await media.setFile(f);
    setStart(0);
    setEnd(info.duration ? Math.min(info.duration, 30) : 30);
  };

  const invalidReason =
    end <= start
      ? "End time must be after the start time."
      : fadeIn < 0 || fadeOut < 0
        ? "Fades can't be negative."
        : fadeIn + fadeOut > end - start + 0.001
          ? "Fades are longer than the selected section."
          : undefined;

  const process = () => {
    const file = media.file;
    if (!file) return;
    const clampedEnd = duration ? Math.min(end, duration) : end;
    job.run(async (ctx) => {
      const data = await runFFmpeg({
        file,
        outputExt: format,
        expectedDuration: clampedEnd - start,
        args: (input, output) =>
          cutAudioArgs({ input, output, start, end: clampedEnd, fadeIn, fadeOut, format, bitrateKbps: 192 }),
        ...ffmpegCallbacks(ctx),
      });
      return { blob: toBlob(data, AUDIO_FORMATS[format].mime), filename: buildOutputName(file.name, "cut", format) };
    });
  };

  const fromPlayer = (setter: (n: number) => void) => () => {
    const t = audioRef.current?.currentTime;
    if (t != null) setter(Number(t.toFixed(2)));
  };

  return (
    <ToolLayout tool={tool}>
      {!media.file ? (
        <FileUploader extensions={AUDIO_EXTS} mimePrefix="audio/" label="Drop an audio file to cut" onFile={onFile} />
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
            meta={duration != null ? <span>{formatTime(duration, 1)}</span> : null}
          />
          {media.info && <MediaPreview ref={audioRef} file={media.file} kind="audio" playable={media.info.hasPreview} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <TimeInput
              label="Start"
              value={start}
              max={duration}
              onChange={setStart}
              disabled={job.busy}
              action={media.info?.hasPreview ? <PlayerButton onClick={fromPlayer(setStart)} disabled={job.busy} /> : undefined}
            />
            <TimeInput
              label="End"
              value={end}
              max={duration}
              onChange={setEnd}
              disabled={job.busy}
              action={media.info?.hasPreview ? <PlayerButton onClick={fromPlayer(setEnd)} disabled={job.busy} /> : undefined}
            />
          </div>
          <SegmentBar duration={duration} start={start} end={end} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fade in" hint="0 = no fade">
              <NumberInput value={fadeIn} onChange={setFadeIn} min={0} max={10} step={0.5} suffix="sec" disabled={job.busy} />
            </Field>
            <Field label="Fade out" hint="0 = no fade">
              <NumberInput value={fadeOut} onChange={setFadeOut} min={0} max={10} step={0.5} suffix="sec" disabled={job.busy} />
            </Field>
          </div>
          <OptionPicker
            label="Output format"
            value={format}
            onChange={setFormat}
            disabled={job.busy}
            options={[
              { value: "mp3", label: "MP3" },
              { value: "m4a", label: "M4A" },
              { value: "wav", label: "WAV" },
            ]}
          />
          <JobPanel
            job={job}
            originalSize={media.file.size}
            preview="audio"
            actionLabel="Cut audio"
            processingLabel="Cutting audio…"
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
