import { NextResponse } from "next/server";
import { getHfClient, HF_MODELS } from "@/lib/huggingface";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { prompt?: string };
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const client = getHfClient();
    const image = await client.textToImage(
      {
        provider: "hf-inference",
        model: HF_MODELS.imageGeneration,
        inputs: prompt,
        parameters: { num_inference_steps: 5 },
      },
      { outputType: "dataUrl" },
    );

    return NextResponse.json({
      image,
      model: HF_MODELS.imageGeneration,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Image generation failed.";
    const status = /loading|503/i.test(message) ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
