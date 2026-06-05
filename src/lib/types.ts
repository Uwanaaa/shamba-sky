export type Lang = "en" | "sw";

export interface FarmField {
  id: string;
  name: string;
  lat: number;
  lon: number;
  crop?: string;
  emoji?: string;
}

export interface CurrentWeather {
  temp: number;
  feelsLike?: number;
  humidity?: number;
  windKph?: number;
  condition: string;
  icon?: string;
}

export interface DailyForecast {
  date: string;
  label: string;
  tempMax: number;
  tempMin: number;
  precipMm?: number;
  precipChance?: number;
  windKph?: number;
  condition: string;
}

export interface NormalizedWeather {
  location?: string;
  current: CurrentWeather;
  daily: DailyForecast[];
  aiSummary?: string;
  units: "metric" | "imperial";
  raw?: unknown;
}

export interface FarmerAdvice {
  tips: string[];
  headline: string;
  source: "gemini";
}
