import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

vi.mock("@/components/organisms/TerminalConsolePage", () => ({
  TerminalConsolePage: () => <div data-testid="terminal-console" />,
}));

describe("Home page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders terminal console", () => {
    render(<Home />);
    expect(screen.getByTestId("terminal-console")).toBeDefined();
  });
});
