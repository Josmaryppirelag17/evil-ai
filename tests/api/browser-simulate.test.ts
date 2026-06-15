import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetChatCompletion = vi.fn();
const mockLimit = vi.fn().mockResolvedValue({ success: true, remaining: 4 });

vi.mock("@/lib/groq", () => ({
  getChatCompletion: mockGetChatCompletion,
}));

vi.mock("@/lib/rateLimit", () => ({
  createRateLimiter: vi.fn(() => ({ limit: mockLimit, check: mockLimit })),
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
      status: msg.includes("API_KEY") ? 401 : 500,
      headers: { "content-type": "application/json" },
    });
  },
  handleRateLimitError: () =>
    new Response(JSON.stringify({ error: "Demasiadas solicitudes" }), {
      status: 429,
      headers: { "content-type": "application/json" },
    }),
  checkHoneypot: (body: Record<string, unknown>) =>
    body._honey
      ? new Response(JSON.stringify({ error: "Solicitud rechazada" }), {
          status: 400,
          headers: { "content-type": "application/json" },
        })
      : null,
}));

const { POST } = await import("@/app/api/browser/simulate/route");

describe("api/browser/simulate (POST)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLimit.mockResolvedValue({ success: true, remaining: 4 });
    mockGetChatCompletion.mockResolvedValue("Simulated retro terminal content");
  });

  it("returns simulated content for valid request", async () => {
    const req = new Request("http://localhost/api/browser/simulate", {
      method: "POST",
      body: JSON.stringify({ url: "https://example.com" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.content).toBe("Simulated retro terminal content");
  });

  it("rejects when rate limited", async () => {
    mockLimit.mockResolvedValueOnce({ success: false });
    const req = new Request("http://localhost/api/browser/simulate", {
      method: "POST",
      body: JSON.stringify({ url: "https://example.com" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it("rejects honeypot (_honey)", async () => {
    const req = new Request("http://localhost/api/browser/simulate", {
      method: "POST",
      body: JSON.stringify({ url: "https://example.com", _honey: "spam" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejects invalid URL with 400", async () => {
    const req = new Request("http://localhost/api/browser/simulate", {
      method: "POST",
      body: JSON.stringify({ url: "not-a-url" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 when GROQ_API_KEY is missing", async () => {
    mockGetChatCompletion.mockRejectedValue(new Error("GROQ_API_KEY no configurada"));
    const req = new Request("http://localhost/api/browser/simulate", {
      method: "POST",
      body: JSON.stringify({ url: "https://example.com" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
