import { InferenceClient } from "@huggingface/inference";
 
/** Optional Hugging Face client for future provider experiments. */
export function getHfClient() {
  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new Error(
      "Missing HF_TOKEN. Add a Hugging Face token with Inference Providers permission to .env.local.",
    );
  }
  return new InferenceClient(token);
}
