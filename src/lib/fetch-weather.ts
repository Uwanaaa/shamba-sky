import type { Lang, NormalizedWeather } from "./types";

export async function fetchWeatherForField(
  lat: number,
  lon: number,
  opts: { ai: boolean; lang: Lang; days?: number }
): Promise<NormalizedWeather> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    days: String(opts.days ?? 7),
    ai: String(opts.ai),
    lang: opts.lang,
    units: "metric",
  });

  const res = await fetch(`/api/weather?${params}`);
  const data = await res.json();

  if (!res.ok) {
    const err = (data as { error?: string }).error ?? `Weather fetch failed (${res.status})`;
    const status = (data as { status?: number }).status ?? res.status;
    if (status === 401) {
      throw new Error(
        `${err} — Check WAI_API_KEY in shamba-sky/.env.local and create a fresh key at weather-ai.co if needed.`
      );
    }
    if (res.status === 500 && err.includes("WAI_API_KEY")) {
      throw new Error(
        `${err} — Put keys in shamba-sky/.env.local (not Assessments/.env), then restart npm run dev.`
      );
    }
    throw new Error(err);
  }

  return data as NormalizedWeather;
}
