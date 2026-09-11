import { InferenceClient } from "@huggingface/inference";
import { MODELS } from "@/lib/models";

export const HF_MODELS = {
  stableDiffusion: MODELS.stableDiffusion,
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

export async function generateImageWithStableDiffusion(
  prompt: string,
): Promise<string> {
  const client = getHfClient();
  const image = await client.textToImage(
    {
      provider: "hf-inference",
      model: HF_MODELS.stableDiffusion,
      inputs: prompt,
      parameters: { num_inference_steps: 5 },
    },
    { outputType: "dataUrl" },
  );

  if (typeof image !== "string" || !image) {
    throw new Error("Stable Diffusion returned an empty image.");
  }

  return image;
}
