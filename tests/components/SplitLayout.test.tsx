import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SplitLayout } from "@/components/templates/SplitLayout";

vi.mock("@/components/atoms/Scanlines", () => ({
  Scanlines: () => <div data-testid="scanlines" />,
}));

describe("SplitLayout", () => {
  it("renders left and right sections", () => {
    render(
      <SplitLayout
        leftSidebar={<div>chat panel</div>}
        rightBrowser={<div>browser panel</div>}
      />,
    );
    expect(screen.getByText("chat panel")).toBeDefined();
    expect(screen.getByText("browser panel")).toBeDefined();
  });
});
