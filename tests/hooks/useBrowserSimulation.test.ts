import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBrowserSimulation } from "@/hooks/useBrowserSimulation";
import type { BrowserTabState } from "@/types";

const mockState: BrowserTabState = {
  currentUrl: "https://example.com/page",
  pageTitle: "Test Page",
  pageContent: "Hello world content here",
  isCustomPage: false,
  history: ["https://example.com/page"],
  historyIndex: 0,
  viewMode: "rendered",
};

describe("useBrowserSimulation", () => {
  it("defaults viewMode to rendered", () => {
    const { result } = renderHook(() => useBrowserSimulation(mockState));
    expect(result.current.viewMode).toBe("rendered");
  });

  it("setViewMode changes the mode", () => {
    const { result } = renderHook(() => useBrowserSimulation(mockState));
    act(() => result.current.setViewMode("matrix"));
    expect(result.current.viewMode).toBe("matrix");

    act(() => result.current.setViewMode("hex"));
    expect(result.current.viewMode).toBe("hex");

    act(() => result.current.setViewMode("ascii"));
    expect(result.current.viewMode).toBe("ascii");
  });

  it("generatedData contains matrixLines and hexRecords", () => {
    const { result } = renderHook(() => useBrowserSimulation(mockState));
    expect(Array.isArray(result.current.generatedData.matrixLines)).toBe(true);
    expect(result.current.generatedData.matrixLines.length).toBeGreaterThan(0);
    expect(Array.isArray(result.current.generatedData.hexRecords)).toBe(true);
    expect(result.current.generatedData.hexRecords.length).toBeGreaterThan(0);
  });

  it("generatedData changes when state changes", () => {
    const { result, rerender } = renderHook(
      (s: BrowserTabState) => useBrowserSimulation(s),
      { initialProps: mockState }
    );
    const first = result.current.generatedData.matrixLines[0];

    const differentState: BrowserTabState = {
      ...mockState,
      pageContent: "Different content here for testing",
    };
    rerender(differentState);

    expect(result.current.generatedData.matrixLines[0]).not.toBe(first);
  });

  it("hexRecords have correct structure", () => {
    const { result } = renderHook(() => useBrowserSimulation(mockState));
    const record = result.current.generatedData.hexRecords[0];
    expect(record).toHaveProperty("addr");
    expect(record).toHaveProperty("hex");
    expect(record).toHaveProperty("chars");
    expect(typeof record.addr).toBe("string");
    expect(typeof record.hex).toBe("string");
    expect(typeof record.chars).toBe("string");
  });
});
