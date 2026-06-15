import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resetPasswordWithToken } from "@/lib/auth";
import { checkHoneypot } from "@/lib/api-error";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
  _honey: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const honeyResponse = checkHoneypot(body);
    if (honeyResponse) return honeyResponse;

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { token, password } = parsed.data;
    const result = await resetPasswordWithToken(token, password);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
