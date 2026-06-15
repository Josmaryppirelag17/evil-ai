import { describe, it, expect, vi, beforeEach } from "vitest";

const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  transaction: vi.fn(),
};

const mockHash = vi.fn(() => Promise.resolve("hashed_password"));
const mockCompare = vi.fn(() => Promise.resolve(true));

vi.mock("bcryptjs", () => {
  const mod = {
    hash: mockHash,
    compare: mockCompare,
    genSalt: vi.fn(),
    genSaltSync: vi.fn(),
    hashSync: vi.fn(),
    compareSync: vi.fn(),
  };
  return { ...mod, default: mod };
});

vi.mock("@/lib/db/connection", () => ({
  getDb: vi.fn(() => mockDb),
}));

vi.mock("drizzle-orm", () => ({
  eq: (a: any, b: any) => ({ a, b, op: "eq" }),
  and: (...args: any[]) => ({ args, op: "and" }),
  or: (...args: any[]) => ({ args, op: "or" }),
  gt: (a: any, b: any) => ({ a, b, op: "gt" }),
}));

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

const mockQueryBuilder = {
  from: vi.fn(),
  where: vi.fn(),
  limit: vi.fn(),
  values: vi.fn(),
  returning: vi.fn(),
  innerJoin: vi.fn(),
  set: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NODE_ENV", "test");

  mockDb.select.mockReturnValue(mockQueryBuilder);
  mockDb.insert.mockReturnValue(mockQueryBuilder);
  mockDb.update.mockReturnValue(mockQueryBuilder);
  mockDb.delete.mockReturnValue(mockQueryBuilder);
  mockQueryBuilder.from.mockReturnThis();
  mockQueryBuilder.where.mockReturnThis();
  mockQueryBuilder.limit.mockReturnThis();
  mockQueryBuilder.values.mockReturnThis();
  mockQueryBuilder.innerJoin.mockReturnThis();
  mockQueryBuilder.set.mockReturnThis();
  mockQueryBuilder.returning.mockResolvedValue([{ id: 1 }]);
  mockDb.transaction.mockImplementation(async (cb: any) => {
    await cb(mockDb);
  });
});

async function importModule() {
  return import("@/lib/auth");
}

