import { describe, it, expect } from "vitest";
import { VIL_INSTRUCTION, suggestions } from "@/lib/gemini";

describe("gemini", () => {
  it("exports VIL_INSTRUCTION", () => {
    expect(VIL_INSTRUCTION).toContain("E-VIL");
    expect(VIL_INSTRUCTION).toContain("HADES");
    expect(VIL_INSTRUCTION).toContain("IZMA");
    expect(VIL_INSTRUCTION).toContain("CRUELLA");
  });

  it("provides 5 suggestions", () => {
    expect(suggestions).toHaveLength(5);
    suggestions.forEach((s) => {
      expect(typeof s).toBe("string");
      expect(s.length).toBeGreaterThan(0);
    });
  });
});
