import { NextResponse } from "next/server";
import { GEMINI_MODEL, getGeminiModel } from "@/lib/gemini";

type ChatMessage = {
  role: "user" | "model";
  content: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      message?: string;
      history?: ChatMessage[];
    };

    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const model = getGeminiModel(
      "You are a helpful AI demo assistant. Keep answers clear and concise.",
    );

    const history = (body.history ?? []).map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);
    const text = result.response.text();

    return NextResponse.json({ text, model: GEMINI_MODEL });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
