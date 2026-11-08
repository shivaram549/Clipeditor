/**
 * Pure FFmpeg argument builders. Kept free of browser APIs so they can be unit-tested.
 * Every builder returns the full argv (without the leading "ffmpeg").
 */

export type TrimMode = "fast" | "accurate";

export function trimArgs(opts: {
  input: string;
  output: string;
  start: number;
  end: number;
  mode: TrimMode;
}): string[] {
  const duration = Math.max(0, opts.end - opts.start);
  const seek = ["-ss", opts.start.toFixed(3), "-i", opts.input, "-t", duration.toFixed(3)];
  if (opts.mode === "fast") {
    return [...seek, "-map", "0", "-c", "copy", "-avoid_negative_ts", "make_zero", opts.output];
  }
  return [
    ...seek,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "20",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "160k",
    "-movflags",
    "+faststart",
    opts.output,
  ];
}

export type CompressPreset = "smaller" | "balanced" | "quality";

export const COMPRESS_PRESETS: Record<
  CompressPreset,
  { crf: number; maxHeight: number | null; audioBitrate: string; label: string; description: string }
> = {
  smaller: {
    crf: 32,
    maxHeight: 720,
    audioBitrate: "96k",
    label: "Smaller",
    description: "Max 720p, strongest compression",
  },
  balanced: {
    crf: 27,
    maxHeight: 1080,
    audioBitrate: "128k",
    label: "Balanced",
    description: "Max 1080p, good quality",
  },
  quality: {
    crf: 23,
    maxHeight: null,
    audioBitrate: "160k",
    label: "Higher quality",
    description: "Original resolution, light compression",
  },
};

export function compressArgs(opts: { input: string; output: string; preset: CompressPreset }): string[] {
  const p = COMPRESS_PRESETS[opts.preset];
  const filters = p.maxHeight
    ? ["-vf", `scale=-2:'trunc(min(${p.maxHeight},ih)/2)*2'`]
    : ["-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2"];
  return [
    "-i",
    opts.input,
    ...filters,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    String(p.crf),
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    p.audioBitrate,
    "-movflags",
    "+faststart",
    opts.output,
  ];
}

export function gifArgs(opts: {
  input: string;
  output: string;
  start: number;
  duration: number;
  fps: number;
  width: number;
}): string[] {
  const filter = `fps=${opts.fps},scale=${opts.width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5`;
  return [
    "-ss",
    opts.start.toFixed(3),
    "-t",
    opts.duration.toFixed(3),
    "-i",
    opts.input,
    "-filter_complex",
    filter,
    "-loop",
    "0",
    opts.output,
  ];
}

/**
 * - "copy": remux streams untouched (instant, lossless).
 * - "copy-video": keep the video stream, re-encode audio to AAC.
 * - "encode": full H.264 + AAC re-encode.
 */
export type Mp4Mode = "copy" | "copy-video" | "encode";

export function toMp4Args(opts: { input: string; output: string; mode: Mp4Mode }): string[] {
  const map = ["-map", "0:v:0", "-map", "0:a:0?"];
  if (opts.mode === "copy") {
    return ["-i", opts.input, ...map, "-c", "copy", "-movflags", "+faststart", opts.output];
  }
  if (opts.mode === "copy-video") {
    return ["-i", opts.input, ...map, "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", opts.output];
  }
  return [
    "-i",
    opts.input,
    ...map,
    "-vf",
    "scale=trunc(iw/2)*2:trunc(ih/2)*2",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "23",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "160k",
    "-movflags",
    "+faststart",
    opts.output,
  ];
}

export function removeAudioArgs(opts: { input: string; output: string; reencode: boolean }): string[] {
  if (!opts.reencode) return ["-i", opts.input, "-map", "0:v", "-c:v", "copy", "-an", opts.output];
  return [
    "-i",
    opts.input,
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "20",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    opts.output,
  ];
}

export type AudioFormat = "mp3" | "wav" | "m4a";

export const AUDIO_FORMATS: Record<AudioFormat, { mime: string; label: string; lossy: boolean }> = {
  mp3: { mime: "audio/mpeg", label: "MP3", lossy: true },
  wav: { mime: "audio/wav", label: "WAV", lossy: false },
  m4a: { mime: "audio/mp4", label: "M4A (AAC)", lossy: true },
};

function audioCodecArgs(format: AudioFormat, bitrateKbps: number): string[] {
  switch (format) {
    case "mp3":
      return ["-c:a", "libmp3lame", "-b:a", `${bitrateKbps}k`];
    case "m4a":
      return ["-c:a", "aac", "-b:a", `${bitrateKbps}k`, "-movflags", "+faststart"];
    case "wav":
      return ["-c:a", "pcm_s16le"];
  }
}

export function extractAudioArgs(opts: {
  input: string;
  output: string;
  format: AudioFormat;
  bitrateKbps: number;
}): string[] {
  return ["-i", opts.input, "-vn", "-map", "0:a:0", ...audioCodecArgs(opts.format, opts.bitrateKbps), opts.output];
}

export function convertAudioArgs(opts: {
  input: string;
  output: string;
  format: AudioFormat;
  bitrateKbps: number;
}): string[] {
  return ["-i", opts.input, "-vn", "-map", "0:a:0", ...audioCodecArgs(opts.format, opts.bitrateKbps), opts.output];
}

export function cutAudioArgs(opts: {
  input: string;
  output: string;
  start: number;
  end: number;
  fadeIn: number;
  fadeOut: number;
  format: AudioFormat;
  bitrateKbps: number;
}): string[] {
  const duration = Math.max(0, opts.end - opts.start);
  const filters: string[] = [];
  if (opts.fadeIn > 0) filters.push(`afade=t=in:st=0:d=${Math.min(opts.fadeIn, duration).toFixed(2)}`);
  if (opts.fadeOut > 0) {
    const d = Math.min(opts.fadeOut, duration);
    filters.push(`afade=t=out:st=${Math.max(0, duration - d).toFixed(3)}:d=${d.toFixed(2)}`);
  }
  return [
    "-ss",
    opts.start.toFixed(3),
    "-t",
    duration.toFixed(3),
    "-i",
    opts.input,
    "-vn",
    "-map",
    "0:a:0",
    ...(filters.length ? ["-af", filters.join(",")] : []),
    ...audioCodecArgs(opts.format, opts.bitrateKbps),
    opts.output,
  ];
}
