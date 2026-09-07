import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { food?: string };
    const food = body.food?.trim();

    if (!food) {
      return NextResponse.json({ error: "Food name is required." }, { status: 400 });
    }

    const model = getGeminiModel(
      `You write short, useful food information for a demo app.
Respond in plain text with these sections:
1) Description
2) Typical ingredients
3) Quick tip
Keep it under 180 words.`,
    );

    const result = await model.generateContent(
      `Generate food information for: ${food}`,
    );

    return NextResponse.json({ text: result.response.text() });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Food info request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
