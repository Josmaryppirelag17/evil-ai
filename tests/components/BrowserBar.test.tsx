import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserBar } from "@/components/molecules/BrowserBar";
import { I18nProvider } from "@/lib/i18n";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}

describe("BrowserBar", () => {
  const defaultProps = {
    url: "https://example.com",
    onNavigate: vi.fn(),
    onBack: vi.fn(),
    onForward: vi.fn(),
    onHome: vi.fn(),
    onRefresh: vi.fn(),
    canBack: false,
    canForward: false,
    isLoading: false,
  };

  it("renders the url in the input", () => {
    render(<BrowserBar {...defaultProps} />, { wrapper: Wrapper });
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("https://example.com");
  });

  it("submits the URL on enter", () => {
    const onNavigate = vi.fn();
    render(<BrowserBar {...defaultProps} onNavigate={onNavigate} />, { wrapper: Wrapper });
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "https://test.com" } });
    fireEvent.submit(input.closest("form")!);
    expect(onNavigate).toHaveBeenCalledWith("https://test.com");
  });

  it("prepends https:// if missing", () => {
    const onNavigate = vi.fn();
    render(<BrowserBar {...defaultProps} onNavigate={onNavigate} />, { wrapper: Wrapper });
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "test.com" } });
    fireEvent.submit(input.closest("form")!);
    expect(onNavigate).toHaveBeenCalledWith("https://test.com");
  });

  it("calls onBack when back button clicked", () => {
    render(<BrowserBar {...defaultProps} canBack={true} />, { wrapper: Wrapper });
    const backBtn = screen.getByRole("button", { name: "Nodo Anterior" });
    fireEvent.click(backBtn);
    expect(defaultProps.onBack).toHaveBeenCalledOnce();
  });

  it("calls onForward when forward button clicked", () => {
    render(<BrowserBar {...defaultProps} canForward={true} />, { wrapper: Wrapper });
    const fwdBtn = screen.getByRole("button", { name: "Nodo Siguiente" });
    fireEvent.click(fwdBtn);
    expect(defaultProps.onForward).toHaveBeenCalledOnce();
  });

  it("calls onHome when home button clicked", () => {
    render(<BrowserBar {...defaultProps} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole("button", { name: "Inicio" }));
    expect(defaultProps.onHome).toHaveBeenCalledOnce();
  });

  it("calls onRefresh when refresh button clicked", () => {
    render(<BrowserBar {...defaultProps} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole("button", { name: "Recargar" }));
    expect(defaultProps.onRefresh).toHaveBeenCalledOnce();
  });

  it("shows SYNCING label when loading", () => {
    render(<BrowserBar {...defaultProps} isLoading={true} />, { wrapper: Wrapper });
    expect(screen.getByText("SINCRONIZANDO")).toBeDefined();
  });
});
