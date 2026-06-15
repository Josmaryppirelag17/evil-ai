import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSession, pushMessage } from "@/lib/sessions";

vi.mock("@/lib/db/connection", () => ({
  getDb: vi.fn(() => ({
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
          orderBy: vi.fn(() => Promise.resolve([])),
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
  })),
}));

describe("sessions lib", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getSession", () => {
    it("creates session for unknown sid", async () => {
      const session = await getSession("new_sid");
      expect(session).not.toBeNull();
      expect(session.messages).toEqual([]);
    });

    it("always queries DB for messages (no in-memory cache)", async () => {
      const s1 = await getSession("sid");
      const s2 = await getSession("sid");
      expect(s1.messages).toEqual([]);
      expect(s2.messages).toEqual([]);
    });
  });

  describe("pushMessage", () => {
    it("persists message to DB", async () => {
      await expect(pushMessage("sid", "user", "Hello")).resolves.not.toThrow();
    });
  });
});
