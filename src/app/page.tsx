"use client";

import { useCallback, useEffect, useState } from "react";
import { SkyDecor } from "@/components/SkyDecor";
import { FieldEditor } from "@/components/FieldEditor";
import { PlotPanel } from "@/components/PlotPanel";
import { PrintSummary } from "@/components/PrintSummary";
import { loadFields, saveFields } from "@/lib/fields-storage";
import type { FarmField, Lang } from "@/lib/types";

export default function Home() {
  const [fields, setFields] = useState<FarmField[]>([]);
  const [lang, setLang] = useState<Lang>("en");
  const [refreshKey, setRefreshKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [printTime, setPrintTime] = useState("");

  useEffect(() => {
    setFields(loadFields());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveFields(fields);
  }, [fields, mounted]);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handlePrint = () => {
    setPrintTime(new Date().toLocaleString());
    window.print();
  };

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-hand text-soil text-xl animate-pulse">
          Waking up the chickens…
        </p>
      </main>
    );
  }

  return (
    <>
      <SkyDecor />
      <PrintSummary fields={fields} lang={lang} generatedAt={printTime} />

      <header className="sticky top-0 z-20 border-b border-wheat/60 bg-cream/90 backdrop-blur-md print:hidden">
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl" aria-hidden>
              🌤️
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-soil leading-none">
                Shamba Sky
              </h1>
              <p className="font-hand text-soil/70 text-sm md:text-base">
                {lang === "sw"
                  ? "Hali ya hewa kwa mashamba yako"
                  : "Cozy weather for your farm plots"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex rounded-full border-2 border-soil/20 overflow-hidden bg-white/80"
              role="group"
              aria-label="Language"
            >
              {(["en", "sw"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`px-4 py-1.5 text-sm font-semibold transition-colors ${
                    lang === l
                      ? "bg-sage text-cream"
                      : "text-soil hover:bg-wheat/30"
                  }`}
                >
                  {l === "en" ? "English" : "Kiswahili"}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className="btn-secondary"
              title="Refresh all plots"
            >
              ↻ {lang === "sw" ? "Onyesha upya" : "Refresh"}
            </button>

            <button type="button" onClick={handlePrint} className="btn-primary">
              🖨 {lang === "sw" ? "Chapisha" : "Print summary"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8 print:py-4">
        <section className="paper-card p-6 text-center print:hidden bg-gradient-to-br from-sun/20 via-cream to-sky/20">
          <p className="font-hand text-lg text-soil/80 max-w-xl mx-auto">
            {lang === "sw"
              ? "Linganisha hadi plot 3 — muhtasari wa AI kwa leo, grafu bila AI kwa wiki, na vidokezo vya mkulima."
              : "Compare up to 3 plots side by side — AI briefing for today, chart-friendly forecast without AI quota burn, plus farmer tips."}
          </p>
        </section>

        <div className="print:hidden">
          <FieldEditor fields={fields} onChange={setFields} />
        </div>

        <section
          className={`grid gap-6 print:grid-cols-1 ${
            fields.length === 1
              ? "grid-cols-1 max-w-xl mx-auto"
              : fields.length === 2
                ? "grid-cols-1 lg:grid-cols-2"
                : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
          }`}
        >
          {fields.map((field) => (
            <PlotPanel
              key={field.id}
              field={field}
              lang={lang}
              refreshKey={refreshKey}
            />
          ))}
        </section>

        <footer className="text-center text-xs text-soil/40 font-hand pb-8 print:hidden">
          Built for farmers · Powered by{" "}
          <a
            href="https://weather-ai.co/docs"
            className="underline hover:text-sage"
            target="_blank"
            rel="noreferrer"
          >
            Weather-AI
          </a>
          {process.env.NEXT_PUBLIC_HAS_GEMINI === "true" && (
            <span> · Extra tips via Gemini</span>
          )}
        </footer>
      </main>
    </>
  );
}
