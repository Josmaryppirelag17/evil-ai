import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useChat } from "@/hooks/useChat";

vi.mock("@/infrastructure/logger/Logger", () => ({
  Logger: class {
    error = vi.fn();
    warn = vi.fn();
    info = vi.fn();
    debug = vi.fn();
  },
}));

const mockVoices = [
  { name: "Google español", lang: "es-ES", default: false },
  { name: "Google US English", lang: "en-US", default: false },
];

beforeEach(() => {
  vi.restoreAllMocks();

  Object.defineProperty(window, "speechSynthesis", {
    value: {
      getVoices: vi.fn().mockReturnValue(mockVoices),
      cancel: vi.fn(),
      speak: vi.fn(),
      onvoiceschanged: null,
    },
    writable: true,
    configurable: true,
  });

  Object.defineProperty(globalThis, "crypto", {
    value: { randomUUID: () => "test-uuid-123" },
    writable: true,
    configurable: true,
  });

  globalThis.fetch = vi.fn().mockImplementation((url: string) => {
    if (url === "/api/suggestions") {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    }
    if (url === "/api/chat/stream") {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode("data: " + JSON.stringify({ done: true }) + "\n\n"));
          controller.close();
        },
      });
      return Promise.resolve({
        ok: true,
        body: stream,
        json: () => Promise.resolve({}),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ results: [] }), body: null });
  });
});

describe("useChat", () => {
  it("returns initial state", async () => {
    const { result } = renderHook(() => useChat());
    await waitFor(() => {
      expect(result.current.messages).toEqual([]);
      expect(result.current.inputQuery).toBe("");
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.isSpeaking).toBe(false);
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.lastResponse).toBe("");
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.voices).toEqual(mockVoices);
      expect(result.current.isBrowserLoading).toBe(false);
      expect(result.current.currentRecPage).toBe(0);
      expect(result.current.detailView).toBeNull();
    });
  });

  it("setInputQuery updates input", async () => {
    const { result } = renderHook(() => useChat());
    await act(async () => {});
    act(() => result.current.setInputQuery("hello"));
    expect(result.current.inputQuery).toBe("hello");
  });

  it("setSelectedVoice updates voice", async () => {
    const { result } = renderHook(() => useChat());
    await act(async () => {});
    act(() => result.current.setSelectedVoice("Google español"));
    expect(result.current.selectedVoice).toBe("Google español");
  });

  it("setSpeechRate updates rate", async () => {
    const { result } = renderHook(() => useChat());
    await act(async () => {});
    act(() => result.current.setSpeechRate(2.0));
    expect(result.current.speechRate).toBe(2.0);
  });

  it("handleSendPrompt does nothing with empty input", async () => {
    const { result } = renderHook(() => useChat());
    await act(async () => {});
    act(() => result.current.handleSendPrompt());
    expect(result.current.isGenerating).toBe(false);
  });

  it("speakLastResponse does nothing when no last response", async () => {
    const { result } = renderHook(() => useChat());
    await act(async () => {});
    act(() => result.current.speakLastResponse());
    expect(result.current.isSpeaking).toBe(false);
  });

  it("handleBrowserHome resets to default", async () => {
    const { result } = renderHook(() => useChat());
    await act(async () => {});
    act(() => result.current.handleBrowserHome());
    expect(result.current.browserState.currentUrl).toBe("https://cyberterminal-node.hub");
    expect(result.current.browserState.pageTitle).toBe("Home Hub");
    expect(result.current.browserState.isCustomPage).toBe(true);
    expect(result.current.browserState.historyIndex).toBe(0);
  });

  it("handleBrowserBack does nothing at index 0", async () => {
    const { result } = renderHook(() => useChat());
    await act(async () => {});
    const before = result.current.browserState.historyIndex;
    act(() => result.current.handleBrowserBack());
    expect(result.current.browserState.historyIndex).toBe(before);
  });

  it("setCurrentRecPage updates page", async () => {
    const { result } = renderHook(() => useChat());
    await act(async () => {});
    act(() => result.current.setCurrentRecPage(2));
    expect(result.current.currentRecPage).toBe(2);
  });

  it("setDetailView updates view", async () => {
    const { result } = renderHook(() => useChat());
    await act(async () => {});
    const view = { url: "https://example.com", title: "Example" };
    act(() => result.current.setDetailView(view));
    expect(result.current.detailView).toEqual(view);
    act(() => result.current.setDetailView(null));
    expect(result.current.detailView).toBeNull();
  });
});
