"use client";

import type { FarmField, Lang } from "@/lib/types";

interface PrintSummaryProps {
  fields: FarmField[];
  lang: Lang;
  generatedAt: string;
}

export function PrintSummary({ fields, lang, generatedAt }: PrintSummaryProps) {
  const title =
    lang === "sw" ? "Muhtasari wa kila siku — Shamba Sky" : "Daily shamba summary — Shamba Sky";

  return (
    <div className="hidden print:block print-summary">
      <header className="border-b-2 border-soil pb-4 mb-6">
        <h1 className="font-display text-3xl text-soil">{title}</h1>
        <p className="font-hand text-soil/70 text-sm mt-1">
          {lang === "sw" ? "Imechapishwa" : "Printed"}: {generatedAt}
        </p>
        <p className="text-xs text-soil/50 mt-2">
          Weather data via Weather-AI · api.weather-ai.co
        </p>
      </header>
      <p className="font-hand text-soil/80 mb-4 text-sm">
        {lang === "sw"
          ? "Chapisha ukurasa huu kwa rekodi ya shamba. Kila plot inaonyesha hali ya leo na wiki."
          : "Print this page for your field log. Each plot shows today and the 7-day outlook."}
      </p>
      <ul className="space-y-2 mb-6">
        {fields.map((f) => (
          <li key={f.id} className="text-sm text-soil">
            <strong>
              {f.emoji} {f.name}
            </strong>{" "}
            — {f.lat.toFixed(4)}, {f.lon.toFixed(4)}
            {f.crop ? ` (${f.crop})` : ""}
          </li>
        ))}
      </ul>
      <p className="text-xs text-soil/40">
        {lang === "sw"
          ? "Vidokezo vya mkulima na muhtasari wa AI vinaonekana kwenye skrini kabla ya kuchapisha."
          : "Farmer tips and AI briefings appear on screen panels above each plot section."}
      </p>
    </div>
  );
}
