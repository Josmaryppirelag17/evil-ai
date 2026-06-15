import { NextResponse } from "next/server";
import { suggestions } from "@/lib/gemini";
import { SuggestionsRequestSchema } from "@/types";
import { createRateLimiter } from "@/lib/rateLimit";
import { handleApiError, handleRateLimitError } from "@/lib/api-error";

const suggestionsRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  limit: 30
});

export async function GET(req: Request) {
  try {
    const rateLimitResult = await suggestionsRateLimiter.check(req);
    if (!rateLimitResult.success) {
      return handleRateLimitError();
    }

    const { searchParams } = new URL(req.url);
    const context = searchParams.get("context") || undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;

    const result = SuggestionsRequestSchema.safeParse({ context, limit });

    if (!result.success) {
      return NextResponse.json(
        { error: "Parámetros inválidos", details: result.error.format() },
        { status: 400 }
      );
    }

    return NextResponse.json(suggestions);
  } catch (error) {
    return handleApiError(error, "SUGGESTIONS_ERROR");
  }
}
