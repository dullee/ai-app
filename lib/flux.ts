import { MODELS } from "@/lib/models";

export const FLUX_MODEL = MODELS.imageGeneration;

/**
 * Free text-to-image using Pollinations' Flux endpoint (FLUX.1-schnell family).
 * No API key and no paid credits required.
 */
export async function generateImageWithFlux(prompt: string): Promise<string> {
  const url = new URL(
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`,
  );
  url.searchParams.set("model", "flux");
  url.searchParams.set("width", "1024");
  url.searchParams.set("height", "1024");
  url.searchParams.set("nologo", "true");
  url.searchParams.set("private", "true");

  const response = await fetch(url, {
    headers: {
      Accept: "image/*",
      // Cloudflare blocks default Node/undici user agents on Pollinations.
      "User-Agent":
        "Mozilla/5.0 (compatible; AIDemoApp/1.0; +http://localhost)",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Flux image generation failed (${response.status} ${response.statusText}).`,
    );
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length) {
    throw new Error("Flux returned an empty image.");
  }

  const mimeType = response.headers.get("content-type") || "image/jpeg";
  return `data:${mimeType};base64,${bytes.toString("base64")}`;
}
