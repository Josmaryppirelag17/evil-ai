import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPasswordResetToken } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rateLimit";

const schema = z.object({
  email: z.string().email().max(255),
});

const rateLimiter = createRateLimiter({ windowMs: 60 * 1000, limit: 3 });

export async function POST(req: NextRequest) {
  const rateLimitResult = await rateLimiter.check(req);
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const result = await createPasswordResetToken(parsed.data.email);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      resetUrl: result.resetUrl,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
