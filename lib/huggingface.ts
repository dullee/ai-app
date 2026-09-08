import { InferenceClient } from "@huggingface/inference";
import { MODELS } from "@/lib/models";

export const HF_MODELS = {
  imageGeneration: MODELS.imageGeneration,
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
