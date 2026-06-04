import { NextRequest, NextResponse } from "next/server";
import { normalizeWeatherResponse } from "@/lib/weather-normalize";

const BASE = "https://api.weather-ai.co/v1/weather";

export async function GET(request: NextRequest) {
  const key = process.env.WAI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "WAI_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const { searchParams } = request.nextUrl;
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "lat and lon are required." },
      { status: 400 }
    );
  }

  const days = searchParams.get("days") ?? "7";
  const ai = searchParams.get("ai") ?? "true";
  const units = searchParams.get("units") ?? "metric";
  const lang = searchParams.get("lang") ?? "en";

  const url = new URL(BASE);
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lon);
  url.searchParams.set("days", days);
  url.searchParams.set("ai", ai);
  url.searchParams.set("units", units);
  url.searchParams.set("lang", lang);

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${key}` },
      next: { revalidate: ai === "false" ? 300 : 600 },
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            (body as { message?: string }).message ??
            (body as { error?: string }).error ??
            `Weather API returned ${res.status}`,
          status: res.status,
          details: body,
        },
        { status: res.status }
      );
    }

    const normalized = normalizeWeatherResponse(
      body,
      units === "imperial" ? "imperial" : "metric"
    );

    return NextResponse.json({
      ...normalized,
      rateLimit: {
        limit: res.headers.get("X-RateLimit-Limit"),
        remaining: res.headers.get("X-RateLimit-Remaining"),
        reset: res.headers.get("X-RateLimit-Reset"),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
