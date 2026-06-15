import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSearchGoogle = vi.fn();

vi.mock("@/lib/search", () => ({
  searchGoogle: mockSearchGoogle,
}));

vi.mock("@/lib/api-error", () => ({
  handleApiError: (error: unknown, code: string) => {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg, code }), {
      status: msg.includes("API_KEY") ? 401 : 500,
      headers: { "content-type": "application/json" },
    });
  },
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

const { POST } = await import("@/app/api/search/route");

describe("api/search (POST)", () => {
  beforeEach(() => {
    mockSearchGoogle.mockReset();
  });

  it("returns search results for a valid query", async () => {
    const results = [
      { title: "Result 1", link: "https://example.com", snippet: "Snippet 1", position: 1 },
    ];
    mockSearchGoogle.mockResolvedValue(results);

    const req = new Request("http://localhost/api/search", {
      method: "POST",
      body: JSON.stringify({ query: "test query" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results).toEqual(results);
  });

  it("rejects empty query with 400", async () => {
    const req = new Request("http://localhost/api/search", {
      method: "POST",
      body: JSON.stringify({ query: "" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejects missing query with 400", async () => {
    const req = new Request("http://localhost/api/search", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 when SERPER_API_KEY is missing", async () => {
    mockSearchGoogle.mockRejectedValue(new Error("SERPER_API_KEY no configurada"));

    const req = new Request("http://localhost/api/search", {
      method: "POST",
      body: JSON.stringify({ query: "test" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
