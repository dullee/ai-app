import { NextResponse } from "next/server";
import { getHfClient, HF_MODELS } from "@/lib/huggingface";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    const client = getHfClient();
    const result = await client.imageToText({
      provider: "hf-inference",
      model: HF_MODELS.imageCaptioning,
      inputs: file,
    });

    const caption =
      typeof result === "string"
        ? result
        : Array.isArray(result)
          ? result[0]?.generated_text ?? ""
          : (result as { generated_text?: string }).generated_text ?? "";

    if (!caption) {
      return NextResponse.json(
        { error: "Model returned an empty caption." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      caption,
      model: HF_MODELS.imageCaptioning,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Image analysis failed.";
    const status = /loading|503/i.test(message) ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
