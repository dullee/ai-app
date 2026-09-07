import { InferenceClient } from "@huggingface/inference";

export const HF_MODELS = {
  ingredients: "Dizex/FoodBaseBERT-NER",
  imageGeneration: "stabilityai/stable-diffusion-3-medium-diffusers",
  imageCaptioning: "nlpconnect/vit-gpt2-image-captioning",
} as const;

export function getHfClient() {
  const token = process.env.HF_TOKEN;
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
