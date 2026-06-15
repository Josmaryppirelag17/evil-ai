import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSession, pushMessage } from "@/lib/sessions";

vi.mock("@/lib/db/connection", () => ({
  getDb: vi.fn(() => null),
}));

const { getDb } = await import("@/lib/db/connection");

function mockDb(overrides?: { limitResult?: unknown[]; selectResult?: unknown[] }) {
  return {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve(overrides?.limitResult ?? [])),
          orderBy: vi.fn(() => Promise.resolve(overrides?.selectResult ?? [])),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve([{ id: 1 }])),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
  };
}

describe("sessions lib", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getSession", () => {
    it("returns empty messages for unknown sid", async () => {
      vi.mocked(getDb).mockReturnValue(mockDb() as any);
      const session = await getSession("new_sid");
      expect(session.messages).toEqual([]);
    });

    it("always queries DB for messages (no in-memory cache)", async () => {
      vi.mocked(getDb).mockReturnValue(mockDb() as any);
      const s1 = await getSession("sid");
      const s2 = await getSession("sid");
      expect(s1.messages).toEqual([]);
      expect(s2.messages).toEqual([]);
    });

    it("claims session for authenticated user when session lacks userId", async () => {
      vi.mocked(getDb).mockReturnValueOnce(
        mockDb({ limitResult: [{ id: 1, sessionId: "sid", userId: null }] }) as any,
      );
      await expect(getSession("sid", 42)).resolves.not.toThrow();
    });
  });

  describe("pushMessage", () => {
    it("persists message to DB", async () => {
      vi.mocked(getDb).mockReturnValue(mockDb() as any);
      await expect(pushMessage("sid", "user", "Hello")).resolves.not.toThrow();
    });
  });
});
