import { NextResponse } from "next/server";
import { getRecentAlerts } from "@/lib/webhook-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    alerts: getRecentAlerts(20),
    webhookUrl: process.env.NEXT_PUBLIC_WEBHOOK_URL ?? null,
  });
}
