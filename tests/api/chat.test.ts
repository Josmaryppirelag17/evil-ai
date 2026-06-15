import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetChatCompletion = vi.fn();
const mockGetSession = vi.fn();
const mockPushMessage = vi.fn();
const mockLimit = vi.fn().mockResolvedValue({ success: true, remaining: 9 });

vi.mock("@/lib/groq", () => ({
  getChatCompletion: mockGetChatCompletion,
}));

vi.mock("@/lib/sessions", () => ({
  getSession: mockGetSession,
  pushMessage: mockPushMessage,
}));

vi.mock("@/lib/auth", () => ({
  getSessionUser: vi.fn().mockResolvedValue(null),
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

vi.mock("@/lib/db/connection", () => ({
  getDb: vi.fn(() => null),
}));

const { POST } = await import("@/app/api/chat/route");

describe("api/chat (POST)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLimit.mockResolvedValue({ success: true, remaining: 9 });
    mockGetSession.mockResolvedValue({ messages: [] });
    mockGetChatCompletion.mockResolvedValue("This is a response from VIL");
    mockPushMessage.mockResolvedValue(undefined);
  });

  it("returns chat completion for valid input", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ query: "Hello" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.text).toBe("This is a response from VIL");
  });

  it("rejects when rate limited", async () => {
    mockLimit.mockResolvedValueOnce({ success: false });
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ query: "Hello" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it("rejects honeypot (_honey)", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ query: "Hello", _honey: "spam" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockGetChatCompletion).not.toHaveBeenCalled();
  });

  it("rejects invalid body with 400", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 when GROQ_API_KEY is missing", async () => {
    mockGetChatCompletion.mockRejectedValue(new Error("GROQ_API_KEY no configurada"));
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ query: "Hello" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("uses default session_id when not provided", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ query: "Hello" }),
    });
    await POST(req);
    expect(mockGetSession).toHaveBeenCalledWith("default", undefined);
  });

  it("uses provided session_id", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ query: "Hello", session_id: "abc123" }),
    });
    await POST(req);
    expect(mockGetSession).toHaveBeenCalledWith("abc123", undefined);
  });

  it("persists user message and assistant response", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ query: "Hello", session_id: "s1" }),
    });
    await POST(req);
    expect(mockPushMessage).toHaveBeenCalledWith("s1", "user", "Hello");
    expect(mockPushMessage).toHaveBeenCalledWith("s1", "assistant", "This is a response from VIL");
  });
});

describe("GET /api/chat/messages", () => {
  it("returns empty array for missing sessionId", async () => {
    const { GET } = await import("@/app/api/chat/messages/route");
    const req = new Request("http://localhost/api/chat/messages");
    const res = await GET(req);
    const body = await res.json();
    expect(body).toEqual([]);
  });
});
