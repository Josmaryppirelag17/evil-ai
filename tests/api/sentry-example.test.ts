import { describe, it, expect, vi } from "vitest";
import { GET } from "@/app/api/sentry-example/route";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("GET /api/sentry-example", () => {
  it("returns 500 when triggered", async () => {
    const res = await GET();
    expect(res.status).toBe(500);
  });
});
