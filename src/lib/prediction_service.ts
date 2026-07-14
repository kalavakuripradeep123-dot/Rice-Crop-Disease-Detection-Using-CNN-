import type { DiseaseResult } from "./diseases";
import { getRandomDisease } from "./diseases";

/** Together AI — OpenAI-compatible chat completions */
const TOGETHER_API = "https://api.together.xyz/v1/chat/completions";
/** Project root `.env` / `.env.local`: VITE_TOGETHER_API_KEY (restart `npm run dev` after changes). */
const TOGETHER_API_KEY = import.meta.env.VITE_TOGETHER_API_KEY as string | undefined;
const TOGETHER_VISION_MODEL = "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo";

/** Same diagnosis instructions as the backend Gemini prompt (strict JSON). */
const RICE_DIAGNOSIS_PROMPT = `Analyze this rice leaf image like an agricultural disease detection model.
Return:

1. disease_name
2. confidence
3. cause
4. precautions
5. treatment

If uncertain, still provide most probable disease.

Return strict JSON only.

Expected JSON schema:
{
  "disease_name": "string",
  "confidence": 0,
  "cause": "string",
  "precautions": "string",
  "treatment": "string"
}`;

type TogetherChatResponse = {
  choices?: Array<{
    message?: { content?: string | null };
  }>;
};

type LlmJsonFields = {
  disease_name?: string;
  confidence?: number;
  cause?: string;
  precautions?: string | string[];
  treatment?: string;
};

function extractFirstJsonObject(text: string): string {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("Response did not contain valid JSON.");
  }
  return match[0];
}

function parseLlmJson(content: string): LlmJsonFields {
  const jsonStr = extractFirstJsonObject(content);
  return JSON.parse(jsonStr) as LlmJsonFields;
}

/**
 * Run inference via Together AI vision chat.
 * Image is sent as a data URL (base64) in the message content array.
 */
export async function runInference(
  imageBase64: string
): Promise<{ result: DiseaseResult; usingFallback: boolean }> {
  try {
    if (!TOGETHER_API_KEY?.trim()) {
      throw new Error("VITE_TOGETHER_API_KEY is not set. Add it to .env in the project root.");
    }

    const mimeMatch = imageBase64.match(/^data:(image\/[^;]+);base64,/);
    const mimeType = mimeMatch?.[1] ?? "image/jpeg";
    const base64Image = imageBase64.replace(/^data:image\/[^;]+;base64,/, "");

    const imageDataUrl = `data:${mimeType};base64,${base64Image}`;

    const response = await fetch(TOGETHER_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOGETHER_API_KEY.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: TOGETHER_VISION_MODEL,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: imageDataUrl },
              },
              { type: "text", text: RICE_DIAGNOSIS_PROMPT },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Together AI error ${response.status}: ${errText.slice(0, 200)}`);
    }

    const data = (await response.json()) as TogetherChatResponse;
    const rawContent = data.choices?.[0]?.message?.content;
    if (rawContent == null || typeof rawContent !== "string") {
      throw new Error("Together AI response missing choices[0].message.content");
    }

    const parsed = parseLlmJson(rawContent);

    const precautions = Array.isArray(parsed.precautions)
      ? parsed.precautions
      : [String(parsed.precautions ?? "")];
    const treatment = parsed.treatment != null ? [String(parsed.treatment)] : [""];

    const result: DiseaseResult = {
      disease: parsed.disease_name ?? "Unknown",
      confidence: Number(parsed.confidence ?? 0),
      severity: "Unknown",
      affected_area_percent: 0,
      all_scores: { rice_blast: 0, brown_spot: 0, bacterial_leaf_blight: 0, healthy: 0 },
      feature_based_cause: parsed.cause ?? "",
      precautions,
      treatment,
    };

    return { result, usingFallback: false };
  } catch (err) {
    console.warn("[prediction_service] Backend unreachable, using local fallback:", err);
    return { result: getRandomDisease(), usingFallback: true };
  }
}
