import { NextResponse } from "next/server";
import { generateImageWithFlux, FLUX_MODEL } from "@/lib/flux";
import { generateImageWithGemini, GEMINI_IMAGE_MODEL } from "@/lib/gemini";
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

    if (useGemini) {
      const image = await generateImageWithGemini(prompt);
      return NextResponse.json({ image, model: GEMINI_IMAGE_MODEL });
    }

    const image = await generateImageWithFlux(prompt);
    return NextResponse.json({
      image,
      model: FLUX_MODEL,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Image generation failed.";
    const status = /loading|503|429/i.test(message) ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
