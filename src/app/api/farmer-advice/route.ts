import { NextRequest, NextResponse } from "next/server";
import type { Lang } from "@/lib/types";

interface AdvicePayload {
  fieldName: string;
  crop?: string;
  lang: Lang;
  current: { temp: number; condition: string; humidity?: number; windKph?: number };
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

function fallbackAdvice(payload: AdvicePayload): {
  headline: string;
  tips: string[];
} {
  const rainDays = payload.daily.filter(
    (d) => (d.precipMm ?? 0) > 2 || /rain|storm|shower/i.test(d.condition)
  ).length;

  if (payload.lang === "sw") {
    return {
      headline: `Shamba lako, ${payload.fieldName}`,
      tips: [
        rainDays >= 2
          ? "Mvua inatarajiwa — epuka kupalilia wakati wa udongo mvua."
          : "Hali kavu — mpige maji asubuhi na mapema.",
        payload.current.windKph && payload.current.windKph > 25
          ? "Upepo mkali — funga vifuniko vya mbolea na dawa."
          : "Angalia wadudu baada ya joto — hasa kwenye mimea mipya.",
        payload.crop
          ? `Kwa ${payload.crop}: fuata ratiba ya kupanda/kuvuna kulingana na hali ya hewa.`
          : "Rekodi kila siku — hali ya hewa hubadilika haraka.",
      ],
    };
  }

  return {
    headline: `For ${payload.fieldName}`,
    tips: [
      rainDays >= 2
        ? "Rain is likely — delay tillage until topsoil dries."
        : "Dry stretch — irrigate early morning to reduce evaporation.",
      payload.current.windKph && payload.current.windKph > 25
        ? "Strong winds — secure fertilizer covers and spray windows."
        : "Scout for pests after warm spells, especially on young shoots.",
      payload.crop
        ? `For ${payload.crop}: align planting and harvest with this week's forecast.`
        : "Log conditions daily — micro-climates shift quickly across plots.",
    ],
  };
}

async function geminiAdvice(payload: AdvicePayload): Promise<{
  headline: string;
  tips: string[];
} | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const langLabel = payload.lang === "sw" ? "Swahili" : "English";
  const focus = payload.targetDay
    ? `Focus extra tips on: ${payload.targetDay}.`
    : "Focus on today and the next 2 days.";

  const prompt = `You are a friendly Kenyan agricultural extension officer. 
Respond ONLY with valid JSON: {"headline":"...","tips":["...","...","..."]}
Language: ${langLabel}. ${focus}
Keep tone warm, practical, cute — max 3 short tips (one sentence each).
Field: ${payload.fieldName}${payload.crop ? `, crop: ${payload.crop}` : ""}.
Now: ${payload.current.temp}°C, ${payload.current.condition}, humidity ${payload.current.humidity ?? "n/a"}%, wind ${payload.current.windKph ?? "n/a"} km/h.
Weather-AI summary: ${payload.aiSummary ?? "none"}.
7-day: ${payload.daily.map((d) => `${d.label}: ${d.tempMin}-${d.tempMax}°C, ${d.condition}, rain ${d.precipMm ?? 0}mm`).join("; ")}`;

  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
    }),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      headline?: string;
      tips?: string[];
    };
    if (!parsed.tips?.length) return null;
    return {
      headline: parsed.headline ?? payload.fieldName,
      tips: parsed.tips.slice(0, 4),
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  let payload: AdvicePayload;
  try {
    payload = (await request.json()) as AdvicePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload.fieldName || !payload.current || !payload.daily?.length) {
    return NextResponse.json(
      { error: "fieldName, current, and daily are required" },
      { status: 400 }
    );
  }

  const gemini = await geminiAdvice(payload);
  if (gemini) {
    return NextResponse.json({
      ...gemini,
      source: "gemini" as const,
    });
  }

  const fb = fallbackAdvice(payload);
  const source = payload.aiSummary ? "weather-ai" : "fallback";

  return NextResponse.json({
    ...fb,
    source,
    note: process.env.GEMINI_API_KEY
      ? undefined
      : "Add GEMINI_API_KEY for personalized AI farming tips.",
  });
}
