"use client";

import type { FarmerAdvice } from "@/lib/types";

interface FarmerTipsProps {
  advice: FarmerAdvice | null;
  loading: boolean;
  lang: "en" | "sw";
}

const SOURCE_LABEL: Record<FarmerAdvice["source"], { en: string; sw: string }> =
  {
    gemini: { en: "Gemini tips", sw: "Vidokezo vya Gemini" },
    "weather-ai": { en: "From forecast", sw: "Kutoka utabiri" },
    fallback: { en: "Local tips", sw: "Vidokezo vya kawaida" },
  };

export function FarmerTips({ advice, loading, lang }: FarmerTipsProps) {
  const label = lang === "sw" ? "Vidokezo vya mkulima" : "Farmer tips";

  return (
    <div className="rounded-2xl border-2 border-sage/40 bg-white/70 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🧺</span>
        <h4 className="font-display text-lg text-soil">{label}</h4>
      </div>

      {loading && (
        <p className="font-hand text-soil/60 animate-pulse">
          {lang === "sw" ? "Inatafakari…" : "Thinking like a farmhand…"}
        </p>
      )}

      {!loading && advice && (
        <>
          <p className="font-hand text-barn text-lg mb-2">{advice.headline}</p>
          <ul className="space-y-2">
            {advice.tips.map((tip, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm text-soil/90 leading-snug"
              >
                <span className="text-sun shrink-0">✿</span>
                <span className="font-hand">{tip}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[10px] text-soil/40 uppercase tracking-wide">
            {SOURCE_LABEL[advice.source][lang]}
          </p>
        </>
      )}

      {!loading && !advice && (
        <p className="font-hand text-soil/50 text-sm">
          {lang === "sw"
            ? "Ongeza GEMINI_API_KEY kwa vidokezo maalum."
            : "Add GEMINI_API_KEY for personalized tips."}
        </p>
      )}
    </div>
  );
}
