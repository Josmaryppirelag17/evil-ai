import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetSession = vi.fn();
const mockPushMessage = vi.fn();
const mockLimit = vi.fn().mockResolvedValue({ success: true, remaining: 14 });

vi.mock("@/lib/sessions", () => ({
  getSession: mockGetSession,
  pushMessage: mockPushMessage,
}));

vi.mock("@/lib/groq", () => ({
  getChatCompletion: vi.fn(),
  getChatCompletionStream: vi.fn(),
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

const { POST } = await import("@/app/api/chat/stream/route");

function collectSSE(res: Response): Promise<string[]> {
  return res.text().then((text) =>
    text
      .split("\n")
      .filter((l) => l.startsWith("data: "))
      .map((l) => l.slice(6))
  );
}

describe("api/chat/stream (POST)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLimit.mockResolvedValue({ success: true, remaining: 14 });
    mockGetSession.mockResolvedValue({ messages: [] });
    mockPushMessage.mockResolvedValue(undefined);
  });

  it("rejects honeypot (_honey)", async () => {
    const req = new Request("http://localhost/api/chat/stream", {
      method: "POST",
      body: JSON.stringify({ query: "hello", _honey: "spam" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejects empty query", async () => {
    const req = new Request("http://localhost/api/chat/stream", {
      method: "POST",
      body: JSON.stringify({ query: "" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejects missing query", async () => {
    const req = new Request("http://localhost/api/chat/stream", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejects when rate limited", async () => {
    mockLimit.mockResolvedValueOnce({ success: false });
    const req = new Request("http://localhost/api/chat/stream", {
      method: "POST",
      body: JSON.stringify({ query: "hello" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it("returns SSE stream with correct content-type", async () => {
    const { getChatCompletionStream } = await import("@/lib/groq");
    const mockAsyncGen = (async function* () {
      yield "Hello";
      yield " world";
    })();
    vi.mocked(getChatCompletionStream).mockReturnValue(mockAsyncGen);

    const req = new Request("http://localhost/api/chat/stream", {
      method: "POST",
      body: JSON.stringify({ query: "hello" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/event-stream");

    const events = await collectSSE(res);
    expect(events[0]).toBe(JSON.stringify({ chunk: "Hello" }));
    expect(events[1]).toBe(JSON.stringify({ chunk: " world" }));
    expect(events[2]).toBe(JSON.stringify({ done: true }));
  });

  it("streams error in SSE when groq fails", async () => {
    const { getChatCompletionStream } = await import("@/lib/groq");
    const mockAsyncGen = (async function* () {
      yield;
      throw new Error("GROQ_API_KEY no configurada");
    })();
    vi.mocked(getChatCompletionStream).mockReturnValue(mockAsyncGen);

    const req = new Request("http://localhost/api/chat/stream", {
      method: "POST",
      body: JSON.stringify({ query: "hello" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const events = await collectSSE(res);
    expect(events[1]).toContain("GROQ_API_KEY no configurada");
  });

  it("persists user message before stream and full assistant response after", async () => {
    const { getChatCompletionStream } = await import("@/lib/groq");
    const mockAsyncGen = (async function* () {
      yield "Response";
    })();
    vi.mocked(getChatCompletionStream).mockReturnValue(mockAsyncGen);

    const req = new Request("http://localhost/api/chat/stream", {
      method: "POST",
      body: JSON.stringify({ query: "hello", session_id: "s1" }),
    });
    const res = await POST(req);
    await collectSSE(res);

    expect(mockPushMessage).toHaveBeenCalledWith("s1", "user", "hello");
    expect(mockPushMessage).toHaveBeenCalledWith("s1", "assistant", "Response");
  });
});
