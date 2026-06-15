import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RetroButton } from "@/components/atoms/RetroButton";

describe("RetroButton", () => {
  it("renders children", () => {
    render(<RetroButton>CLICK</RetroButton>);
    expect(screen.getByText("CLICK")).toBeDefined();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<RetroButton onClick={onClick}>CLICK</RetroButton>);
    fireEvent.click(screen.getByText("CLICK"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(<RetroButton onClick={onClick} disabled>CLICK</RetroButton>);
    fireEvent.click(screen.getByText("CLICK"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies cyan variant styles by default", () => {
    const { container } = render(<RetroButton>CYAN</RetroButton>);
    expect(container.firstChild).toHaveClass("border-cyber-cyan");
  });

  it("applies green variant styles", () => {
    const { container } = render(<RetroButton variant="green">GREEN</RetroButton>);
    expect(container.firstChild).toHaveClass("border-cyber-green");
  });

  it("applies title attribute", () => {
    render(<RetroButton title="my title">BTN</RetroButton>);
    expect(screen.getByTitle("my title")).toBeDefined();
  });
});
