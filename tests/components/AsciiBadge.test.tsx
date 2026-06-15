import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AsciiBadge } from "@/components/atoms/AsciiBadge";

describe("AsciiBadge", () => {
  it("renders label inside brackets", () => {
    render(<AsciiBadge label="TEST" />);
    expect(screen.getByText("TEST")).toBeDefined();
    expect(screen.getByText("[")).toBeDefined();
    expect(screen.getByText("]")).toBeDefined();
  });

  it("applies cyan variant by default", () => {
    const { container } = render(<AsciiBadge label="CYAN" />);
    expect(container.firstChild).toHaveClass("text-cyber-cyan");
  });

  it("applies green variant", () => {
    const { container } = render(<AsciiBadge label="GREEN" variant="green" />);
    expect(container.firstChild).toHaveClass("text-cyber-green");
  });

  it("applies magenta variant", () => {
    const { container } = render(<AsciiBadge label="MAG" variant="magenta" />);
    expect(container.firstChild).toHaveClass("text-cyber-magenta");
  });

  it("applies pulse class when pulse is true", () => {
    const { container } = render(<AsciiBadge label="PULSE" pulse />);
    expect(container.firstChild).toHaveClass("animate-pulse");
  });
});
