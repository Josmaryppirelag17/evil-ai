import { NextRequest, NextResponse } from "next/server";
import { getChatCompletion, type GroqMessage } from "@/lib/groq";
import { BrowserSimulateRequestSchema } from "@/types";
import { createRateLimiter } from "@/lib/rateLimit";
import { handleApiError, handleRateLimitError } from "@/lib/api-error";

const browserSimulateRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  limit: 5,
});

export async function POST(req: NextRequest) {
  try {
    const rateLimitResult = await browserSimulateRateLimiter.check(req);
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

    const result = BrowserSimulateRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.format() },
        { status: 400 }
      );
    }

    const { url, title, query } = result.data;

    const systemPrompt = `Eres un generador de contenido de terminal retro. Generás representaciones ASCII de sitios web.`;
    const userPrompt = `Perform simulated retro terminal data recovery for the following website:
URL: ${url}
Title Context: ${title || "Unknown Net Node"}
Topic Reference: ${query || "Web Index Search Item"}

Produce a beautifully formatted, immersive techno-ASCII plain text representation of this website.
Include:
1. A small creative ASCII artwork header related to the title/subject of the site.
2. An 'INDEX / STRUCTURE' layout summarizing the page map.
3. 2-3 detailed paragraphs written in reader-mode style summarizing authentic information we'd find on this page, framed with high-tech terminal tags (e.g., [DATA_SECTOR], <CONTENT_FLOW>, etc.).
4. A mock raw hexadecimal or matrix grid visualization of the metadata at the bottom.

Write only the plain terminal content with decorative ASCII characters (e.g. +, -, |, =, #, ., *, /, <, >). Do NOT output any HTML or markdown syntax block tags. Keep it between 250 and 420 words.`;

    const messages: GroqMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const content = await getChatCompletion(messages);

    return NextResponse.json({
      content: content || "Connection dropped.",
    });
  } catch (error) {
    return handleApiError(error, "BROWSER_SIMULATOR_ERROR");
  }
}
