/**
 * Gemini API client — https://ai.google.dev/gemini-api/docs
 * REST generateContent with x-goog-api-key header and structured JSON output.
 */

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

export interface GeminiGenerateOptions {
  temperature?: number;
  maxOutputTokens?: number;
  /** When set, Gemini returns JSON matching this schema (Structured Outputs). */
  jsonSchema?: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface FarmerAdviceInput {
  fieldName: string;
  crop?: string;
  lang: "en" | "sw";
  current: {
    temp: number;
    condition: string;
    humidity?: number;
    windKph?: number;
  };
  daily: Array<{
    label: string;
    tempMax: number;
    tempMin: number;
    precipMm?: number;
    condition: string;
  }>;
  aiSummary?: string;
  targetDay?: string;
}

export interface FarmerAdviceResult {
  headline: string;
  tips: string[];
}

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string; thought?: boolean }> };
    finishReason?: string;
  }>;
  error?: { message?: string; status?: string; code?: number };
};

function getApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY?.trim() || undefined;
}

/** Default per https://ai.google.dev/gemini-api/docs (gemini-2.0-flash often 429 on free tier). */
function getModelCandidates(): string[] {
  const preferred = process.env.GEMINI_MODEL?.trim();
  const defaults = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
  ];
  if (preferred) {
    return [preferred, ...defaults.filter((m) => m !== preferred)];
  }
  return defaults;
}

function extractTextFromResponse(data: GeminiResponse): string {
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  // Collect all text parts (2.5 models may use internal "thinking" before JSON output).
  return parts
    .filter((p) => typeof p.text === "string" && p.text.length > 0)
    .map((p) => p.text!)
    .join("")
    .trim();
}

function parseGeminiErrorBody(body: string, status: number): string {
  try {
    const parsed = JSON.parse(body) as GeminiResponse;
    if (parsed.error?.message) return parsed.error.message;
  } catch {
    /* use raw */
  }
  return body.slice(0, 300) || `Gemini API returned ${status}`;
}

/**
 * Low-level Gemini generateContent — official REST shape with x-goog-api-key.
 * @see https://ai.google.dev/gemini-api/docs
 */
export async function queryGemini(
  prompt: string,
  options: GeminiGenerateOptions = {}
): Promise<{ text: string; model: string } | { error: string; status?: number }> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { error: "GEMINI_API_KEY is not configured." };
  }

  const maxTokens = options.maxOutputTokens ?? 1024;
  const tokenAttempts = [maxTokens, Math.min(maxTokens * 2, 2048)];

  let lastError = "Gemini request failed.";
  let lastStatus: number | undefined;

  for (const model of getModelCandidates()) {
    for (const maxOutputTokens of tokenAttempts) {
      const generationConfig: Record<string, unknown> = {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens,
        // Reduce hidden reasoning tokens on 2.5 models so JSON output fits.
        thinkingConfig: { thinkingBudget: 0 },
      };

      if (options.jsonSchema) {
        generationConfig.responseMimeType = "application/json";
        generationConfig.responseSchema = options.jsonSchema;
      }

      const body = JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
      });

      const url = `${GEMINI_BASE}/models/${model}:generateContent`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body,
      });

      const raw = await res.text();

      if (!res.ok) {
        lastError = parseGeminiErrorBody(raw, res.status);
        lastStatus = res.status;
        if ([404, 429, 503].includes(res.status)) break; // try next model
        return { error: lastError, status: lastStatus };
      }

      let data: GeminiResponse;
      try {
        data = JSON.parse(raw) as GeminiResponse;
      } catch {
        return { error: "Invalid JSON from Gemini API." };
      }

      const finishReason = data.candidates?.[0]?.finishReason;
      const text = extractTextFromResponse(data);

      if (!text) {
        lastError = `Gemini returned no text (finishReason: ${finishReason ?? "unknown"}).`;
        if (finishReason === "MAX_TOKENS") continue; // retry with higher limit
        break; // try next model
      }

      return { text, model };
    }
  }

  return { error: lastError, status: lastStatus };
}

const FARMER_ADVICE_SCHEMA = {
  type: "object" as const,
  properties: {
    headline: { type: "string", description: "Short friendly title for the farmer" },
    tips: {
      type: "array",
      items: { type: "string" },
      description: "Exactly 3 practical one-sentence farming tips",
    },
  },
  required: ["headline", "tips"],
};

function buildFarmerAdvicePrompt(input: FarmerAdviceInput): string {
  const langLabel = input.lang === "sw" ? "Swahili" : "English";
  const focus = input.targetDay
    ? `Emphasize advice for: ${input.targetDay}.`
    : "Emphasize today and the next 2 days.";

  return `You are a friendly Kenyan agricultural extension officer helping smallholder farmers.
IMPORTANT: Write the headline and every tip ONLY in ${langLabel} — no other language.
${focus}
Tone: warm, practical, slightly cute.
Field: ${input.fieldName}${input.crop ? `, crop: ${input.crop}` : ""}.
Current weather: ${input.current.temp}°C, ${input.current.condition}, humidity ${input.current.humidity ?? "n/a"}%, wind ${input.current.windKph ?? "n/a"} km/h.
Weather-AI summary: ${input.aiSummary ?? "none"}.
7-day forecast: ${input.daily
    .map(
      (d) =>
        `${d.label}: ${d.tempMin}-${d.tempMax}°C, ${d.condition}, rain ${d.precipMm ?? 0}mm`
    )
    .join("; ")}.`;
}

function stripMarkdownJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  return text.trim();
}

function parseFarmerAdviceJson(
  text: string,
  fieldName: string
): FarmerAdviceResult | null {
  const cleaned = stripMarkdownJson(text);
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      headline?: string;
      tips?: string[];
    };
    if (!Array.isArray(parsed.tips) || parsed.tips.length === 0) return null;
    return {
      headline: String(parsed.headline ?? fieldName).trim() || fieldName,
      tips: parsed.tips.map((t) => String(t).trim()).filter(Boolean).slice(0, 4),
    };
  } catch {
    return null;
  }
}

/**
 * Generate farmer headline + tips via Gemini structured JSON output.
 */
export async function generateFarmerAdvice(
  input: FarmerAdviceInput
): Promise<
  | { ok: true; data: FarmerAdviceResult; model: string }
  | { ok: false; error: string; status?: number }
> {
  const result = await queryGemini(buildFarmerAdvicePrompt(input), {
    jsonSchema: FARMER_ADVICE_SCHEMA,
    temperature: 0.6,
    maxOutputTokens: 1024,
  });

  if ("error" in result) {
    return { ok: false, error: result.error, status: result.status };
  }

  const parsed = parseFarmerAdviceJson(result.text, input.fieldName);
  if (!parsed) {
    return {
      ok: false,
      error: `Could not parse farmer advice JSON. Raw preview: ${result.text.slice(0, 120)}…`,
    };
  }

  return { ok: true, data: parsed, model: result.model };
}
