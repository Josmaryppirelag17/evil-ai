import { describe, it, expect, vi, beforeEach } from "vitest";
import { getChatCompletion, getChatCompletionStream } from "@/lib/groq";

describe("groq", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv("GROQ_API_KEY", "gsk_test_key");
  });

  describe("getChatCompletion", () => {
    it("returns content on successful response", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: "Hello from Groq" } }],
          }),
          { status: 200 },
        ),
      );

      const result = await getChatCompletion([
        { role: "user", content: "Hi" },
      ]);
      expect(result).toBe("Hello from Groq");
    });

    it("throws on non-ok response", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Unauthorized", { status: 401 }),
      );

      await expect(
        getChatCompletion([{ role: "user", content: "Hi" }]),
      ).rejects.toThrow("Groq API error");
    });

    it("returns empty string when no choices", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ choices: [] }), { status: 200 }),
      );

      const result = await getChatCompletion([
        { role: "user", content: "Hi" },
      ]);
      expect(result).toBe("");
    });

    it("throws when API key is missing", async () => {
      vi.stubEnv("GROQ_API_KEY", "");

      await expect(
        getChatCompletion([{ role: "user", content: "Hi" }]),
      ).rejects.toThrow("GROQ_API_KEY");
    });
  });

  describe("getChatCompletion — retry y timeout", () => {
    it("reintenta en 502 y luego tiene éxito", async () => {
      vi.useFakeTimers();
      const fetchMock = vi.spyOn(globalThis, "fetch");
      fetchMock
        .mockResolvedValueOnce(new Response("Server Error", { status: 502 }))
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              choices: [{ message: { content: "éxito" } }],
            }),
            { status: 200 },
          ),
        );

      const promise = getChatCompletion([
        { role: "user", content: "Hi" },
      ]);
      await vi.advanceTimersByTimeAsync(2_000);
      const result = await promise;
      expect(result).toBe("éxito");
      expect(fetchMock).toHaveBeenCalledTimes(2);
      vi.useRealTimers();
    });

    it("reintenta hasta agotar reintentos en 503", async () => {
      vi.useFakeTimers();
      const fetchMock = vi.spyOn(globalThis, "fetch");
      fetchMock.mockResolvedValue(
        new Response("Service Unavailable", { status: 503 }),
      );

      const promise = getChatCompletion([
        { role: "user", content: "Hi" },
      ]);
      const onRejected = expect(promise).rejects.toThrow("Groq API error");
      await vi.advanceTimersByTimeAsync(10_000);
      await onRejected;
      expect(fetchMock).toHaveBeenCalledTimes(4);
      vi.useRealTimers();
    });

    it("NO reintenta en 401 (error de auth)", async () => {
      const fetchMock = vi.spyOn(globalThis, "fetch");
      fetchMock.mockResolvedValue(
        new Response("Unauthorized", { status: 401 }),
      );

      await expect(
        getChatCompletion([{ role: "user", content: "Hi" }]),
      ).rejects.toThrow("Groq API error");
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("lanza error de timeout tras 30s", async () => {
      vi.useFakeTimers();

      vi.spyOn(globalThis, "fetch").mockImplementation(
        (_url, options) =>
          new Promise<Response>((_resolve, reject) => {
            const signal = (
              options as RequestInit & { signal?: AbortSignal }
            )?.signal;
            if (signal) {
              signal.addEventListener("abort", () => {
                reject(
                  new DOMException("The operation was aborted", "AbortError"),
                );
              });
            }
          }),
      );

      const promise = getChatCompletion([{ role: "user", content: "Hi" }]);
      const onRejected = expect(promise).rejects.toThrow("timeout");

      await vi.advanceTimersByTimeAsync(200_000);

      await onRejected;

      vi.useRealTimers();
    });

    it("reintenta en network error y luego tiene éxito", async () => {
      vi.useFakeTimers();
      const fetchMock = vi.spyOn(globalThis, "fetch");
      fetchMock
        .mockRejectedValueOnce(new TypeError("fetch failed"))
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              choices: [{ message: { content: "recuperado" } }],
            }),
            { status: 200 },
          ),
        );

      const promise = getChatCompletion([
        { role: "user", content: "Hi" },
      ]);
      await vi.advanceTimersByTimeAsync(2_000);
      const result = await promise;
      expect(result).toBe("recuperado");
      expect(fetchMock).toHaveBeenCalledTimes(2);
      vi.useRealTimers();
    });

    it("reintenta en 429 (rate limit) y luego tiene éxito", async () => {
      vi.useFakeTimers();
      const fetchMock = vi.spyOn(globalThis, "fetch");
      fetchMock
        .mockResolvedValueOnce(
          new Response("Too Many Requests", { status: 429 }),
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              choices: [{ message: { content: "ok" } }],
            }),
            { status: 200 },
          ),
        );

      const promise = getChatCompletion([
        { role: "user", content: "Hi" },
      ]);
      await vi.advanceTimersByTimeAsync(2_000);
      const result = await promise;
      expect(result).toBe("ok");
      expect(fetchMock).toHaveBeenCalledTimes(2);
      vi.useRealTimers();
    });
  });

  describe("getChatCompletionStream", () => {
    it("yields chunks from SSE stream", async () => {
      const encoder = new TextEncoder();
      const chunks = [
        "data: " + JSON.stringify({ choices: [{ delta: { content: "Hello" } }] }) + "\n",
        "data: " + JSON.stringify({ choices: [{ delta: { content: " World" } }] }) + "\n",
        "data: [DONE]\n",
      ];
      const stream = new ReadableStream({
        start(controller) {
          chunks.forEach((c) => controller.enqueue(encoder.encode(c)));
          controller.close();
        },
      });

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(stream, { status: 200 }),
      );

      const results: string[] = [];
      for await (const chunk of getChatCompletionStream([
        { role: "user", content: "Hi" },
      ])) {
        results.push(chunk);
      }
      expect(results).toEqual(["Hello", " World"]);
    });

    it("throws on non-ok response", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Error", { status: 401 }),
      );

      const gen = getChatCompletionStream([
        { role: "user", content: "Hi" },
      ]);
      await expect(gen.next()).rejects.toThrow("Groq API error");
    });

    it("throws when response body is null", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(null, { status: 200 }),
      );

      const gen = getChatCompletionStream([
        { role: "user", content: "Hi" },
      ]);
      await expect(gen.next()).rejects.toThrow("sin cuerpo");
    });

    it("reintenta en 502 en stream y luego tiene éxito", async () => {
      const encoder = new TextEncoder();
      const chunks = [
        "data: " +
          JSON.stringify({ choices: [{ delta: { content: "Stream" } }] }) +
          "\n",
        "data: [DONE]\n",
      ];
      const stream = new ReadableStream({
        start(controller) {
          chunks.forEach((c) => controller.enqueue(encoder.encode(c)));
          controller.close();
        },
      });

      const fetchMock = vi.spyOn(globalThis, "fetch");
      fetchMock
        .mockResolvedValueOnce(new Response("Server Error", { status: 502 }))
        .mockResolvedValueOnce(new Response(stream, { status: 200 }));

      const results: string[] = [];
      for await (const chunk of getChatCompletionStream([
        { role: "user", content: "Hi" },
      ])) {
        results.push(chunk);
      }
      expect(results).toEqual(["Stream"]);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    }, 15_000);
  });
});
