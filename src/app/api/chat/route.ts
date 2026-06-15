import { NextRequest, NextResponse } from "next/server";
import { getChatCompletion, type GroqMessage } from "@/lib/groq";
import { VIL_INSTRUCTION } from "@/lib/gemini";
import { getSession, pushMessage } from "@/lib/sessions";
import { getSessionUser } from "@/lib/auth";
import { ChatRequestSchema } from "@/types";
import { createRateLimiter } from "@/lib/rateLimit";
import { handleApiError, handleRateLimitError } from "@/lib/api-error";

const chatRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  limit: 10
});

export async function POST(req: NextRequest) {
  try {
    const rateLimitResult = await chatRateLimiter.check(req);
    if (!rateLimitResult.success) {
      return handleRateLimitError();
    }

    const body = await req.json();

    if (body._honey) {
      return NextResponse.json(
        { error: "Solicitud rechazada" },
        { status: 400 }
      );
    }

    const result = ChatRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.format() },
        { status: 400 }
      );
    }

    const { query, session_id, messages: history } = result.data;
    const sid = session_id || "default";
    const user = await getSessionUser().catch(() => null);
    await getSession(sid, user?.id);

    const messages: GroqMessage[] = [{ role: "system", content: VIL_INSTRUCTION }];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        messages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.text,
        });
      }
    }
    messages.push({ role: "user", content: query });

    const text = await getChatCompletion(messages);

    await pushMessage(sid, "user", query);
    await pushMessage(sid, "assistant", text);

    return NextResponse.json({ text, groundingSources: [], searchQueries: [] });
  } catch (error) {
    return handleApiError(error, "VIL_ERROR");
  }
}
