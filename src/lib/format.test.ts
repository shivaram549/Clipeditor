import { describe, expect, it } from "vitest";

import { buildOutputName, formatBytes, parseTime } from "./format";

describe("parseTime", () => {
  it("accepts seconds, m:ss and h:mm:ss", () => {
    expect(parseTime("12")).toBe(12);
    expect(parseTime("12.5")).toBe(12.5);
    expect(parseTime("1:05")).toBe(65);
    expect(parseTime("1:05.25")).toBe(65.25);
    expect(parseTime("01:02:03.5")).toBe(3723.5);
  });

  it("rejects invalid input", () => {
    expect(parseTime("")).toBeNull();
    expect(parseTime("abc")).toBeNull();
    expect(parseTime("1:75")).toBeNull();
    expect(parseTime("1:2:3:4")).toBeNull();
  });
});

describe("buildOutputName", () => {
  it("keeps the original name and swaps the extension", () => {
    expect(buildOutputName("holiday.mov", "trimmed", "mp4")).toBe("holiday-trimmed.mp4");
    expect(buildOutputName("clip.webm", "", "gif")).toBe("clip.gif");
  });
});

describe("formatBytes", () => {
  it("formats sizes", () => {
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(1536)).toBe("1.50 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.00 MB");
  });
});
