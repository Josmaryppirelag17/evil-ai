import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { registerUser } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rateLimit";
import { checkHoneypot } from "@/lib/api-error";

const registerSchema = z.object({
  email: z.string().email("Invalid email").max(255),
  username: z.string().min(3, "Username must be at least 3 characters").max(50).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
  name: z.string().min(1, "Name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  _honey: z.string().optional(),
});

const rateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  limit: 5,
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

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues.map(i => i.message) },
        { status: 400 },
      );
    }

    const { email, username, name, lastName, password } = parsed.data;
    const result = await registerUser(email, username, name, lastName, password);

    if (!result.success) {
      const status = result.error === "Email already registered" || result.error === "Username already taken" ? 409 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ success: true, userId: result.userId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
