import { FileSummary } from "@/components/FileSummary";
import { FileUploader } from "@/components/FileUploader";
import { JobPanel } from "@/components/JobPanel";
import { MediaPreview } from "@/components/MediaPreview";
import { ToolLayout } from "@/components/ToolLayout";
import { ffmpegCallbacks, useJob } from "@/hooks/use-job";
import { useMediaFile } from "@/hooks/use-media-file";
import { CancelledError, runFFmpeg, toBlob } from "@/lib/ffmpeg";
import { removeAudioArgs } from "@/lib/ffmpeg-args";
import { buildOutputName, formatTime, getExtension } from "@/lib/format";
import { mimeForExt, VIDEO_EXTS } from "@/lib/media";
import { getLiveTool } from "@/lib/tools";

const tool = getLiveTool("remove-audio");

export function RemoveAudio() {
  const media = useMediaFile("video");
  const job = useJob();

  const process = () => {
    const file = media.file;
    if (!file) return;
    job.run(async (ctx) => {
      const ext = getExtension(file.name) || "mp4";
      try {
        const data = await runFFmpeg({
          file,
          outputExt: ext,
          expectedDuration: media.info?.duration,
          args: (input, output) => removeAudioArgs({ input, output, reencode: false }),
          ...ffmpegCallbacks(ctx),
        });
        return {
          blob: toBlob(data, mimeForExt(ext)),
          filename: buildOutputName(file.name, "muted", ext),
          note: "Video stream copied without re-encoding — no quality loss.",
        };
      } catch (err) {
        if (err instanceof CancelledError) throw err;
        const data = await runFFmpeg({
          file,
          outputExt: "mp4",
          expectedDuration: media.info?.duration,
          args: (input, output) => removeAudioArgs({ input, output, reencode: true }),
          ...ffmpegCallbacks(ctx),
        });
        return {
          blob: toBlob(data, "video/mp4"),
          filename: buildOutputName(file.name, "muted", "mp4"),
          note: "This format needed a re-encode, so the output is an MP4.",
        };
      }
    });
  };

  return (
    <ToolLayout tool={tool}>
      {!media.file ? (
        <FileUploader
          extensions={VIDEO_EXTS}
          mimePrefix="video/"
          label="Drop a video to mute"
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
          {media.info && job.phase !== "done" && (
            <MediaPreview file={media.file} kind="video" playable={media.info.hasPreview} />
          )}
          <JobPanel
            job={job}
            originalSize={media.file.size}
            preview="video"
            actionLabel="Remove audio"
            processingLabel="Removing audio…"
            onStart={process}
            onReset={job.reset}
            disabled={media.probing}
          />
        </div>
      )}
    </ToolLayout>
  );
}
