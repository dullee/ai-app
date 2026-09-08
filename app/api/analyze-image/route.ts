import { NextResponse } from "next/server";
import { GEMINI_MODEL, getGeminiModel } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "image/jpeg";

    const model = getGeminiModel(
      "You caption photos for a food demo app. Reply with one short, clear caption describing what you see. No preamble.",
    );

    const result = await model.generateContent([
      {
        inlineData: {
          data: bytes.toString("base64"),
          mimeType,
        },
      },
      "Describe this image in one short caption.",
    ]);

    const caption = result.response.text().trim();
    if (!caption) {
      return NextResponse.json(
        { error: "Model returned an empty caption." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      caption,
      model: GEMINI_MODEL,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Image analysis failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