describe("lib/auth", () => {
  // ─── registerUser ──────────────────────────────────────────
  describe("registerUser", () => {
    it("returns error when DB is not configured", async () => {
      const { getDb } = await import("@/lib/db/connection");
      (getDb as any).mockReturnValueOnce(null);
      const { registerUser } = await importModule();
      const result = await registerUser("t@t.com", "u", "F", "L", "pass");
      expect(result).toEqual({ success: false, error: "Database not configured" });
    });

    it("returns error when email already exists", async () => {
      mockQueryBuilder.limit.mockResolvedValueOnce([{ id: 1 }]);
      const { registerUser } = await importModule();
      const result = await registerUser("e@e.com", "u", "F", "L", "pass");
      expect(result).toEqual({ success: false, error: "Email already registered" });
    });

    it("returns error when username already taken", async () => {
      mockQueryBuilder.limit
        .mockResolvedValueOnce([])           // email check: empty
        .mockResolvedValueOnce([{ id: 2 }]); // username check: found
      const { registerUser } = await importModule();
      const result = await registerUser("e@e.com", "taken", "F", "L", "pass");
      expect(result).toEqual({ success: false, error: "Username already taken" });
    });

    it("registers user successfully", async () => {
      mockQueryBuilder.limit.mockResolvedValue([]);
      const { registerUser } = await importModule();
      const result = await registerUser("new@u.com", "newu", "New", "User", "pass123");
      expect(result).toEqual({ success: true, userId: 1 });
    });

    it("returns error when registration result is empty", async () => {
      mockQueryBuilder.limit.mockResolvedValue([]);
      mockQueryBuilder.returning.mockResolvedValueOnce([]);
      const { registerUser } = await importModule();
      const result = await registerUser("x@x.com", "x", "X", "Y", "pass");
      expect(result).toEqual({ success: false, error: "Registration failed" });
    });

    it("handles catch error during registration", async () => {
      mockQueryBuilder.limit.mockRejectedValue(new Error("DB error"));
      const { registerUser } = await importModule();
      const result = await registerUser("e@e.com", "u", "F", "L", "pass");
      expect(result).toEqual({ success: false, error: "DB error" });
    });

    it("handles non-Error catch during registration", async () => {
      mockQueryBuilder.limit.mockRejectedValue("string error");
      const { registerUser } = await importModule();
      const result = await registerUser("e@e.com", "u", "F", "L", "pass");
      expect(result).toEqual({ success: false, error: "Registration failed" });
    });
  });

  // ─── loginUser ──────────────────────────────────────────────
  describe("loginUser", () => {
    it("returns error when DB not configured", async () => {
      const { getDb } = await import("@/lib/db/connection");
      (getDb as any).mockReturnValueOnce(null);
      const { loginUser } = await importModule();
      const result = await loginUser("t@t.com", "pass");
      expect(result).toEqual({ success: false, error: "Database not configured" });
    });

    it("returns error when user not found", async () => {
      mockQueryBuilder.limit.mockResolvedValue([]);
      const { loginUser } = await importModule();
      const result = await loginUser("noone@t.com", "pass");
      expect(result.success).toBe(false);
    });

    it("returns error for wrong password", async () => {
      mockCompare.mockResolvedValueOnce(false);
      mockQueryBuilder.limit.mockResolvedValue([{ id: 1, passwordHash: "hash" }]);
      const { loginUser } = await importModule();
      const result = await loginUser("t@t.com", "wrong");
      expect(result.success).toBe(false);
    });

    it("returns error when user result is empty", async () => {
      mockQueryBuilder.limit.mockResolvedValue([null]);
      const { loginUser } = await importModule();
      const result = await loginUser("t@t.com", "pass");
      expect(result.success).toBe(false);
    });

    it("logs in successfully and creates session", async () => {
      mockQueryBuilder.limit.mockResolvedValue([{ id: 1, passwordHash: "hash" }]);
      const { loginUser } = await importModule();
      const result = await loginUser("t@t.com", "pass123");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.userId).toBe(1);
        expect(result.token).toBeTruthy();
      }
    });

    it("handles catch error during login", async () => {
      mockQueryBuilder.limit.mockRejectedValue(new Error("Login error"));
      const { loginUser } = await importModule();
      const result = await loginUser("t@t.com", "pass");
      expect(result).toEqual({ success: false, error: "Login error" });
    });
  });

  // ─── getSessionUser ─────────────────────────────────────────
  describe("getSessionUser", () => {
    it("returns null when DB not configured", async () => {
      const { getDb } = await import("@/lib/db/connection");
      (getDb as any).mockReturnValueOnce(null);
      const { getSessionUser } = await importModule();
      expect(await getSessionUser()).toBeNull();
    });

    it("returns null when no token cookie", async () => {
      mockCookieStore.get.mockReturnValueOnce(undefined);
      const { getSessionUser } = await importModule();
      expect(await getSessionUser()).toBeNull();
    });

    it("returns user when valid session", async () => {
      mockCookieStore.get.mockReturnValueOnce({ value: "valid-token" });
      mockQueryBuilder.limit.mockResolvedValue([{ id: 1, email: "u@u.com", username: "u", name: "N", lastName: "L" }]);
      const { getSessionUser } = await importModule();
      const user = await getSessionUser();
      expect(user).not.toBeNull();
      expect(user?.id).toBe(1);
    });

    it("returns null when session query returns empty", async () => {
      mockCookieStore.get.mockReturnValueOnce({ value: "token" });
      mockQueryBuilder.limit.mockResolvedValue([]);
      const { getSessionUser } = await importModule();
      expect(await getSessionUser()).toBeNull();
    });

    it("returns null on catch error", async () => {
      mockCookieStore.get.mockReturnValueOnce({ value: "token" });
      mockQueryBuilder.limit.mockRejectedValue(new Error("err"));
      const { getSessionUser } = await importModule();
      expect(await getSessionUser()).toBeNull();
    });
  });

  // ─── logoutUser ─────────────────────────────────────────────
  describe("logoutUser", () => {
    it("does nothing when DB not configured", async () => {
      const { getDb } = await import("@/lib/db/connection");
      (getDb as any).mockReturnValueOnce(null);
      const { logoutUser } = await importModule();
      await logoutUser();
      expect(mockCookieStore.delete).not.toHaveBeenCalled();
    });

    it("deletes session and clears cookie", async () => {
      mockCookieStore.get.mockReturnValueOnce({ value: "session-token" });
      const { logoutUser } = await importModule();
      await logoutUser();
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockCookieStore.delete).toHaveBeenCalledWith("vil_session");
    });

    it("clears cookie even without token", async () => {
      mockCookieStore.get.mockReturnValueOnce(undefined);
      const { logoutUser } = await importModule();
      await logoutUser();
      expect(mockCookieStore.delete).toHaveBeenCalledWith("vil_session");
    });

    it("handles catch error silently", async () => {
      mockCookieStore.get.mockImplementation(() => { throw new Error("fail"); });
      const { logoutUser } = await importModule();
      await logoutUser(); // should not throw
    });
  });

  // ─── createPasswordResetToken ───────────────────────────────
  describe("createPasswordResetToken", () => {
    it("returns error when DB not configured", async () => {
      const { getDb } = await import("@/lib/db/connection");
      (getDb as any).mockReturnValueOnce(null);
      const { createPasswordResetToken } = await importModule();
      const result = await createPasswordResetToken("t@t.com");
      expect(result).toEqual({ success: false, error: "Database not configured" });
    });

    it("returns error when user not found", async () => {
      mockQueryBuilder.limit.mockResolvedValue([]);
      const { createPasswordResetToken } = await importModule();
      const result = await createPasswordResetToken("noone@t.com");
      expect(result).toEqual({ success: false, error: "No account found with that email" });
    });

    it("returns error when user result is empty", async () => {
      mockQueryBuilder.limit.mockResolvedValue([null]);
      const { createPasswordResetToken } = await importModule();
      const result = await createPasswordResetToken("x@x.com");
      expect(result).toEqual({ success: false, error: "No account found with that email" });
    });

    it("creates reset token successfully", async () => {
      mockQueryBuilder.limit.mockResolvedValue([{ id: 1 }]);
      const { createPasswordResetToken } = await importModule();
      const result = await createPasswordResetToken("u@u.com");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.resetUrl).toContain("/auth/reset-password/");
      }
    });

    it("handles catch error", async () => {
      mockQueryBuilder.limit.mockRejectedValue(new Error("Reset error"));
      const { createPasswordResetToken } = await importModule();
      const result = await createPasswordResetToken("u@u.com");
      expect(result).toEqual({ success: false, error: "Reset error" });
    });
  });

  // ─── validateResetToken ─────────────────────────────────────
  describe("validateResetToken", () => {
    it("returns error when DB not configured", async () => {
      const { getDb } = await import("@/lib/db/connection");
      (getDb as any).mockReturnValueOnce(null);
      const { validateResetToken } = await importModule();
      const result = await validateResetToken("token");
      expect(result).toEqual({ success: false, error: "Database not configured" });
    });

    it("returns error when token not found", async () => {
      mockQueryBuilder.limit.mockResolvedValue([]);
      const { validateResetToken } = await importModule();
      const result = await validateResetToken("bad-token");
      expect(result).toEqual({ success: false, error: "Invalid or expired reset token" });
    });

    it("returns error when token result is empty", async () => {
      mockQueryBuilder.limit.mockResolvedValue([null]);
      const { validateResetToken } = await importModule();
      const result = await validateResetToken("bad-token");
      expect(result).toEqual({ success: false, error: "Invalid or expired reset token" });
    });

    it("returns error when token already used", async () => {
      mockQueryBuilder.limit.mockResolvedValue([{ userId: 1, usedAt: new Date() }]);
      const { validateResetToken } = await importModule();
      const result = await validateResetToken("used-token");
      expect(result).toEqual({ success: false, error: "Reset token has already been used" });
    });

    it("validates valid token successfully", async () => {
      mockQueryBuilder.limit.mockResolvedValue([{ userId: 1, usedAt: null }]);
      const { validateResetToken } = await importModule();
      const result = await validateResetToken("valid-token");
      expect(result).toEqual({ success: true, userId: 1 });
    });

    it("handles catch error", async () => {
      mockQueryBuilder.limit.mockRejectedValue(new Error("Validation error"));
      const { validateResetToken } = await importModule();
      const result = await validateResetToken("token");
      expect(result).toEqual({ success: false, error: "Validation error" });
    });
  });

  // ─── resetPasswordWithToken ─────────────────────────────────
  describe("resetPasswordWithToken", () => {
    it("returns error when DB not configured", async () => {
      const { getDb } = await import("@/lib/db/connection");
      (getDb as any).mockReturnValueOnce(null);
      const { resetPasswordWithToken } = await importModule();
      const result = await resetPasswordWithToken("token", "newpass");
      expect(result).toEqual({ success: false, error: "Database not configured" });
    });

    it("resets password successfully with transaction", async () => {
      mockQueryBuilder.limit.mockResolvedValue([{ userId: 1, usedAt: null }]);
      const { resetPasswordWithToken } = await importModule();
      const result = await resetPasswordWithToken("valid-token", "newpass123");
      expect(result).toEqual({ success: true });
      expect(mockHash).toHaveBeenCalled();
      expect(mockDb.transaction).toHaveBeenCalled();
    });

    it("handles catch error during reset", async () => {
      mockQueryBuilder.limit.mockResolvedValue([{ userId: 1, usedAt: null }]);
      mockDb.transaction.mockRejectedValueOnce(new Error("TX error"));
      const { resetPasswordWithToken } = await importModule();
      const result = await resetPasswordWithToken("token", "newpass");
      expect(result).toEqual({ success: false, error: "TX error" });
    });
  });

  // ─── getSessionCookieConfig ─────────────────────────────────
  describe("getSessionCookieConfig", () => {
    it("returns production config", async () => {
      vi.stubEnv("NODE_ENV", "production");
      const { getSessionCookieConfig } = await importModule();
      const config = getSessionCookieConfig("t");
      expect(config.name).toBe("vil_session");
      expect(config.httpOnly).toBe(true);
      expect(config.secure).toBe(true);
      expect(config.path).toBe("/");
      vi.unstubAllEnvs();
    });

    it("returns non-secure config in dev", async () => {
      const { getSessionCookieConfig } = await importModule();
      const config = getSessionCookieConfig("t");
      expect(config.secure).toBe(false);
    });
  });
});
