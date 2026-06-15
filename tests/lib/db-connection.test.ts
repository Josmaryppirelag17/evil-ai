import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("db connection (AI)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns null when DATABASE_URL is not set", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { getDb } = await import("@/lib/db/connection");
    const db = getDb();
    expect(db).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("returns a Drizzle instance when DATABASE_URL is set", async () => {
    vi.stubEnv("DATABASE_URL", "postgres://test:test@localhost:5432/test");
    const { getDb } = await import("@/lib/db/connection");
    const db = getDb();
    expect(db).not.toBeNull();
  });

  it("returns cached instance on second call", async () => {
    vi.stubEnv("DATABASE_URL", "postgres://test:test@localhost:5432/test");
    const { getDb } = await import("@/lib/db/connection");
    const db1 = getDb();
    const db2 = getDb();
    expect(db1).toBe(db2);
  });
});
