import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/connection";
import { messages } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json([]);
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json([]);
    }

    const msgs = await db
      .select({
        role: messages.role,
        content: messages.content,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(asc(messages.createdAt));

    let counter = 0;
    const result = msgs.map((m) => ({
      id: `msg-${m.role}-${++counter}`,
      role: m.role,
      text: m.content,
      timestamp: m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : "",
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json([]);
  }
}
