"use client";

import type { CurrentWeather } from "@/lib/types";

interface BriefingCardProps {
  fieldName: string;
  emoji?: string;
  current: CurrentWeather;
  aiSummary?: string;
  lang: "en" | "sw";
  loading?: boolean;
}

export function BriefingCard({
  fieldName,
  emoji = "🌾",
  current,
  aiSummary,
  lang,
  loading,
}: BriefingCardProps) {
  const title =
    lang === "sw" ? "Muhtasari wa leo" : "Today's field briefing";

  return (
    <div className="briefing-card relative overflow-hidden">
      <div className="absolute -right-4 -top-4 text-6xl opacity-20 rotate-12">
        {emoji}
      </div>
      <p className="text-xs uppercase tracking-widest text-cream/80 font-semibold mb-1">
        {title}
      </p>
      <h3 className="font-display text-xl text-cream mb-3">{fieldName}</h3>

      {loading ? (
        <p className="font-hand text-cream/90 animate-pulse">
          {lang === "sw" ? "Inapakia hali ya hewa…" : "Gathering skies…"}
        </p>
      ) : (
        <>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-display text-5xl text-sun">
              {Math.round(current.temp)}°
            </span>
            <span className="font-hand text-cream/90 text-lg">
              {current.condition}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-cream/85 mb-4">
            {current.humidity != null && (
              <span>💧 {current.humidity}%</span>
            )}
            {current.windKph != null && (
              <span>🌬️ {Math.round(current.windKph)} km/h</span>
            )}
            {current.feelsLike != null && (
              <span>
                {lang === "sw" ? "Hisi" : "Feels"} {Math.round(current.feelsLike)}°
              </span>
            )}
          </div>
          <div className="rounded-xl bg-cream/15 border border-cream/25 p-3 backdrop-blur-sm">
            <p className="text-xs font-semibold text-sun mb-1">
              {lang === "sw" ? "Muhtasari wa Weather-AI" : "Weather-AI summary"}
            </p>
            <p className="font-hand text-sm leading-relaxed text-cream">
              {aiSummary ??
                (lang === "sw"
                  ? "Hakuna muhtasari — jaribu tena na AI imewashwa."
                  : "No AI summary yet — check your API key and quota.")}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
