import { NextRequest } from "next/server";
import { getChatCompletionStream, type GroqMessage } from "@/lib/groq";
import { VIL_INSTRUCTION } from "@/lib/gemini";
import { getSession, pushMessage } from "@/lib/sessions";
import { getSessionUser } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rateLimit";
import { handleApiError, handleRateLimitError } from "@/lib/api-error";

export const runtime = "nodejs";

const streamRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  limit: 15,
});

export async function POST(req: NextRequest) {
  try {
    const rateLimitResult = await streamRateLimiter.check(req);
    if (!rateLimitResult.success) {
      return handleRateLimitError();
    }

    const body = await req.json();
    const { query, session_id, _honey } = body;

    if (_honey) {
      return new Response(JSON.stringify({ error: "Solicitud rechazada" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!query) {
      return new Response(JSON.stringify({ error: "Consulta vacía" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sid = session_id || "default";
    const user = await getSessionUser().catch(() => null);
    const session = await getSession(sid, user?.id);

    const messages: GroqMessage[] = [{ role: "system", content: VIL_INSTRUCTION }];
    for (const msg of session.messages) {
      messages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.text,
      });
    }
    messages.push({ role: "user", content: query });

    await pushMessage(sid, "user", query);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullText = "";

          for await (const chunk of getChatCompletionStream(messages)) {
            fullText += chunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`)
            );
          }

          await pushMessage(sid, "assistant", fullText);

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : "Error crítico";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: message })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return handleApiError(error, "VIL_STREAM_ERROR");
  }
}
