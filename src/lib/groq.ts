const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const FETCH_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1_000;

function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status < 600);
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  options: RequestInit & { retries?: number },
): Promise<Response> {
  const maxRetries = options.retries ?? MAX_RETRIES;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const signal = options.signal
      ? combineSignals(options.signal as AbortSignal, controller.signal)
      : controller.signal;

    try {
      const response = await fetch(url, { ...options, signal });

      if (response.ok || !isRetryableStatus(response.status)) {
        clearTimeout(timeoutId);
        return response;
      }

      clearTimeout(timeoutId);
      lastError = new Error(`Groq API error (${response.status})`);

      if (attempt < maxRetries) {
        const backoff = RETRY_DELAY_MS * Math.pow(2, attempt);
        await delay(backoff);
      }
    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof DOMException && err.name === "AbortError") {
        lastError = new Error("Groq timeout tras 30s");
      } else if (err instanceof TypeError) {
        lastError = new Error(`Groq network error: ${err.message}`);
      } else {
        lastError = err instanceof Error ? err : new Error("Groq error desconocido");
      }

      if (attempt >= maxRetries) break;
      const backoff = RETRY_DELAY_MS * Math.pow(2, attempt);
      await delay(backoff);
    }
  }

  throw lastError ?? new Error("Groq error desconocido");
}

function combineSignals(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener("abort", () => controller.abort(signal.reason), { once: true });
  }
  return controller.signal;
}

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqChoice {
  index: number;
  message: { role: string; content: string };
  finish_reason: string;
}

interface GroqStreamDelta {
  content?: string;
}

interface GroqStreamChoice {
  index: number;
  delta: GroqStreamDelta;
  finish_reason: string | null;
}

interface GroqResponse {
  id: string;
  choices: GroqChoice[];
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

interface GroqStreamChunk {
  id: string;
  choices: GroqStreamChoice[];
  x_groq?: { usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number } };
}

const MODEL = "llama-3.3-70b-versatile";

function getApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY no configurada");
  return key;
}

function buildBody(messages: GroqMessage[], stream: boolean) {
  return {
    model: MODEL,
    messages,
    stream,
    temperature: 0.85,
    max_tokens: 4096,
  };
}

export async function getChatCompletion(messages: GroqMessage[]): Promise<string> {
  const apiKey = getApiKey();

  const response = await fetchWithRetry(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(buildBody(messages, false)),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq API error (${response.status}): ${text}`);
  }

  const data: GroqResponse = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function* getChatCompletionStream(messages: GroqMessage[]): AsyncGenerator<string> {
  const apiKey = getApiKey();

  const response = await fetchWithRetry(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(buildBody(messages, true)),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq API error (${response.status}): ${text}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Groq: sin cuerpo en la respuesta");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const payload = trimmed.slice(6);
      if (payload === "[DONE]") return;

      try {
        const chunk: GroqStreamChunk = JSON.parse(payload);
        const delta = chunk.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        // skip malformed chunk
      }
    }
  }
}
