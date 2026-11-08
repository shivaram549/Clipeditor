import {
  AudioLines,
  AudioWaveform,
  Captions,
  Combine,
  FileImage,
  FileVideo,
  Film,
  ImageDown,
  ImageMinus,
  Images,
  Maximize2,
  Music,
  Repeat,
  Scaling,
  Scissors,
  Shrink,
  Sparkles,
  VolumeX,
  Wand2,
  type LucideIcon,
} from "lucide-react";

export type Category = "video" | "audio" | "photo";

export type LivePath =
  | "/video/trim"
  | "/video/compress"
  | "/video/to-gif"
  | "/video/convert-to-mp4"
  | "/video/remove-audio"
  | "/video/extract-audio"
  | "/audio/converter"
  | "/audio/cutter"
  | "/photo/compress"
  | "/photo/resize"
  | "/photo/convert"
  | "/photo/heic-to-jpg";

interface BaseTool {
  id: string;
  title: string;
  short: string;
  description: string;
  category: Category;
  icon: LucideIcon;
  tips?: string[];
}

export interface LiveTool extends BaseTool {
  status: "live";
  path: LivePath;
}

export interface SoonTool extends BaseTool {
  status: "soon";
  slug: string;
}

export type Tool = LiveTool | SoonTool;

export const CATEGORIES: Record<Category, { label: string; title: string; blurb: string; icon: LucideIcon }> = {
  video: {
    label: "Video",
    title: "Video tools",
    blurb: "Trim, compress, convert and repackage clips without waiting on an upload.",
    icon: FileVideo,
  },
  audio: {
    label: "Audio",
    title: "Audio tools",
    blurb: "Convert formats and cut tracks with smooth fades, right in your browser.",
    icon: Music,
  },
  photo: {
    label: "Photo",
    title: "Photo tools",
    blurb: "Shrink, resize and convert images — iPhone HEIC photos included.",
    icon: FileImage,
  },
};

