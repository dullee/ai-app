/** Shared model ids for API routes and UI labels. */
export const MODELS = {
  gemini: "gemini-3.6-flash",
  /** Native Gemini image model (text models cannot emit inline image data). */
  geminiImage: "gemini-2.5-flash-image",
  /** Free FLUX.1-schnell via Pollinations (no API key / no paid credits). */
  imageGeneration: "black-forest-labs/FLUX.1-schnell",
} as const;
