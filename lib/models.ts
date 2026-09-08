/** Shared model ids for API routes and UI labels. */
export const MODELS = {
  gemini: "gemini-3.6-flash",
  /** Native Gemini image model (text models cannot emit inline image data). */
  geminiImage: "gemini-2.5-flash-image",
  imageGeneration: "stabilityai/stable-diffusion-3-medium-diffusers",
} as const;
