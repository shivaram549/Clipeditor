import { describe, expect, it } from "vitest";

import {
  COMPRESS_PRESETS,
  compressArgs,
  cutAudioArgs,
  extractAudioArgs,
  gifArgs,
  removeAudioArgs,
  toMp4Args,
  trimArgs,
} from "./ffmpeg-args";

describe("trimArgs", () => {
  it("fast mode stream-copies without re-encoding", () => {
    const args = trimArgs({ input: "in.mp4", output: "out.mp4", start: 5, end: 12.5, mode: "fast" });
    expect(args).toContain("copy");
    expect(args).not.toContain("libx264");
    expect(args.slice(0, 6)).toEqual(["-ss", "5.000", "-i", "in.mp4", "-t", "7.500"]);
  });

  it("accurate mode re-encodes to H.264", () => {
    const args = trimArgs({ input: "in.mov", output: "out.mp4", start: 1, end: 3, mode: "accurate" });
    expect(args).toContain("libx264");
    expect(args).not.toContain("copy");
  });
});

describe("compress presets", () => {
  it("Smaller caps at 720p, Balanced at 1080p, Higher quality keeps resolution", () => {
    expect(COMPRESS_PRESETS.smaller.maxHeight).toBe(720);
    expect(COMPRESS_PRESETS.balanced.maxHeight).toBe(1080);
    expect(COMPRESS_PRESETS.quality.maxHeight).toBeNull();
  });

  it("smaller preset uses a higher CRF than higher quality", () => {
    expect(COMPRESS_PRESETS.smaller.crf).toBeGreaterThan(COMPRESS_PRESETS.balanced.crf);
    expect(COMPRESS_PRESETS.balanced.crf).toBeGreaterThan(COMPRESS_PRESETS.quality.crf);
    const args = compressArgs({ input: "a.mp4", output: "b.mp4", preset: "smaller" });
    expect(args[args.indexOf("-crf") + 1]).toBe("32");
  });
});

describe("gifArgs", () => {
  it("applies fps, width and palette generation", () => {
    const args = gifArgs({ input: "in.mp4", output: "out.gif", start: 2, duration: 4, fps: 12, width: 480 });
    const filter = args[args.indexOf("-filter_complex") + 1];
    expect(filter).toContain("fps=12");
    expect(filter).toContain("scale=480:-1");
    expect(filter).toContain("palettegen");
    expect(args[args.indexOf("-t") + 1]).toBe("4.000");
  });
});

describe("toMp4Args", () => {
  it("copy mode remuxes everything", () => {
    expect(toMp4Args({ input: "a.mkv", output: "b.mp4", mode: "copy" })).toContain("copy");
  });
  it("encode mode uses H.264 + AAC", () => {
    const args = toMp4Args({ input: "a.webm", output: "b.mp4", mode: "encode" });
    expect(args).toContain("libx264");
    expect(args).toContain("aac");
  });
});

describe("removeAudioArgs", () => {
  it("drops audio and copies video when not re-encoding", () => {
    const args = removeAudioArgs({ input: "a.mp4", output: "b.mp4", reencode: false });
    expect(args).toContain("-an");
    expect(args[args.indexOf("-c:v") + 1]).toBe("copy");
  });
});

describe("audio args", () => {
  it("extracts MP3 with the chosen bitrate", () => {
    const args = extractAudioArgs({ input: "a.mp4", output: "b.mp3", format: "mp3", bitrateKbps: 320 });
    expect(args).toContain("-vn");
    expect(args).toContain("libmp3lame");
    expect(args).toContain("320k");
  });

  it("extracts WAV as 16-bit PCM", () => {
    const args = extractAudioArgs({ input: "a.mp4", output: "b.wav", format: "wav", bitrateKbps: 192 });
    expect(args).toContain("pcm_s16le");
  });

  it("cutter places fade-out at the end of the selection", () => {
    const args = cutAudioArgs({
      input: "a.mp3",
      output: "b.mp3",
      start: 10,
      end: 20,
      fadeIn: 1,
      fadeOut: 2,
      format: "mp3",
      bitrateKbps: 192,
    });
    const af = args[args.indexOf("-af") + 1];
    expect(af).toBe("afade=t=in:st=0:d=1.00,afade=t=out:st=8.000:d=2.00");
  });

  it("cutter adds no filter when fades are zero", () => {
    const args = cutAudioArgs({
      input: "a.mp3",
      output: "b.wav",
      start: 0,
      end: 5,
      fadeIn: 0,
      fadeOut: 0,
      format: "wav",
      bitrateKbps: 192,
    });
    expect(args).not.toContain("-af");
  });
});
