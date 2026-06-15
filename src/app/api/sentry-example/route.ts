import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    throw new Error("Sentry Test API Error");
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Error sent to Sentry" }, { status: 500 });
  }
}
