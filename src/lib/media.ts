import { getExtension } from "./format";

export const MIME_BY_EXT: Record<string, string> = {
  mp4: "video/mp4",
  m4v: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  mkv: "video/x-matroska",
  avi: "video/x-msvideo",
  gif: "image/gif",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  m4a: "audio/mp4",
  aac: "audio/aac",
  ogg: "audio/ogg",
  opus: "audio/ogg",
  flac: "audio/flac",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export function mimeForExt(ext: string): string {
  return MIME_BY_EXT[ext.toLowerCase()] ?? "application/octet-stream";
}

export const VIDEO_EXTS = ["mp4", "mov", "webm", "mkv", "avi", "m4v", "3gp", "flv", "wmv", "mpeg", "mpg", "ts"];
export const AUDIO_EXTS = ["mp3", "wav", "m4a", "aac", "ogg", "opus", "flac", "wma", "aiff", "aif"];
export const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "avif"];
export const HEIC_EXTS = ["heic", "heif"];

export function matchesExt(file: File, exts: string[]): boolean {
  return exts.includes(getExtension(file.name));
}

export interface MediaInfo {
  duration: number | null;
  width?: number | undefined;
  height?: number | undefined;
  hasPreview: boolean;
}

/** Read duration/dimensions using the browser's media element. Resolves even if unsupported. */
export function probeMedia(file: File, kind: "video" | "audio"): Promise<MediaInfo> {
  return new Promise((resolve) => {
    const el = document.createElement(kind);
    const url = URL.createObjectURL(file);
    let settled = false;
    const finish = (info: MediaInfo) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      el.removeAttribute("src");
      resolve(info);
    };
    el.preload = "metadata";
    el.muted = true;
    el.onloadedmetadata = () => {
      const d = el.duration;
      if (!Number.isFinite(d)) {
        // WebM/MKV sometimes report Infinity until seeked far ahead.
        el.currentTime = 1e9;
        el.ontimeupdate = () => {
          el.ontimeupdate = null;
          finish({
            duration: Number.isFinite(el.duration) ? el.duration : null,
            width: kind === "video" ? (el as HTMLVideoElement).videoWidth : undefined,
            height: kind === "video" ? (el as HTMLVideoElement).videoHeight : undefined,
            hasPreview: true,
          });
        };
        return;
      }
      finish({
        duration: d,
        width: kind === "video" ? (el as HTMLVideoElement).videoWidth || undefined : undefined,
        height: kind === "video" ? (el as HTMLVideoElement).videoHeight || undefined : undefined,
        hasPreview: true,
      });
    };
    el.onerror = () => finish({ duration: null, hasPreview: false });
    setTimeout(() => finish({ duration: null, hasPreview: false }), 8000);
    el.src = url;
  });
}
