import { getDb } from "@/lib/db/connection";
import { sessions, messages } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

type SessionData = { messages: { role: string; text: string }[] };

async function getOrCreateSession(sid: string, userId?: number): Promise<void> {
  const db = getDb();
  if (!db) return;
  const existing = await db.select().from(sessions).where(eq(sessions.sessionId, sid)).limit(1);
  if (existing.length === 0) {
    await db.insert(sessions).values({ sessionId: sid, metadata: {}, userId: userId ?? null });
  } else if (userId && existing[0] && !existing[0].userId) {
    await db.update(sessions).set({ userId }).where(eq(sessions.sessionId, sid));
  }
}

async function saveMessage(sid: string, role: string, text: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.insert(messages).values({ sessionId: sid, role, content: text });
  await db.update(sessions).set({ updatedAt: new Date() }).where(eq(sessions.sessionId, sid));
}

async function getSessionMessages(sid: string): Promise<{ role: string; content: string }[]> {
  const db = getDb();
  if (!db) return [];
  return db.select({ role: messages.role, content: messages.content }).from(messages).where(eq(messages.sessionId, sid)).orderBy(asc(messages.createdAt));
}

export async function getSession(sid: string, userId?: number): Promise<SessionData> {
  const msgs = await getSessionMessages(sid);
  const mapped = msgs.map((m) => ({ role: m.role, text: m.content }));
  const session: SessionData = { messages: mapped };
  await getOrCreateSession(sid, userId);
  return session;
}

export async function pushMessage(sid: string, role: string, text: string) {
  await saveMessage(sid, role, text);
}
