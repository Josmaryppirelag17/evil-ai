import { NextResponse } from "next/server";
import { eq, and, gt, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db/connection";
import { authSessions } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auth/audit";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ authenticated: false }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const sessions = await db
    .select({
      id: authSessions.id,
      ipAddress: authSessions.ipAddress,
      userAgent: authSessions.userAgent,
      createdAt: authSessions.createdAt,
      expiresAt: authSessions.expiresAt,
    })
    .from(authSessions)
    .where(
      and(
        eq(authSessions.userId, user.id),
        gt(authSessions.expiresAt, new Date()),
        isNull(authSessions.revokedAt),
      ),
    );

  return NextResponse.json({ sessions });
}

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ authenticated: false }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  await db.update(authSessions).set({ revokedAt: new Date() }).where(
    and(eq(authSessions.id, Number(sessionId)), eq(authSessions.userId, user.id)),
  );

  const ip = request.headers.get("x-forwarded-for") ?? undefined;
  const ua = request.headers.get("user-agent") ?? undefined;
  await logAuditEvent(db!, user.id, AUDIT_ACTIONS.SESSION_REVOKE, ip, ua, { sessionId });

  return NextResponse.json({ success: true });
}
