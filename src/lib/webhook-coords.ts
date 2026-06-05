/**
 * Suggested coordinates for Weather-AI dashboard webhooks.
 * @see https://weather-ai.co/docs — Webhooks (Pro+)
 */

export interface WebhookLocationPreset {
  id: string;
  name: string;
  lat: number;
  lon: number;
  crop?: string;
  note: string;
}

/** Matches default shamba plots in the app — use these in the Weather-AI dashboard. */
export const WEBHOOK_LOCATION_PRESETS: WebhookLocationPreset[] = [
  {
    id: "nairobi-maize",
    name: "Upper Plot — Nairobi (maize)",
    lat: -1.2921,
    lon: 36.8219,
    crop: "maize",
    note: "Best default if you only configure ONE webhook. Near Weather-AI’s Nairobi example (-1.286, 36.817).",
  },
  {
    id: "bomet-tea",
    name: "Tea Terrace — Bomet",
    lat: -0.7813,
    lon: 35.3419,
    crop: "tea",
    note: "Use a second webhook (Pro: up to 10) to monitor your tea plot separately.",
  },
];

export const DEFAULT_WEBHOOK_PRESET = WEBHOOK_LOCATION_PRESETS[0];
