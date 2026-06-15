import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorPage from "@/app/error";

describe("Error page", () => {
  it("renders critical system failure", () => {
    const reset = vi.fn();
    render(<ErrorPage error={new Error("test")} reset={reset} />);
    expect(screen.getByText("CRITICAL SYSTEM FAILURE")).toBeDefined();
    expect(screen.getByLabelText("Reiniciar sistema")).toBeDefined();
  });

  it("calls reset on reboot button click", () => {
    const reset = vi.fn();
    render(<ErrorPage error={new Error("test")} reset={reset} />);
    screen.getByLabelText("Reiniciar sistema").click();
    expect(reset).toHaveBeenCalledOnce();
  });
});
