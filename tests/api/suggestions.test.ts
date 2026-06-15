import { describe, it, expect, vi, beforeEach } from "vitest";

const mockLimit = vi.fn().mockResolvedValue({ success: true, remaining: 4 });

vi.mock("@/lib/rateLimit", () => ({
  createRateLimiter: vi.fn(() => ({ limit: mockLimit, check: mockLimit })),
}));

vi.mock("@/lib/gemini", () => ({
  suggestions: [
    { text: "Suggestion 1", category: "general" },
    { text: "Suggestion 2", category: "code" },
  ],
}));

vi.mock("next/server", () => ({
  NextRequest: class extends Request {},
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), {
        status: init?.status ?? 200,
        headers: { "content-type": "application/json" },
      }),
  },
}));

vi.mock("@/lib/api-error", () => ({
  handleApiError: (error: unknown) => {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  },
  handleRateLimitError: () =>
    new Response(JSON.stringify({ error: "Demasiadas solicitudes" }), {
      status: 429,
      headers: { "content-type": "application/json" },
    }),
}));

const { GET } = await import("@/app/api/suggestions/route");

describe("api/suggestions (GET)", () => {
  beforeEach(() => {
    mockLimit.mockReset();
    mockLimit.mockResolvedValue({ success: true, remaining: 4 });
  });

  it("returns suggestions on valid request", async () => {
    const req = new Request("http://localhost/api/suggestions");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(2);
  });

  it("rejects when rate limited", async () => {
    mockLimit.mockResolvedValueOnce({ success: false });

    const req = new Request("http://localhost/api/suggestions");
    const res = await GET(req);
    expect(res.status).toBe(429);
  });

  it("passes context and limit parameters", async () => {
    const req = new Request("http://localhost/api/suggestions?context=test&limit=3");
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it("rejects invalid limit parameter", async () => {
    const req = new Request("http://localhost/api/suggestions?limit=999");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });
});
