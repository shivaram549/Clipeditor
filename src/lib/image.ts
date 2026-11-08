/** Canvas-based image processing. Browser-only; call from event handlers. */

export type ImageFormat = "jpeg" | "png" | "webp";

export const IMAGE_FORMATS: Record<ImageFormat, { mime: string; ext: string; label: string; lossy: boolean }> = {
  jpeg: { mime: "image/jpeg", ext: "jpg", label: "JPG", lossy: true },
  png: { mime: "image/png", ext: "png", label: "PNG", lossy: false },
  webp: { mime: "image/webp", ext: "webp", label: "WebP", lossy: true },
};

export function formatFromFile(file: File): ImageFormat | null {
  if (file.type === "image/jpeg" || /\.jpe?g$/i.test(file.name)) return "jpeg";
  if (file.type === "image/png" || /\.png$/i.test(file.name)) return "png";
  if (file.type === "image/webp" || /\.webp$/i.test(file.name)) return "webp";
  return null;
}

export interface LoadedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
}

export async function loadImage(file: Blob): Promise<LoadedImage> {
  try {
    const bitmap = await createImageBitmap(file);
    return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.decoding = "async";
      img.src = url;
      await img.decode();
      return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => {} };
    } catch {
      throw new Error("This image couldn't be read by your browser.");
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

/** Read just the pixel dimensions of an image. */
export async function getImageSize(file: Blob): Promise<{ width: number; height: number } | null> {
  try {
    const img = await loadImage(file);
    const size = { width: img.width, height: img.height };
    img.close();
    return size;
  } catch {
    return null;
  }
}

export async function renderImage(opts: {
  image: LoadedImage;
  width: number;
  height: number;
  format: ImageFormat;
  quality: number; // 0-1
}): Promise<Blob> {
  const { image, format } = opts;
  const width = Math.max(1, Math.round(opts.width));
  const height = Math.max(1, Math.round(opts.height));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if (format === "jpeg") {
    // JPG has no transparency: flatten onto white instead of black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(image.source, 0, 0, width, height);
  const mime = IMAGE_FORMATS[format].mime;
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mime, IMAGE_FORMATS[format].lossy ? opts.quality : undefined),
  );
  if (!blob) throw new Error("Couldn't encode the image.");
  if (blob.type !== mime) {
    throw new Error(`Your browser can't export ${IMAGE_FORMATS[format].label}. Try another format.`);
  }
  return blob;
}

/** Scale (w, h) down so the longest side is at most `max`. */
export function fitWithin(width: number, height: number, max: number | null) {
  if (!max || (width <= max && height <= max)) return { width, height };
  const ratio = width >= height ? max / width : max / height;
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
}
