import { describe, it, expect, vi } from "vitest";
import { cn } from "@/utils/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("handles undefined", () => {
    expect(cn("a", undefined, "b")).toBe("a b");
  });
});
