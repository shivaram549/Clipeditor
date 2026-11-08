/**
 * Shared, lazily-loaded ffmpeg.wasm engine. Browser-only: every entry point dynamically
 * imports @ffmpeg/ffmpeg, so nothing here runs during SSR.
 *
 * Only the engine binary is downloaded (from a public CDN). User files are written to the
 * in-memory WASM filesystem and never leave the device.
 */
import type { FFmpeg } from "@ffmpeg/ffmpeg";

const CORE_VERSION = "0.12.10";
const CORE_BASE = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/esm`;
const APPROX_CORE_BYTES = 32_200_000; // fallback when the CDN omits Content-Length

export type EngineStatus = "idle" | "loading" | "ready" | "error";
export interface EngineState {
  status: EngineStatus;
  progress: number; // 0-100 while downloading
  error?: string | undefined;
}

let state: EngineState = { status: "idle", progress: 0 };
const SERVER_STATE: EngineState = { status: "idle", progress: 0 };
const listeners = new Set<() => void>();

function setState(patch: Partial<EngineState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export const engineStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => state,
  getServerSnapshot: () => SERVER_STATE,
};

let instance: FFmpeg | null = null;
let loadingPromise: Promise<FFmpeg> | null = null;
let busy = false;

async function fetchToBlobURL(
  url: string,
  mime: string,
  onBytes: (received: number, total: number | null) => void,
): Promise<string> {
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`Failed to download engine (${res.status})`);
  const lengthHeader = res.headers.get("content-length");
  const encoded = res.headers.get("content-encoding");
  const total = lengthHeader && !encoded ? Number(lengthHeader) : null;
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onBytes(received, total);
  }
  return URL.createObjectURL(new Blob(chunks as BlobPart[], { type: mime }));
}

export function isEngineReady() {
  return instance !== null;
}

export function loadFFmpeg(): Promise<FFmpeg> {
  if (instance) return Promise.resolve(instance);
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    setState({ status: "loading", progress: 0, error: undefined });
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const ffmpeg = new FFmpeg();

    let jsBytes = 0;
    let wasmBytes = 0;
    let wasmTotal: number | null = null;
    const report = () => {
      const total = (wasmTotal ?? APPROX_CORE_BYTES) + 120_000;
      const pct = Math.min(99, ((jsBytes + wasmBytes) / total) * 100);
      setState({ progress: Math.round(pct) });
    };

    const [coreURL, wasmURL] = await Promise.all([
      fetchToBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript", (r) => {
        jsBytes = r;
        report();
      }),
      fetchToBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm", (r, t) => {
        wasmBytes = r;
        wasmTotal = t;
        report();
      }),
    ]);

    await ffmpeg.load({ coreURL, wasmURL });
    instance = ffmpeg;
    setState({ status: "ready", progress: 100 });
    return ffmpeg;
  })().catch((err: unknown) => {
    loadingPromise = null;
    const message = err instanceof Error ? err.message : String(err);
    setState({ status: "error", error: message });
    throw new Error(`Couldn't load the processing engine: ${message}`);
  });

  return loadingPromise;
}

export class CancelledError extends Error {
  constructor() {
    super("Cancelled");
    this.name = "CancelledError";
  }
}

let cancelRequested = false;

/** Abort the running job. The worker is terminated and the engine reloads on next use. */
export function cancelFFmpeg() {
  if (!instance || !busy) return;
  cancelRequested = true;
  try {
    instance.terminate();
  } catch {
    // ignore
  }
  instance = null;
  loadingPromise = null;
  busy = false;
  setState({ status: "idle", progress: 0 });
}

function parseLogTime(message: string): number | null {
  const m = /time=\s*(-?\d+):(\d+):(\d+(?:\.\d+)?)/.exec(message);
  if (!m) return null;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

function summarizeError(logs: string[]): string {
  const all = logs.join("\n");
  if (/matches no streams|does not contain any stream|Output file .* does not contain/i.test(all)) {
    return "This file doesn't contain the stream needed for this tool (for example, no audio track).";
  }
  if (/Invalid data found when processing input/i.test(all)) {
    return "This file looks damaged or isn't a supported media format.";
  }
  if (/memory access out of bounds|Out of memory|Cannot allocate memory/i.test(all)) {
    return "The file is too large to process in the browser. Try a shorter or smaller file.";
  }
  const interesting = logs
    .filter((l) => /error|invalid|could not|not found|unsupported|no such|does not contain|failed/i.test(l))
    .slice(-3);
  if (interesting.length) return interesting.join(" · ");
  return logs.slice(-2).join(" · ") || "Processing failed";
}

export interface RunOptions {
  file: File;
  /** Builds argv given the virtual input and output names. */
  args: (input: string, output: string) => string[];
  outputExt: string;
  /** Expected output duration in seconds, used for accurate progress. */
  expectedDuration?: number | null | undefined;
  onEngine?: () => void;
  onProgress?: (fraction: number) => void;
  /** Receives every FFmpeg log line (e.g. to read stream codecs). */
  onLog?: ((message: string) => void) | undefined;
}

export async function runFFmpeg(opts: RunOptions): Promise<Uint8Array> {
  if (!isEngineReady()) opts.onEngine?.();
  const ffmpeg = await loadFFmpeg();
  if (busy) throw new Error("Another file is still processing. Please wait for it to finish.");

  busy = true;
  cancelRequested = false;
  const inExt = (opts.file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const inputName = `input.${inExt || "bin"}`;
  const outputName = `output.${opts.outputExt}`;
  const logs: string[] = [];
  const duration = opts.expectedDuration && opts.expectedDuration > 0 ? opts.expectedDuration : null;

  const onLog = ({ message }: { message: string }) => {
    logs.push(message);
    if (logs.length > 80) logs.shift();
    opts.onLog?.(message);
    if (duration) {
      const t = parseLogTime(message);
      if (t !== null && t >= 0) opts.onProgress?.(Math.min(0.99, t / duration));
    }
  };
  const onProg = ({ progress }: { progress: number }) => {
    if (!duration && progress >= 0 && progress <= 1) opts.onProgress?.(Math.min(0.99, progress));
  };

  ffmpeg.on("log", onLog);
  ffmpeg.on("progress", onProg);
  try {
    opts.onProgress?.(0);
    await ffmpeg.writeFile(inputName, new Uint8Array(await opts.file.arrayBuffer()));
    const code = await ffmpeg.exec(opts.args(inputName, outputName));
    if (code !== 0) throw new Error(summarizeError(logs));
    const data = await ffmpeg.readFile(outputName);
    if (typeof data === "string" || data.length === 0) throw new Error(summarizeError(logs));
    opts.onProgress?.(1);
    return data;
  } catch (err) {
    if (cancelRequested) throw new CancelledError();
    throw err;
  } finally {
    if (!cancelRequested && instance) {
      ffmpeg.off("log", onLog);
      ffmpeg.off("progress", onProg);
      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outputName).catch(() => {});
    }
    busy = false;
    cancelRequested = false;
  }
}

export function toBlob(data: Uint8Array, mime: string): Blob {
  return new Blob([new Uint8Array(data)], { type: mime });
}
