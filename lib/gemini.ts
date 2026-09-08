import {
  GoogleGenerativeAI,
  type GenerationConfig,
} from "@google/generative-ai";
import { MODELS } from "@/lib/models";

export const GEMINI_MODEL = MODELS.gemini;
export const GEMINI_IMAGE_MODEL = MODELS.geminiImage;

function requireGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY. Add it to .env.local.");
  }
  return apiKey;
}

export function getGeminiModel(systemInstruction?: string) {
  const genAI = new GoogleGenerativeAI(requireGeminiApiKey());
  return genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    ...(systemInstruction ? { systemInstruction } : {}),
  });
}

/** Text-to-image via Gemini (not available through Hugging Face providers). */
export async function generateImageWithGemini(prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(requireGeminiApiKey());
  const generationConfig = {
    responseModalities: ["TEXT", "IMAGE"],
  } as GenerationConfig;
  const model = genAI.getGenerativeModel({
    model: GEMINI_IMAGE_MODEL,
    // Image modalities exist in the API but are missing from current SDK types.
    generationConfig,
  });

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
      hypothesisId: "A",
      location: "lib/gemini.ts:generateImageWithGemini:entry",
      message: "Gemini image gen request",
      data: {
        model: GEMINI_IMAGE_MODEL,
        promptLen: prompt.length,
        generationConfig,
        sdkModelConfig: model.generationConfig,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  let result;
  try {
    result = await model.generateContent(`Generate an image of: ${prompt}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
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
        hypothesisId: "F",
        location: "lib/gemini.ts:generateImageWithGemini:api-error",
        message: "Gemini image API threw",
        data: {
          model: GEMINI_IMAGE_MODEL,
          is429: /429|Too Many Requests/i.test(message),
          freeTierLimitZero: /limit:\s*0/i.test(message),
          errorPreview: message.slice(0, 280),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    if (/limit:\s*0/i.test(message) && /free_tier/i.test(message)) {
      throw new Error(
        "Gemini image models are not available on the free API tier (quota limit is 0). Enable billing in Google AI Studio, or use Stable Diffusion instead.",
      );
    }
    throw error;
  }

  const response = result.response;
  const candidate = response.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  const partSummaries = parts.map((part) => {
    const record = part as unknown as Record<string, unknown>;
    return {
      keys: Object.keys(record).filter((k) => record[k] != null),
      hasText: typeof part.text === "string",
      textLen: typeof part.text === "string" ? part.text.length : 0,
      textPreview:
        typeof part.text === "string" ? part.text.slice(0, 120) : undefined,
      hasInlineData: Boolean(part.inlineData?.data),
      mimeType: part.inlineData?.mimeType,
      inlineDataLen: part.inlineData?.data?.length ?? 0,
    };
  });

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
      hypothesisId: "C",
      location: "lib/gemini.ts:generateImageWithGemini:response",
      message: "Gemini image gen response shape",
      data: {
        model: GEMINI_IMAGE_MODEL,
        candidateCount: response.candidates?.length ?? 0,
        finishReason: candidate?.finishReason,
        safetyRatings: candidate?.safetyRatings,
        promptFeedback: response.promptFeedback,
        partCount: parts.length,
        partSummaries,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  for (const part of parts) {
    if (part.inlineData?.data) {
      const mimeType = part.inlineData.mimeType || "image/png";
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
          hypothesisId: "D",
          location: "lib/gemini.ts:generateImageWithGemini:success",
          message: "Found inline image data",
          data: { mimeType, dataLen: part.inlineData.data.length },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      return `data:${mimeType};base64,${part.inlineData.data}`;
    }
  }

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
      hypothesisId: "E",
      location: "lib/gemini.ts:generateImageWithGemini:no-image",
      message: "No inline image data in response",
      data: {
        model: GEMINI_IMAGE_MODEL,
        finishReason: candidate?.finishReason,
        partCount: parts.length,
        partSummaries,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  throw new Error("Gemini returned no image data.");
}
