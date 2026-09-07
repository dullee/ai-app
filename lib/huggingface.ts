import { InferenceClient } from "@huggingface/inference";

export const HF_MODELS = {
  ingredients: "Dizex/FoodBaseBERT-NER",
  imageGeneration: "stabilityai/stable-diffusion-3-medium-diffusers",
  imageCaptioning: "nlpconnect/vit-gpt2-image-captioning",
} as const;

export function getHfClient() {
  const token = process.env.HF_TOKEN;
  // #region agent log
  fetch("http://127.0.0.1:7548/ingest/aef0c8cc-dedd-4831-820e-19f79c516ddd", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "f50d1d",
    },
    body: JSON.stringify({
      sessionId: "f50d1d",
      runId: "post-fix",
      hypothesisId: "C",
      location: "lib/huggingface.ts:getHfClient",
      message: "HF env visibility at runtime",
      data: {
        hfTokenDefined: token !== undefined,
        hfTokenType: typeof token,
        hfTokenLength: token?.length ?? 0,
        hfTokenTrimLength: token?.trim().length ?? 0,
        hasHuggingFaceHubToken: Boolean(process.env.HUGGINGFACEHUB_API_TOKEN),
        hasHuggingFaceToken: Boolean(process.env.HUGGINGFACE_TOKEN),
        hasHfApiToken: Boolean(process.env.HF_API_TOKEN),
        geminiKeyLoaded: Boolean(process.env.GEMINI_API_KEY),
        nodeEnv: process.env.NODE_ENV,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  try {
    const fs = require("node:fs") as typeof import("node:fs");
    fs.appendFileSync(
      "/Users/dulguun/Desktop/ai-app/.cursor/debug-f50d1d.log",
      JSON.stringify({
        sessionId: "f50d1d",
        runId: "post-fix",
        hypothesisId: "C",
        location: "lib/huggingface.ts:getHfClient",
        message: "HF env visibility at runtime (fs)",
        data: {
          hfTokenDefined: token !== undefined,
          hfTokenLength: token?.length ?? 0,
          hfTokenTrimLength: token?.trim().length ?? 0,
          geminiKeyLoaded: Boolean(process.env.GEMINI_API_KEY),
        },
        timestamp: Date.now(),
      }) + "\n",
    );
  } catch {
    /* ignore */
  }
  // #endregion
  if (!token) {
    throw new Error(
      "Missing HF_TOKEN. Add a Hugging Face token with Inference Providers permission to .env.local.",
    );
  }
  return new InferenceClient(token);
}

export type NerEntity = {
  entity_group?: string;
  entity?: string;
  word: string;
  score: number;
  start?: number;
  end?: number;
};

/** Merge subword / BIO NER tokens into unique ingredient labels. */
export function extractFoodIngredients(entities: NerEntity[]): string[] {
  const foods: string[] = [];
  let current = "";

  for (const entity of entities) {
    const label = (entity.entity_group || entity.entity || "").toUpperCase();
    if (!label.includes("FOOD")) continue;

    const word = entity.word.replace(/^##/, "");
    if (entity.word.startsWith("##") && current) {
      current += word;
    } else {
      if (current) foods.push(current.trim());
      current = word;
    }
  }

  if (current) foods.push(current.trim());

  return [...new Set(foods.map((f) => f.toLowerCase()).filter(Boolean))];
}
