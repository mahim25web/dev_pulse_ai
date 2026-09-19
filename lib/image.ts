import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BASE64_CHARS } from "./limits";
import type { ImagePayload } from "./types";

export interface PickedImage extends ImagePayload {
  preview: string; // data URL for <img>
  name: string;
}

const MAX_DIMENSION = 1920;

/**
 * Downscales and re-encodes an image as JPEG so screenshots from retina displays
 * stay under the request size limit. Text in screenshots remains readable at 1920px.
 */
export async function fileToImage(file: File): Promise<PickedImage> {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    throw new Error("Use a PNG, JPEG, or WebP image.");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser cannot process images.");

  ctx.fillStyle = "#ffffff"; // transparent PNGs would turn black as JPEG
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const preview = canvas.toDataURL("image/jpeg", 0.9);
  const data = preview.split(",")[1];
  if (data.length > MAX_IMAGE_BASE64_CHARS) {
    throw new Error("That image is still too large. Crop the screenshot and try again.");
  }
  return { data, mimeType: "image/jpeg", preview, name: file.name || "screenshot" };
}

export function imageFromClipboard(e: React.ClipboardEvent): File | null {
  for (const item of Array.from(e.clipboardData.items)) {
    if (item.kind === "file" && item.type.startsWith("image/")) return item.getAsFile();
  }
  return null;
}
