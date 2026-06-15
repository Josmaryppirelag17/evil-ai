import { NextResponse } from "next/server";
import { Logger } from "@/infrastructure/logger/Logger";

const logger = new Logger("API");

const API_KEY_ERRORS = ["API_KEY", "GROQ_API_KEY", "SERPER_API_KEY"] as const;

function getErrorStatus(message: string): number {
  if (API_KEY_ERRORS.some(k => message.includes(k))) return 401;
  return 500;
}

function getErrorHint(message: string): string | undefined {
  if (message.includes("GROQ_API_KEY")) {
    return "La GROQ_API_KEY en .env no es válida. Obtené una en https://console.groq.com/keys";
  }
  if (message.includes("SERPER_API_KEY")) {
    return "La SERPER_API_KEY en .env no es válida. Obtené una en https://serper.dev";
  }
  return undefined;
}

export function handleApiError(error: unknown, context: string): NextResponse {
  const message = error instanceof Error ? error.message : "Error desconocido";
  logger.error(`[${context}]: ${message}`);
  const status = getErrorStatus(message);
  return NextResponse.json({ error: message, hint: getErrorHint(message) }, { status });
}

export function handleRateLimitError(): NextResponse {
  return NextResponse.json(
    { error: "Demasiadas solicitudes. Por favor, intenta de nuevo más tarde." },
    { status: 429 }
  );
}

export class ApiError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(message: string, statusCode: number, code = "API_ERROR") {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
  }
}
