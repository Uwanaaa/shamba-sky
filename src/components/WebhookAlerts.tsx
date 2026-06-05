"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_WEBHOOK_PRESET,
  WEBHOOK_LOCATION_PRESETS,
} from "@/lib/webhook-coords";

interface AlertItem {
  id: string;
  receivedAt: string;
  trigger?: string;
  message?: string;
  lat?: number;
  lon?: number;
  locationLabel?: string;
  severity?: string;
}

interface WebhookAlertsProps {
  lang: "en" | "sw";
}

const TRIGGER_EMOJI: Record<string, string> = {
  rain: "🌧️",
  heavy_rain: "🌧️",
  storm: "⛈️",
  extreme_wind: "💨",
  frost: "❄️",
  heat: "🔥",
  extreme_heat: "🔥",
};

export function WebhookAlerts({ lang }: WebhookAlertsProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/webhooks/alerts");
      const data = await res.json();
      if (res.ok) {
        setAlerts(data.alerts ?? []);
        setWebhookUrl(data.webhookUrl ?? null);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void fetchAlerts();
    const id = setInterval(fetchAlerts, 15000);
    return () => clearInterval(id);
  }, [fetchAlerts]);

  const title =
    lang === "sw" ? "Arifa za hali ya hewa (webhook)" : "Weather alerts (webhook)";
  const empty =
    lang === "sw"
      ? "Hakuna arifa bado — Weather-AI itatumia POST kwa /webhook wakati trigger inafikiwa."
      : "No alerts yet — Weather-AI will POST to /webhook when a trigger fires.";

  const displayUrl =
    webhookUrl ??
    (typeof window !== "undefined"
      ? `${window.location.origin}/webhook`
      : "https://shamba-sky.onrender.com/webhook");

  return (
    <section className="paper-card p-5 md:p-6 print:hidden">
      <div className="flex flex-wrap items-start gap-3 mb-4">
        <span className="text-3xl">🔔</span>
        <div>
          <h2 className="font-display text-2xl text-soil">{title}</h2>
          <p className="font-hand text-sm text-soil/70 mt-1">
            {lang === "sw"
              ? "Weka URL hii kwenye dashibodi ya Weather-AI:"
              : "Use this URL in the Weather-AI dashboard:"}
          </p>
          <code className="mt-2 block text-xs bg-cream border border-wheat rounded-lg px-3 py-2 text-soil break-all">
            {displayUrl}
          </code>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-sky/50 bg-sky/5 p-4 mb-4">
        <h3 className="font-display text-sm text-soil mb-2">
          {lang === "sw" ? "Lat / Lon kwa dashibodi" : "Lat / Lon for your dashboard"}
        </h3>
        <p className="font-hand text-xs text-soil/70 mb-3">
          {lang === "sw"
            ? "Tumia kuratibu za shamba lako. Webhook moja = eneo moja; Pro inaruhusu hadi 10."
            : "Use your plot coordinates. One webhook = one location; Pro allows up to 10 webhooks."}
        </p>
        <ul className="space-y-2">
          {WEBHOOK_LOCATION_PRESETS.map((p) => (
            <li
              key={p.id}
              className={`text-sm rounded-xl px-3 py-2 border ${
                p.id === DEFAULT_WEBHOOK_PRESET.id
                  ? "border-sage bg-sage/10"
                  : "border-wheat/60 bg-white/60"
              }`}
            >
              <span className="font-display text-soil">{p.name}</span>
              {p.id === DEFAULT_WEBHOOK_PRESET.id && (
                <span className="ml-2 text-[10px] uppercase text-sage font-semibold">
                  {lang === "sw" ? "pendekezo" : "recommended"}
                </span>
              )}
              <div className="font-mono text-xs text-soil/80 mt-1">
                lat <strong>{p.lat}</strong> · lon <strong>{p.lon}</strong>
              </div>
              <p className="font-hand text-xs text-soil/60 mt-1">{p.note}</p>
            </li>
          ))}
        </ul>
        <p className="font-hand text-xs text-soil/50 mt-3">
          {lang === "sw" ? "Ukanda wa saa: " : "Timezone: "}
          <strong>Africa/Nairobi</strong>
        </p>
      </div>

      <div className="space-y-2 min-h-[4rem]">
        {alerts.length === 0 ? (
          <p className="font-hand text-soil/50 text-sm text-center py-4">{empty}</p>
        ) : (
          alerts.map((a) => (
            <div
              key={a.id}
              className="flex gap-3 rounded-xl border border-wheat/70 bg-white/80 px-3 py-2"
            >
              <span className="text-xl shrink-0">
                {TRIGGER_EMOJI[(a.trigger ?? "").toLowerCase()] ?? "⚠️"}
              </span>
              <div className="min-w-0">
                <p className="font-display text-sm text-soil">
                  {a.trigger?.replace(/_/g, " ") ?? "Weather alert"}
                  {a.severity && (
                    <span className="text-barn text-xs ml-2">{a.severity}</span>
                  )}
                </p>
                {a.message && (
                  <p className="font-hand text-sm text-soil/80">{a.message}</p>
                )}
                <p className="text-[10px] text-soil/40 font-mono mt-1">
                  {new Date(a.receivedAt).toLocaleString()}
                  {a.lat != null && a.lon != null && (
                    <> · {a.lat.toFixed(4)}, {a.lon.toFixed(4)}</>
                  )}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
