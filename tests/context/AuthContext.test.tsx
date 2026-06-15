import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, render } from "@testing-library/react";
import { AuthProvider, useAuth, setPendingSessionId, syncCurrentSession } from "@/context/AuthContext";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("AuthContext", () => {
  it("starts loading by default", () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it("setPendingSessionId stores in localStorage", () => {
    setPendingSessionId("session-123");
    expect(localStorage.getItem("vil_chat_session")).toBe("session-123");
  });

  it("setPendingSessionId ignores null", () => {
    setPendingSessionId(null);
    expect(localStorage.getItem("vil_chat_session")).toBeNull();
  });

  it("syncCurrentSession does nothing in server-side", async () => {
    // Simulate SSR (no window)
    const windowSpy = vi.spyOn(globalThis, "window", "get").mockImplementation(() => undefined as any);
    await syncCurrentSession();
    expect(mockFetch).not.toHaveBeenCalled();
    windowSpy.mockRestore();
  });
});
