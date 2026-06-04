"use client";

import { useCallback, useEffect, useState } from "react";
import type { FarmField, FarmerAdvice, Lang, NormalizedWeather } from "@/lib/types";
import { fetchWeatherForField } from "@/lib/fetch-weather";
import { BriefingCard } from "./BriefingCard";
import { ForecastChart } from "./ForecastChart";
import { FarmerTips } from "./FarmerTips";

interface PlotPanelProps {
  field: FarmField;
  lang: Lang;
  refreshKey: number;
  selectedDay?: string;
}

export function PlotPanel({
  field,
  lang,
  refreshKey,
  selectedDay,
}: PlotPanelProps) {
  const [briefing, setBriefing] = useState<NormalizedWeather | null>(null);
  const [charts, setCharts] = useState<NormalizedWeather | null>(null);
  const [advice, setAdvice] = useState<FarmerAdvice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingBrief, setLoadingBrief] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [focusDay, setFocusDay] = useState<string | undefined>(undefined);

  const loadAdvice = useCallback(
    async (brief: NormalizedWeather) => {
      setLoadingAdvice(true);
      try {
        const res = await fetch("/api/farmer-advice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fieldName: field.name,
            crop: field.crop,
            lang,
            current: brief.current,
            daily: brief.daily,
            aiSummary: brief.aiSummary,
            targetDay: focusDay ?? selectedDay,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setAdvice({
            headline: data.headline,
            tips: data.tips,
            source: data.source,
          });
        }
      } catch {
        /* optional */
      } finally {
        setLoadingAdvice(false);
      }
    },
    [field.name, field.crop, lang, selectedDay, focusDay]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);
      setLoadingBrief(true);
      setLoadingCharts(true);
      setBriefing(null);
      setCharts(null);

      try {
        const [withAi, withoutAi] = await Promise.all([
          fetchWeatherForField(field.lat, field.lon, { ai: true, lang, days: 7 }),
          fetchWeatherForField(field.lat, field.lon, {
            ai: false,
            lang,
            days: 7,
          }),
        ]);

        if (cancelled) return;
        setBriefing(withAi);
        setCharts(withoutAi);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load weather");
        }
      } finally {
        if (!cancelled) {
          setLoadingBrief(false);
          setLoadingCharts(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [field.lat, field.lon, field.id, lang, refreshKey]);

  useEffect(() => {
    if (!briefing) return;
    void loadAdvice(briefing);
  }, [focusDay, briefing, loadAdvice]);

  return (
    <article
      className="paper-card flex flex-col gap-4 h-full print:break-inside-avoid"
      data-field-id={field.id}
    >
      <header className="flex items-start gap-3 border-b border-wheat/50 pb-3">
        <span className="text-4xl">{field.emoji ?? "🌾"}</span>
        <div className="min-w-0">
          <h3 className="font-display text-xl text-soil truncate">
            {field.name}
          </h3>
          <p className="text-xs text-soil/50 font-mono">
            {field.lat.toFixed(4)}, {field.lon.toFixed(4)}
            {field.crop && (
              <span className="font-hand text-soil/70"> · {field.crop}</span>
            )}
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-xl bg-barn/10 border border-barn/30 p-3 text-sm text-barn">
          {error}
        </div>
      )}

      <BriefingCard
        fieldName={field.name}
        emoji={field.emoji}
        current={briefing?.current ?? { temp: 0, condition: "—" }}
        aiSummary={briefing?.aiSummary}
        lang={lang}
        loading={loadingBrief}
      />

      {briefing && briefing.daily.length > 0 && (
        <div className="print:hidden">
          <label className="block text-xs font-semibold text-soil/60 mb-1">
            {lang === "sw" ? "Vidokezo kwa siku" : "Tips for day"}
          </label>
          <select
            className="input-field text-sm"
            value={focusDay ?? ""}
            onChange={(e) => setFocusDay(e.target.value || undefined)}
          >
            <option value="">
              {lang === "sw" ? "Leo + siku 2 zijazo" : "Today + next 2 days"}
            </option>
            {briefing.daily.map((d) => (
              <option key={d.date} value={d.label}>
                {d.label} — {d.condition}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="rounded-2xl bg-white/60 border border-sage/30 p-4">
        {loadingCharts ? (
          <p className="font-hand text-soil/50 text-center py-6 animate-pulse">
            {lang === "sw" ? "Inachora grafu…" : "Drawing week chart…"}
          </p>
        ) : (
          <ForecastChart daily={charts?.daily ?? []} lang={lang} />
        )}
      </div>

      <FarmerTips advice={advice} loading={loadingAdvice} lang={lang} />
    </article>
  );
}
