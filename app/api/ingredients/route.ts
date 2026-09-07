import { NextResponse } from "next/server";
import {
  extractFoodIngredients,
  getHfClient,
  HF_MODELS,
  type NerEntity,
} from "@/lib/huggingface";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { text?: string };
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json({ error: "Text is required." }, { status: 400 });
    }

    const client = getHfClient();
    const entities = (await client.tokenClassification({
      provider: "hf-inference",
      model: HF_MODELS.ingredients,
      inputs: text,
    })) as NerEntity[];

    const ingredients = extractFoodIngredients(entities);

    return NextResponse.json({
      ingredients,
      entities,
      model: HF_MODELS.ingredients,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ingredient detection failed.";
    const status = /loading|503/i.test(message) ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
