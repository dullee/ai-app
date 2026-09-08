import { NextResponse } from "next/server";
import { generateImageWithGemini, GEMINI_IMAGE_MODEL } from "@/lib/gemini";
import { getHfClient, HF_MODELS } from "@/lib/huggingface";
import { MODELS } from "@/lib/models";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { prompt?: string; model?: string };
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const useGemini =
      body.model === MODELS.geminiImage || body.model === MODELS.gemini;

    // #region agent log
    fetch("http://127.0.0.1:7279/ingest/bde6b2fd-c416-4e63-9fe5-5406a4b68fef", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "7beae3",
      },
      body: JSON.stringify({
        sessionId: "7beae3",
        runId: "post-fix",
        hypothesisId: "B",
        location: "app/api/generate-image/route.ts:branch",
        message: "Image generation branch selected",
        data: {
          requestedModel: body.model ?? null,
          useGemini,
          geminiImageModel: MODELS.geminiImage,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    if (useGemini) {
      const image = await generateImageWithGemini(prompt);
      return NextResponse.json({ image, model: GEMINI_IMAGE_MODEL });
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
