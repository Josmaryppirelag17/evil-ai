import { describe, it, expect } from "vitest";
import { sessions, messages } from "@/lib/db/schema";

describe("AI DB schema", () => {
  describe("sessions table", () => {
    it("has correct column names", () => {
      const cols = Object.keys(sessions).filter(
        (k) => typeof (sessions as any)[k] === "object" && (sessions as any)[k].table === sessions
      );
      expect(cols).toContain("id");
      expect(cols).toContain("sessionId");
      expect(cols).toContain("createdAt");
      expect(cols).toContain("updatedAt");
      expect(cols).toContain("metadata");
    });

    it("has id as serial primary key", () => {
      expect(sessions.id.primary).toBe(true);
      expect(sessions.id.notNull).toBe(true);
    });

    it("has sessionId unique and not null", () => {
      expect(sessions.sessionId.notNull).toBe(true);
      expect(sessions.sessionId.isUnique).toBe(true);
    });

    it("has createdAt with default", () => {
      expect(sessions.createdAt.hasDefault).toBe(true);
    });

    it("has updatedAt with default", () => {
      expect(sessions.updatedAt.hasDefault).toBe(true);
    });

    it("has metadata nullable", () => {
      expect(sessions.metadata.notNull).toBe(false);
    });
  });

  describe("messages table", () => {
    it("has correct column names", () => {
      const cols = Object.keys(messages).filter(
        (k) => typeof (messages as any)[k] === "object" && (messages as any)[k].table === messages
      );
      expect(cols).toContain("id");
      expect(cols).toContain("sessionId");
      expect(cols).toContain("role");
      expect(cols).toContain("content");
      expect(cols).toContain("createdAt");
      expect(cols).toContain("sources");
      expect(cols).toContain("suggestions");
    });

    it("has id as serial primary key", () => {
      expect(messages.id.primary).toBe(true);
      expect(messages.id.notNull).toBe(true);
    });

    it("has sessionId not null with FK", () => {
      expect(messages.sessionId.notNull).toBe(true);
    });

    it("has role not null", () => {
      expect(messages.role.notNull).toBe(true);
    });

    it("has content not null", () => {
      expect(messages.content.notNull).toBe(true);
    });

    it("has createdAt with default", () => {
      expect(messages.createdAt.hasDefault).toBe(true);
    });

    it("has sources nullable", () => {
      expect(messages.sources.notNull).toBe(false);
    });

    it("has suggestions nullable", () => {
      expect(messages.suggestions.notNull).toBe(false);
    });
  });

});
