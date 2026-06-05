import { NextRequest, NextResponse } from "next/server";
import { recordWebhookEvent } from "@/lib/webhook-store";

export const dynamic = "force-dynamic";

/**
 * Weather-AI webhook receiver — configure in dashboard:
 * https://shamba-sky.onrender.com/webhook
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "shamba-sky",
    endpoint: "/webhook",
    method: "POST",
    message: "Ready to receive Weather-AI alert payloads.",
  });
}

export async function POST(request: NextRequest) {
  const secret = process.env.WEBHOOK_SECRET?.trim();
  if (secret) {
    const header =
      request.headers.get("x-webhook-secret") ??
      request.headers.get("x-weather-ai-signature") ??
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (header !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: unknown = null;
  try {
    const text = await request.text();
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { _parseError: true, note: "Non-JSON body received" };
  }

  const event = recordWebhookEvent(body);

  return NextResponse.json({
    ok: true,
    received: true,
    id: event.id,
    at: event.receivedAt,
  });
}