export const TOOLS: Tool[] = [
  {
    id: "trim-video",
    status: "live",
    path: "/video/trim",
    category: "video",
    icon: Scissors,
    title: "Trim Video",
    short: "Cut a clip to exact start and end times.",
    description:
      "Pick a start and end point and export just that section. Fast mode copies the stream with no quality loss; Accurate mode re-encodes for frame-exact cuts.",
    tips: [
      "Fast mode snaps to the nearest keyframe, so cuts may shift by a second or so.",
      "Use Accurate mode when the exact frame matters — it's slower because it re-encodes.",
    ],
  },
  {
    id: "compress-video",
    status: "live",
    path: "/video/compress",
    category: "video",
    icon: Shrink,
    title: "Compress Video",
    short: "Make videos smaller for sharing and email.",
    description: "Re-encode with H.264 using a preset tuned for size or quality. Output is a widely compatible MP4.",
    tips: [
      "Compression runs on your CPU — a 1-minute 1080p clip usually takes a minute or two.",
      "'Smaller' caps resolution at 720p, which is where most of the savings come from.",
    ],
  },
  {
    id: "video-to-gif",
    status: "live",
    path: "/video/to-gif",
    category: "video",
    icon: Film,
    title: "Video to GIF",
    short: "Turn a moment into a looping GIF.",
    description: "Choose a start time, length, frame rate and width. Uses an optimized color palette for crisp GIFs.",
    tips: ["Keep GIFs short (2–6 s) and narrow (320–480 px) for small files.", "10–15 FPS looks smooth for most clips."],
  },
  {
    id: "convert-to-mp4",
    status: "live",
    path: "/video/convert-to-mp4",
    category: "video",
    icon: Repeat,
    title: "Convert to MP4",
    short: "MOV, WebM, MKV, AVI → MP4.",
    description: "Convert almost any video into an MP4 that plays everywhere. Try the instant remux first, re-encode if needed.",
    tips: [
      "Quick remux works when the video is already H.264 — it takes seconds and keeps full quality.",
      "If quick remux fails, we automatically fall back to a full re-encode.",
    ],
  },
  {
    id: "remove-audio",
    status: "live",
    path: "/video/remove-audio",
    category: "video",
    icon: VolumeX,
    title: "Remove Audio",
    short: "Mute a video without re-encoding.",
    description: "Strip every audio track from a video. The picture is copied as-is, so it's near-instant with zero quality loss.",
  },
  {
    id: "extract-audio",
    status: "live",
    path: "/video/extract-audio",
    category: "video",
    icon: AudioLines,
    title: "Extract Audio",
    short: "Save the soundtrack as MP3 or WAV.",
    description: "Pull the audio out of any video and export it as a compact MP3 or a lossless WAV.",
  },
  {
    id: "audio-converter",
    status: "live",
    path: "/audio/converter",
    category: "audio",
    icon: AudioWaveform,
    title: "Audio Converter",
    short: "Convert to MP3, WAV or M4A.",
    description: "Convert between common audio formats — FLAC, OGG, WAV, AAC and more — with your choice of bitrate.",
  },
  {
    id: "audio-cutter",
    status: "live",
    path: "/audio/cutter",
    category: "audio",
    icon: Scissors,
    title: "Audio Cutter",
    short: "Trim tracks with fade in and out.",
    description: "Cut a section from any audio file and add optional fades for a clean start and finish. Great for ringtones.",
  },
  {
    id: "compress-image",
    status: "live",
    path: "/photo/compress",
    category: "photo",
    icon: ImageDown,
    title: "Compress Image",
    short: "Shrink JPG, PNG and WebP files.",
    description: "Reduce image file size with a quality slider and optional max dimension. Preview the result before saving.",
  },
  {
    id: "resize-image",
    status: "live",
    path: "/photo/resize",
    category: "photo",
    icon: Scaling,
    title: "Resize Image",
    short: "Set exact pixels or a percentage.",
    description: "Resize photos to precise dimensions or by percentage, with aspect ratio lock.",
  },
  {
    id: "convert-image",
    status: "live",
    path: "/photo/convert",
    category: "photo",
    icon: Images,
    title: "Convert Image",
    short: "JPG ↔ PNG ↔ WebP.",
    description: "Switch an image between JPG, PNG and WebP. Transparent areas are flattened onto white for JPG.",
  },
  {
    id: "heic-to-jpg",
    status: "live",
    path: "/photo/heic-to-jpg",
    category: "photo",
    icon: FileImage,
    title: "HEIC to JPG",
    short: "Open iPhone photos anywhere.",
    description: "Convert Apple HEIC/HEIF photos into universally supported JPG or PNG files.",
  },
  {
    id: "merge-videos",
    status: "soon",
    slug: "merge-videos",
    category: "video",
    icon: Combine,
    title: "Merge Videos",
    short: "Join several clips into one.",
    description: "Combine multiple clips in order into a single video.",
  },
  {
    id: "resize-video",
    status: "soon",
    slug: "resize-video",
    category: "video",
    icon: Maximize2,
    title: "Resize & Crop for Social",
    short: "9:16, 1:1 and 16:9 in one click.",
    description: "Reframe videos for Reels, Shorts, TikTok and YouTube with smart padding or cropping.",
  },
  {
    id: "ai-subtitles",
    status: "soon",
    slug: "ai-subtitles",
    category: "video",
    icon: Captions,
    title: "AI Subtitles",
    short: "Auto-generate captions on-device.",
    description: "Transcribe speech and burn in or export captions — powered by an on-device speech model.",
  },
  {
    id: "noise-removal",
    status: "soon",
    slug: "noise-removal",
    category: "audio",
    icon: Wand2,
    title: "AI Noise Removal",
    short: "Clean up hiss and background hum.",
    description: "Reduce background noise in voice recordings using an in-browser denoising model.",
  },
  {
    id: "background-remover",
    status: "soon",
    slug: "background-remover",
    category: "photo",
    icon: ImageMinus,
    title: "AI Background Remover",
    short: "Cut out subjects automatically.",
    description: "Remove photo backgrounds with an on-device segmentation model — no uploads.",
  },
  {
    id: "upscale-image",
    status: "soon",
    slug: "upscale-image",
    category: "photo",
    icon: Sparkles,
    title: "AI Image Upscaler",
    short: "Enlarge photos 2× or 4×.",
    description: "Increase resolution while keeping details sharp, using an in-browser super-resolution model.",
  },
];

export function getTool(id: string): Tool {
  const tool = TOOLS.find((t) => t.id === id);
  if (!tool) throw new Error(`Unknown tool: ${id}`);
  return tool;
}

export function getLiveTool(id: string): LiveTool {
  const tool = getTool(id);
  if (tool.status !== "live") throw new Error(`Tool is not live: ${id}`);
  return tool;
}

export function toolsIn(category: Category): Tool[] {
  return TOOLS.filter((t) => t.category === category);
}

export function soonTool(slug: string): SoonTool | undefined {
  return TOOLS.find((t): t is SoonTool => t.status === "soon" && t.slug === slug);
}
