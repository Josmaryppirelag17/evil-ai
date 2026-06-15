import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Scanlines } from "@/components/atoms/Scanlines";

describe("Scanlines", () => {
  it("renders without crashing", () => {
    const { container } = render(<Scanlines />);
    expect(container.firstChild).toBeDefined();
  });

  it("has pointer-events-none class", () => {
    const { container } = render(<Scanlines />);
    expect(container.firstChild).toHaveClass("pointer-events-none");
  });

  it("contains scanline overlay div", () => {
    const { container } = render(<Scanlines />);
    const overlay = container.querySelector(".scanline-overlay");
    expect(overlay).toBeDefined();
  });
});
