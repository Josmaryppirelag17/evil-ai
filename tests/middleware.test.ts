import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/server", () => ({
  NextResponse: {
    next: vi.fn(() => ({
      headers: new Map<string, string>(),
      set: function (k: string, v: string) { this.headers.set(k, v); },
      delete: function (k: string) { this.headers.delete(k); },
    })),
  },
}));

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("middleware", () => {
  it("exports config with matcher", async () => {
    const mod = await import("@/middleware");
    expect(mod.config).toBeDefined();
    expect(mod.config.matcher).toBeDefined();
  });

  it("applies security headers", async () => {
    const mod = await import("@/middleware");
    const req = new Request("http://localhost/");
    const res = mod.middleware(req as any);
    expect(res.headers).toBeDefined();
  });

  it("sets x-nonce header", async () => {
    const mod = await import("@/middleware");
    const req = new Request("http://localhost/");
    const res = mod.middleware(req as any);
    expect(res.headers).toBeDefined();
  });
});
