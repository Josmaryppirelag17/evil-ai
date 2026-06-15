import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db/connection";
import { sessions, messages } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json([]);
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json([]);
  }

  const userSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, user.id))
    .orderBy(desc(sessions.updatedAt));

  const result = await Promise.all(
    userSessions.map(async (session) => {
      const msgs = await db
        .select()
        .from(messages)
        .where(eq(messages.sessionId, session.sessionId))
        .orderBy(messages.createdAt);
      return { ...session, messages: msgs };
    }),
  );

  return NextResponse.json(result);
}
