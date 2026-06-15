import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loginUser, getSessionCookieConfig } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rateLimit";
import { checkHoneypot } from "@/lib/api-error";

const loginSchema = z.object({
  email: z.string().min(1).max(255),
  password: z.string().min(1).max(128),
  _honey: z.string().optional(),
});

const rateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  limit: 10,
});

export async function POST(req: NextRequest) {
  const rateLimitResult = await rateLimiter.check(req);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo más tarde." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();

    const honeyResponse = checkHoneypot(body);
    if (honeyResponse) return honeyResponse;

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues.map(i => i.message) },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;
    const result = await loginUser(email, password);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, userId: result.userId });
    response.cookies.set(getSessionCookieConfig(result.token));
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
