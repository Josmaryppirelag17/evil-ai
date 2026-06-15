import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db/connection";
import { users, authSessions, passwordResetTokens } from "@/lib/db/schema";
import { eq, and, or, gt } from "drizzle-orm";
import { cookies } from "next/headers";

const SESSION_COOKIE = "vil_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const SALT_ROUNDS = 12;

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function registerUser(
  email: string,
  username: string,
  name: string,
  lastName: string,
  password: string,
): Promise<{ success: true; userId: number } | { success: false; error: string }> {
  const db = getDb();
  if (!db) return { success: false, error: "Database not configured" };

  try {
    const existingEmail = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (existingEmail.length > 0) {
      return { success: false, error: "Email already registered" };
    }

    const existingUsername = await db.select().from(users).where(eq(users.username, username.toLowerCase())).limit(1);
    if (existingUsername.length > 0) {
      return { success: false, error: "Username already taken" };
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await db.insert(users).values({
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      name,
      lastName,
      passwordHash,
    }).returning({ id: users.id });

    const firstResult = result[0];
    if (!firstResult) return { success: false, error: "Registration failed" };
    return { success: true, userId: firstResult.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Registration failed";
    return { success: false, error: msg };
  }
}

export async function loginUser(
  emailOrUsername: string,
  password: string,
): Promise<{ success: true; userId: number; token: string } | { success: false; error: string }> {
  const db = getDb();
  if (!db) return { success: false, error: "Database not configured" };

  try {
    const result = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, emailOrUsername.toLowerCase()),
          eq(users.username, emailOrUsername.toLowerCase()),
        ),
      )
      .limit(1);
    if (result.length === 0) {
      return { success: false, error: "Invalid email/username or password" };
    }

    const user = result[0];
    if (!user) return { success: false, error: "Invalid email/username or password" };
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return { success: false, error: "Invalid email/username or password" };
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    await db.insert(authSessions).values({
      userId: user.id,
      token,
      expiresAt,
    });

    return { success: true, userId: user.id, token };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Login failed";
    return { success: false, error: msg };
  }
}

export async function getSessionUser(): Promise<{ id: number; email: string; username: string; name: string; lastName: string } | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const result = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        name: users.name,
        lastName: users.lastName,
      })
      .from(authSessions)
      .innerJoin(users, eq(authSessions.userId, users.id))
      .where(
        and(
          eq(authSessions.token, token),
          gt(authSessions.expiresAt, new Date()),
        ),
      )
      .limit(1);

    return result[0] ?? null;
  } catch {
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (token) {
      await db.delete(authSessions).where(eq(authSessions.token, token));
    }
    cookieStore.delete(SESSION_COOKIE);
  } catch (err) {
    console.error("[auth] logout error:", err);
  }
}

export async function createPasswordResetToken(
  email: string,
): Promise<{ success: true; resetToken: string; resetUrl: string } | { success: false; error: string }> {
  const db = getDb();
  if (!db) return { success: false, error: "Database not configured" };

  try {
    const userResult = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (userResult.length === 0) {
      return { success: false, error: "No account found with that email" };
    }

    const user = userResult[0];
    if (!user) return { success: false, error: "No account found with that email" };
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    });

    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/auth/reset-password/${token}`;

    return { success: true, resetToken: token, resetUrl };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create reset token";
    return { success: false, error: msg };
  }
}

export async function validateResetToken(
  token: string,
): Promise<{ success: true; userId: number } | { success: false; error: string }> {
  const db = getDb();
  if (!db) return { success: false, error: "Database not configured" };

  try {
    const result = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (result.length === 0) {
      return { success: false, error: "Invalid or expired reset token" };
    }

    const resetToken = result[0];
    if (!resetToken) return { success: false, error: "Invalid or expired reset token" };
    if (resetToken.usedAt) {
      return { success: false, error: "Reset token has already been used" };
    }

    return { success: true, userId: resetToken.userId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to validate reset token";
    return { success: false, error: msg };
  }
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const db = getDb();
  if (!db) return { success: false, error: "Database not configured" };

  try {
    const validation = await validateResetToken(token);
    if (!validation.success) return validation;

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await db.transaction(async (tx) => {
      await tx.update(users).set({ passwordHash }).where(eq(users.id, validation.userId));
      await tx
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(eq(passwordResetTokens.token, token));
      await tx.delete(authSessions).where(eq(authSessions.userId, validation.userId));
    });

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to reset password";
    return { success: false, error: msg };
  }
}

export function getSessionCookieConfig(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_DURATION_MS / 1000,
    path: "/",
  };
}
