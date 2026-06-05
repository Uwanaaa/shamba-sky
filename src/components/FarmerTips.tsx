"use client";

import type { FarmerAdvice } from "@/lib/types";

interface FarmerTipsProps {
  advice: FarmerAdvice | null;
  loading: boolean;
  waitingForWeather?: boolean;
  error?: string | null;
  lang: "en" | "sw";
}

export function FarmerTips({
  advice,
  loading,
  waitingForWeather,
  error,
  lang,
}: FarmerTipsProps) {
  const label = lang === "sw" ? "Vidokezo vya mkulima" : "Farmer tips";

  return (
    <div className="rounded-2xl border-2 border-sage/40 bg-white/70 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🧺</span>
        <h4 className="font-display text-lg text-soil">{label}</h4>
      </div>

      {(loading || waitingForWeather) && (
        <p className="font-hand text-soil/60 animate-pulse">
          {waitingForWeather && !loading
            ? lang === "sw"
              ? "Inasubiri hali ya hewa…"
              : "Waiting for weather…"
            : lang === "sw"
              ? "Inatafakari…"
              : "Thinking like a farmhand…"}
        </p>
      )}

      {!loading && !waitingForWeather && advice && (
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
            {lang === "sw" ? "Vidokezo vya Gemini" : "Gemini tips"}
          </p>
        </>
      )}

      {!loading && !waitingForWeather && !advice && (
        <div className="text-sm">
          {error ? (
            <p className="font-hand text-barn/90">{error}</p>
          ) : (
            <p className="font-hand text-soil/50">
              {lang === "sw"
                ? "Hakuna vidokezo — angalia GEMINI_API_KEY kwenye .env.local"
                : "No tips loaded — check GEMINI_API_KEY in shamba-sky/.env.local"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
