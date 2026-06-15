import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type * as schema from "@/lib/db/schema";
import { auditLogs } from "@/lib/db/schema";

export const AUDIT_ACTIONS = {
  REGISTER: "register",
  LOGIN: "login",
  LOGIN_FAILED: "login_failed",
  LOGOUT: "logout",
  EMAIL_VERIFY: "email_verify",
  PASSWORD_RESET: "password_reset",
  SESSION_REVOKE: "session_revoke",
  LOCKOUT: "lockout",
} as const;

export async function logAuditEvent(
  db: NeonHttpDatabase<typeof schema>,
  userId: number | null,
  action: string,
  ipAddress?: string | null,
  userAgent?: string | null,
  metadata?: Record<string, unknown>,
) {
  try {
    await db.insert(auditLogs).values({
      userId,
      action,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      metadata: metadata ?? null,
    });
  } catch (err) {
    console.error(`[audit] Failed to log ${action}:`, err);
  }
}
