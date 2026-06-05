export interface WeatherAlertEvent {
  id: string;
  receivedAt: string;
  trigger?: string;
  message?: string;
  lat?: number;
  lon?: number;
  locationLabel?: string;
  severity?: string;
  raw: unknown;
}

const MAX_EVENTS = 50;
const events: WeatherAlertEvent[] = [];

function pickString(...vals: unknown[]): string | undefined {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

function asNumber(v: unknown): number | undefined {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
}

export function normalizeWebhookPayload(body: unknown): Omit<WeatherAlertEvent, "id" | "receivedAt" | "raw"> {
  const root =
    body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  const data = (root.data as Record<string, unknown>) ?? root;
  const alert = (data.alert as Record<string, unknown>) ?? data;

  const trigger = pickString(
    alert.trigger,
    alert.type,
    alert.event,
    data.trigger,
    root.trigger
  );

  const message = pickString(
    alert.message,
    alert.summary,
    alert.description,
    data.message,
    root.message
  );

  const lat =
    asNumber(alert.lat) ??
    asNumber(data.lat) ??
    asNumber((alert.location as Record<string, unknown>)?.lat);

  const lon =
    asNumber(alert.lon) ??
    asNumber(data.lon) ??
    asNumber((alert.location as Record<string, unknown>)?.lon);

  return {
    trigger,
    message,
    lat,
    lon,
    locationLabel: pickString(alert.location, data.location, alert.city),
    severity: pickString(alert.severity, data.severity, alert.level),
  };
}

export function recordWebhookEvent(body: unknown): WeatherAlertEvent {
  const normalized = normalizeWebhookPayload(body);
  const event: WeatherAlertEvent = {
    id: `wh-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    receivedAt: new Date().toISOString(),
    raw: body,
    ...normalized,
  };

  events.unshift(event);
  if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;

  return event;
}

export function getRecentAlerts(limit = 20): WeatherAlertEvent[] {
  return events.slice(0, limit);
}
