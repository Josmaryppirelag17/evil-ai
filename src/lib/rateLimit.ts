const store = new Map<string, { count: number; resetAt: number }>();

export function resetRateLimitStore() {
  store.clear();
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, limit: maxAttempts, remaining: maxAttempts - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, limit: maxAttempts, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, limit: maxAttempts, remaining: maxAttempts - entry.count, resetAt: entry.resetAt };
}

export class RateLimiter {
  private readonly windowMs: number;
  private readonly maxAttempts: number;
  private readonly keyGenerator: (req: Request) => string;
  constructor(options: { windowMs: number; limit: number; keyGenerator?: (req: Request) => string }) {
    this.windowMs = options.windowMs;
    this.maxAttempts = options.limit;
    this.keyGenerator = options.keyGenerator ?? ((req) => getClientIp(req));
  }

  check(req: Request): { success: boolean; limit: number; remaining: number; resetTime: number } {
    const key = this.keyGenerator(req);
    const result = checkRateLimit(key, this.maxAttempts, this.windowMs);
    return {
      success: result.allowed,
      limit: result.limit,
      remaining: result.remaining,
      resetTime: result.resetAt,
    };
  }

  limit(req: Request): ReturnType<typeof this.check> {
    return this.check(req);
  }
}

export function createRateLimiter(options: { windowMs: number; limit: number; keyGenerator?: (req: Request) => string }): RateLimiter {
  return new RateLimiter(options);
}

export function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
}
