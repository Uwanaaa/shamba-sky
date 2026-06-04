import type { CurrentWeather, DailyForecast, NormalizedWeather } from "./types";

function asNumber(v: unknown): number | undefined {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
}

function pickString(...vals: unknown[]): string | undefined {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

function formatDayLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  } catch {
    /* ignore */
  }
  return dateStr;
}

function normalizeCurrent(obj: Record<string, unknown>): CurrentWeather {
  const nested =
    (obj.current as Record<string, unknown>) ??
    (obj.now as Record<string, unknown>) ??
    obj;

  const temp =
    asNumber(nested.temp) ??
    asNumber(nested.temperature) ??
    asNumber(nested.temp_c) ??
    asNumber(nested.tempC) ??
    0;

  const condition =
    pickString(
      nested.condition,
      nested.summary,
      nested.description,
      (nested.weather as Record<string, unknown>)?.description,
      (nested.weather as string[][])?.[0]?.[0]
    ) ?? "—";

  return {
    temp,
    feelsLike:
      asNumber(nested.feels_like) ??
      asNumber(nested.feelsLike) ??
      asNumber(nested.feels_like_c),
    humidity: asNumber(nested.humidity) ?? asNumber(nested.humidity_pct),
    windKph:
      asNumber(nested.wind_kph) ??
      asNumber(nested.windKph) ??
      asNumber(nested.wind_speed),
    condition,
    icon: pickString(nested.icon, nested.condition_icon),
  };
}

function normalizeDailyItem(
  item: Record<string, unknown>,
  index: number
): DailyForecast | null {
  const date =
    pickString(item.date, item.datetime, item.day) ??
    new Date(Date.now() + index * 86400000).toISOString().slice(0, 10);

  const tempMax =
    asNumber(item.temp_max) ??
    asNumber(item.tempMax) ??
    asNumber(item.max_temp) ??
    asNumber(item.high) ??
    asNumber((item.day as Record<string, unknown>)?.maxtemp_c) ??
    asNumber(item.temp);

  const tempMin =
    asNumber(item.temp_min) ??
    asNumber(item.tempMin) ??
    asNumber(item.min_temp) ??
    asNumber(item.low) ??
    asNumber((item.day as Record<string, unknown>)?.mintemp_c);

  if (tempMax === undefined && tempMin === undefined) return null;

  const condition =
    pickString(
      item.condition,
      item.summary,
      item.description,
      (item.day as Record<string, unknown>)?.condition
    ) ?? "—";

  return {
    date,
    label: formatDayLabel(date),
    tempMax: tempMax ?? tempMin ?? 0,
    tempMin: tempMin ?? tempMax ?? 0,
    precipMm:
      asNumber(item.precip_mm) ??
      asNumber(item.precipitation) ??
      asNumber((item.day as Record<string, unknown>)?.totalprecip_mm),
    precipChance:
      asNumber(item.precip_chance) ??
      asNumber(item.chance_of_rain) ??
      asNumber((item.day as Record<string, unknown>)?.daily_chance_of_rain),
    windKph: asNumber(item.wind_kph) ?? asNumber(item.wind_speed),
    condition,
  };
}

export function normalizeWeatherResponse(
  data: unknown,
  units: "metric" | "imperial" = "metric"
): NormalizedWeather {
  const root =
    data && typeof data === "object"
      ? (data as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  const payload =
    (root.data as Record<string, unknown>) ??
    (root.weather as Record<string, unknown>) ??
    root;

  const dailyRaw =
    (payload.daily as unknown[]) ??
    (payload.forecast as unknown[]) ??
    (payload.days as unknown[]) ??
    ((payload.forecast as Record<string, unknown>)?.daily as unknown[]) ??
    [];

  const daily = dailyRaw
    .filter((d): d is Record<string, unknown> => !!d && typeof d === "object")
    .map((d, i) => normalizeDailyItem(d, i))
    .filter((d): d is DailyForecast => d !== null);

  const aiSummary = pickString(
    payload.ai_summary,
    payload.aiSummary,
    payload.summary,
    (payload.ai as Record<string, unknown>)?.summary,
    (payload.ai as Record<string, unknown>)?.text,
    typeof payload.ai === "string" ? payload.ai : undefined
  );

  const location = pickString(
    payload.location,
    payload.city,
    (payload.geo as Record<string, unknown>)?.city,
    root.location as string
  );

  return {
    location,
    current: normalizeCurrent(payload),
    daily,
    aiSummary,
    units,
    raw: data,
  };
}
