import { describe, it, expect, beforeEach } from "vitest";
import { RateLimiter, createRateLimiter, resetRateLimitStore } from "@/lib/rateLimit";

describe("RateLimiter", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    resetRateLimitStore();
    limiter = createRateLimiter({ windowMs: 60_000, limit: 5 });
  });

  function makeReq(ip = "10.0.0.1"): Request {
    return new Request("http://localhost/api/test", {
      headers: { "x-forwarded-for": ip },
    });
  }

  it("allows requests within limit", async () => {
    for (let i = 0; i < 5; i++) {
      const r = await limiter.limit(makeReq());
      expect(r.success).toBe(true);
      expect(r.remaining).toBe(4 - i);
    }
  });

  it("blocks when limit exceeded", async () => {
    for (let i = 0; i < 5; i++) await limiter.limit(makeReq());
    const r = await limiter.limit(makeReq());
    expect(r.success).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it("tracks different IPs separately", async () => {
    const r1 = await limiter.limit(makeReq("1.1.1.1"));
    const r2 = await limiter.limit(makeReq("2.2.2.2"));
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
    expect(r1.remaining).toBe(4);
    expect(r2.remaining).toBe(4);
  });

  it("uses x-real-ip as fallback", () => {
    const limiter2 = createRateLimiter({ windowMs: 60_000, limit: 10 });
    const req = new Request("http://localhost", {
      headers: { "x-real-ip": "5.6.7.8" },
    });
    // Should not throw - works with fallback
    expect(() => limiter2.limit(req)).not.toThrow();
  });

  it("uses global key when no IP headers", () => {
    const req = new Request("http://localhost");
    expect(() => limiter.limit(req)).not.toThrow();
  });

  it("resets counter after window expires", async () => {
    const shortLimiter = createRateLimiter({ windowMs: 50, limit: 1 });
    const req = makeReq();
    await shortLimiter.limit(req);
    const r1 = await shortLimiter.limit(req);
    expect(r1.success).toBe(false);

    await new Promise((r) => setTimeout(r, 60));
    const r2 = await shortLimiter.limit(req);
    expect(r2.success).toBe(true);
  }, 10_000);
});
