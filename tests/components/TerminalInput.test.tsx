import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TerminalInput } from "@/components/atoms/TerminalInput";

describe("TerminalInput", () => {
  it("renders an input element", () => {
    render(<TerminalInput />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDefined();
  });

  it("displays the provided value", () => {
    render(<TerminalInput value="hello" onChange={() => {}} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("hello");
  });

  it("calls onChange when typing", () => {
    const onChange = vi.fn();
    render(<TerminalInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "x" } });
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("shows prefix text when provided", () => {
    render(<TerminalInput prefixText="$" value="" onChange={() => {}} />);
    expect(screen.getByText("$")).toBeDefined();
  });

  it("shows placeholder when provided", () => {
    render(<TerminalInput placeholder="Type here..." />);
    expect(screen.getByPlaceholderText("Type here...")).toBeDefined();
  });

  it("applies cyan variant by default", () => {
    const { container } = render(<TerminalInput />);
    expect(container.firstChild).toHaveClass("border-cyber-cyan/30");
  });

  it("applies green variant", () => {
    const { container } = render(<TerminalInput variant="green" />);
    expect(container.firstChild).toHaveClass("border-cyber-green/30");
  });

  it("can be disabled", () => {
    render(<TerminalInput disabled />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
