import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

describe("useSpeechRecognition", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("isListening starts false", () => {
    const { result } = renderHook(() => useSpeechRecognition());
    expect(result.current.isListening).toBe(false);
  });

  it("callbacksRef has onResult and onUnsupported", () => {
    const { result } = renderHook(() => useSpeechRecognition());
    expect(typeof result.current.callbacksRef.current.onResult).toBe("function");
    expect(typeof result.current.callbacksRef.current.onUnsupported).toBe("function");
  });

  it("calls onUnsupported when SpeechRecognition is unavailable", () => {
    const onUnsupported = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition());
    result.current.callbacksRef.current = { onResult: vi.fn(), onUnsupported };

    act(() => result.current.handleMicClick());

    expect(onUnsupported).toHaveBeenCalledOnce();
  });

  it("calls onResult when SpeechRecognition is available", () => {
    const onResult = vi.fn();
    class MockSpeechRecognition {
      lang = "";
      interimResults = false;
      maxAlternatives = 1;
      onresult: any = null;
      onerror: any = null;
      onend: any = null;
      start = vi.fn();
    }
    (window as any).SpeechRecognition = MockSpeechRecognition;

    const { result } = renderHook(() => useSpeechRecognition());
    result.current.callbacksRef.current = { onResult, onUnsupported: vi.fn() };

    act(() => result.current.handleMicClick());

    expect(result.current.isListening).toBe(true);

    delete (window as any).SpeechRecognition;
  });

  it("sets isListening false on recognition error", () => {
    let onerrorCb: any;
    class MockSpeechRecognition {
      lang = "";
      interimResults = false;
      maxAlternatives = 1;
      onresult: any = null;
      get onerror() { return onerrorCb; }
      set onerror(fn: any) { onerrorCb = fn; }
      onend: any = null;
      start = vi.fn();
    }
    (window as any).SpeechRecognition = MockSpeechRecognition;

    const { result } = renderHook(() => useSpeechRecognition());
    result.current.callbacksRef.current = { onResult: vi.fn(), onUnsupported: vi.fn() };

    act(() => result.current.handleMicClick());

    act(() => {
      onerrorCb();
    });

    expect(result.current.isListening).toBe(false);

    delete (window as any).SpeechRecognition;
  });
});
