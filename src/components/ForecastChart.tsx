"use client";

import type { DailyForecast } from "@/lib/types";

interface ForecastChartProps {
  daily: DailyForecast[];
  lang: "en" | "sw";
}

export function ForecastChart({ daily, lang }: ForecastChartProps) {
  if (!daily.length) {
    return (
      <p className="text-sm text-soil/60 font-hand py-4 text-center">
        {lang === "sw" ? "Hakuna utabiri wa siku." : "No forecast days yet."}
      </p>
    );
  }

  const maxT = Math.max(...daily.map((d) => d.tempMax), 1);
  const minT = Math.min(...daily.map((d) => d.tempMin), 0);
  const range = Math.max(maxT - minT, 1);

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-soil/50 uppercase tracking-wide">
        {lang === "sw" ? "Joto la wiki (hakuna AI)" : "Week temps (charts, no AI)"}
      </p>
      <div className="flex items-end gap-2 h-36">
        {daily.map((day) => {
          const highPct = ((day.tempMax - minT) / range) * 100;
          const lowPct = ((day.tempMin - minT) / range) * 100;
          const height = Math.max(highPct - lowPct, 8);
          const rain = (day.precipMm ?? 0) > 1;

          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center gap-1 min-w-0"
            >
              <span className="text-[10px] text-soil/60 truncate w-full text-center">
                {day.label.split(",")[0]}
              </span>
              <div className="relative w-full flex-1 flex items-end justify-center">
                <div
                  className={`w-full max-w-[2rem] rounded-t-lg rounded-b-sm transition-all ${
                    rain ? "bg-sky/70" : "bg-sage/80"
                  }`}
                  style={{ height: `${height}%`, minHeight: "12px" }}
                  title={`${day.tempMin}° – ${day.tempMax}°`}
                />
                {rain && (
                  <span className="absolute -top-4 text-xs" title="Rain likely">
                    💧
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-soil/70">
                {Math.round(day.tempMax)}°
              </span>
            </div>
          );
        })}
      </div>
      <div className="grid gap-2">
        {daily.map((day) => (
          <div
            key={`row-${day.date}`}
            className="flex justify-between text-xs border-b border-wheat/40 pb-1 text-soil/80"
          >
            <span className="font-hand truncate pr-2">{day.label}</span>
            <span>
              {Math.round(day.tempMin)}° – {Math.round(day.tempMax)}°
              {(day.precipMm ?? 0) > 0 && (
                <span className="text-sky ml-1">· {day.precipMm}mm</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
