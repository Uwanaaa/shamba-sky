import { NextRequest, NextResponse } from "next/server";
import {
  generateFarmerAdvice,
  type FarmerAdviceInput,
} from "@/lib/gemini";

export async function POST(request: NextRequest) {
  let payload: FarmerAdviceInput;
  try {
    payload = (await request.json()) as FarmerAdviceInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload.fieldName || !payload.current || !payload.daily?.length) {
    return NextResponse.json(
      { error: "fieldName, current, and daily are required" },
      { status: 400 }
    );
  }

  const result = await generateFarmerAdvice(payload);

  if (!result.ok) {
    const status =
      result.status === 401 || result.status === 403
        ? 502
        : result.error.includes("not configured")
          ? 503
          : 502;

    return NextResponse.json(
      {
        error: result.error,
        note: "Set GEMINI_API_KEY in shamba-sky/.env.local (or Render env) for farmer tips.",
      },
      { status }
    );
  }

  return NextResponse.json({
    ...result.data,
    source: "gemini" as const,
    model: result.model,
  });
}
