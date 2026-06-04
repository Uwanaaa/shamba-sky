import type { FarmField } from "./types";

const STORAGE_KEY = "shamba-sky-fields-v1";
export const MAX_FIELDS = 3;

export const DEFAULT_FIELDS: FarmField[] = [
  {
    id: "demo-nairobi",
    name: "Upper Plot — Nairobi",
    lat: -1.2921,
    lon: 36.8219,
    crop: "maize",
    emoji: "🌽",
  },
  {
    id: "demo-bomet",
    name: "Tea Terrace — Bomet",
    lat: -0.7813,
    lon: 35.3419,
    crop: "tea",
    emoji: "🍃",
  },
];

export function loadFields(): FarmField[] {
  if (typeof window === "undefined") return DEFAULT_FIELDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FIELDS;
    const parsed = JSON.parse(raw) as FarmField[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_FIELDS;
    return parsed.slice(0, MAX_FIELDS);
  } catch {
    return DEFAULT_FIELDS;
  }
}

export function saveFields(fields: FarmField[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fields.slice(0, MAX_FIELDS)));
}

export function newFieldId(): string {
  return `field-${Date.now().toString(36)}`;
}
