import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local without dotenv package
const envPath = resolve(process.cwd(), ".env.local");
try {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
} catch {
  console.warn("No .env.local found");
}

const { generateFarmerAdvice } = await import("../src/lib/gemini");

const result = await generateFarmerAdvice({
  fieldName: "Upper Plot — Nairobi",
  crop: "maize",
  lang: "en",
  current: { temp: 24, condition: "Partly cloudy", humidity: 62, windKph: 12 },
  daily: [
    { label: "Thu, Jun 5", tempMax: 26, tempMin: 18, condition: "Sunny", precipMm: 0 },
    { label: "Fri, Jun 6", tempMax: 24, tempMin: 17, condition: "Light rain", precipMm: 4 },
  ],
  aiSummary: "Mild week with light rain Friday.",
});

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
