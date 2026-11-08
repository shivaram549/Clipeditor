/** Human-readable byte size, e.g. 1536 -> "1.5 KB". */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} ${units[i]}`;
}

/** Seconds -> "m:ss.s" or "h:mm:ss.s". */
export function formatTime(seconds: number, decimals = 1): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds - h * 3600 - m * 60;
  const sStr = s.toFixed(decimals).padStart(decimals > 0 ? 3 + decimals : 2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sStr}` : `${m}:${sStr}`;
}

/**
 * Parse a user-entered timestamp. Accepts "12", "12.5", "1:05", "1:05.25", "01:02:03.5".
 * Returns seconds, or null when the input isn't a valid time.
 */
export function parseTime(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(":");
  if (parts.length > 3) return null;
  let total = 0;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i] ?? "";
    const isLast = i === parts.length - 1;
    const pattern = isLast ? /^\d+(\.\d+)?$/ : /^\d+$/;
    if (!pattern.test(part)) return null;
    const value = Number(part);
    if (!isLast && i > 0 && value >= 60) return null;
    if (isLast && parts.length > 1 && value >= 60) return null;
    total = total * 60 + value;
  }
  return total;
}

/** Percentage change from original to output size, negative = smaller. */
export function sizeChangePercent(original: number, output: number): number {
  if (original <= 0) return 0;
  return ((output - original) / original) * 100;
}

export function getExtension(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx > 0 ? name.slice(idx + 1).toLowerCase() : "";
}

export function getBaseName(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx > 0 ? name.slice(0, idx) : name;
}

/** "holiday.mov" + ("trimmed", "mp4") -> "holiday-trimmed.mp4" */
export function buildOutputName(original: string, suffix: string, ext: string): string {
  const base = getBaseName(original).replace(/[\\/:*?"<>|]+/g, "_") || "output";
  return `${base}${suffix ? `-${suffix}` : ""}.${ext}`;
}
