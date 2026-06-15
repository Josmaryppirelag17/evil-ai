import { describe, it, expect } from "vitest";
import {
  handleApiError,
  handleRateLimitError,
} from "@/lib/api-error";

describe("api-error", () => {
  describe("handleApiError", () => {
    it("returns 401 for GROQ_API_KEY errors", () => {
      const res = handleApiError(new Error("GROQ_API_KEY no configurada"), "chat");
      expect(res.status).toBe(401);
    });

    it("returns 401 for SERPER_API_KEY errors", () => {
      const res = handleApiError(new Error("SERPER_API_KEY no configurada"), "search");
      expect(res.status).toBe(401);
    });

    it("returns 500 for other errors", () => {
      const res = handleApiError(new Error("Something else"), "test");
      expect(res.status).toBe(500);
    });

    it("returns 500 for unknown error type", () => {
      const res = handleApiError("string error", "test");
      expect(res.status).toBe(500);
    });

    it("includes hint for GROQ_API_KEY", async () => {
      const res = handleApiError(new Error("GROQ_API_KEY"), "chat");
      const body = await res.json();
      expect(body.hint).toContain("console.groq.com");
    });

    it("includes hint for SERPER_API_KEY", async () => {
      const res = handleApiError(new Error("SERPER_API_KEY"), "search");
      const body = await res.json();
      expect(body.hint).toContain("serper.dev");
    });

    it("returns error message in body", async () => {
      const res = handleApiError(new Error("Custom error"), "test");
      const body = await res.json();
      expect(body.error).toBe("Custom error");
    });
  });

  describe("handleRateLimitError", () => {
    it("returns 429 with message", async () => {
      const res = handleRateLimitError();
      expect(res.status).toBe(429);
      const body = await res.json();
      expect(body.error).toContain("Demasiadas solicitudes");
    });
  });
});
