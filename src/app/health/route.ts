import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const waiConfigured = Boolean(process.env.WAI_API_KEY?.trim());
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY?.trim());

  const status = waiConfigured ? "ok" : "degraded";
  const httpStatus = waiConfigured ? 200 : 503;

  return NextResponse.json(
    {
      status,
      service: "shamba-sky",
      timestamp: new Date().toISOString(),
      checks: {
        api: "up",
        weatherAiKey: waiConfigured ? "configured" : "missing",
        geminiKey: geminiConfigured ? "configured" : "optional",
      },
    },
    { status: httpStatus }
  );
}
