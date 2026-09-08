import { NextResponse } from "next/server";
import { GEMINI_MODEL, getGeminiModel } from "@/lib/gemini";

function parseIngredients(raw: string): string[] {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  try {
    const parsed = JSON.parse(cleaned) as unknown;
    if (Array.isArray(parsed)) {
      return [
        ...new Set(
          parsed
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim().toLowerCase())
            .filter(Boolean),
        ),
      ];
    }
  } catch {
    // Fall through to comma / newline splitting.
  }

  return [
    ...new Set(
      cleaned
        .split(/[\n,]/)
        .map((item) => item.replace(/^[-*•\d.)\s]+/, "").trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { text?: string };
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json({ error: "Text is required." }, { status: 400 });
    }

    const model = getGeminiModel(
      `Extract food ingredients from the user's text.
Return ONLY a JSON array of strings, e.g. ["olive","avocado","chia seeds"].
Use short lowercase ingredient names. No objects, no markdown, no explanation.
If none found, return [].`,
    );

    const result = await model.generateContent(
      `Extract ingredients from this text:\n\n${text}`,
    );

    const ingredients = parseIngredients(result.response.text());

    return NextResponse.json({
      ingredients,
      model: GEMINI_MODEL,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ingredient detection failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
