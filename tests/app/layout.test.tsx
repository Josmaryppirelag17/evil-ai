import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RootLayout from "@/app/layout";

vi.mock("next/font/google", () => ({
  Geist: () => ({ className: "geist", variable: "--font-sans" }),
  JetBrains_Mono: () => ({ className: "jetbrains", variable: "--font-mono" }),
}));

vi.mock("next/headers", () => ({
  headers: () => new Map([["x-nonce", "test-nonce"]]),
}));

vi.mock("@/utils/utils", () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(" "),
}));

vi.mock("@/context/I18nProvider", () => ({
  I18nProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/context/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/atoms/AuthButton", () => ({
  AuthButton: () => <div data-testid="auth-button" />,
}));

vi.mock("@/components/atoms/StructuredData", () => ({
  StructuredData: ({ nonce }: { nonce?: string }) => <script data-testid="structured-data" nonce={nonce} />,
}));

vi.mock("@/components/atoms/GAScript", () => ({
  GAScript: () => null,
}));

describe("RootLayout", () => {
  it("renders without error", async () => {
    const { container } = render(await RootLayout({ children: <div>test</div> }));
    expect(container.querySelector("html")).toBeDefined();
    expect(screen.getByText("test")).toBeDefined();
  });

  it("renders skip link", async () => {
    render(await RootLayout({ children: <div /> }));
    expect(screen.getByText("Saltar al contenido principal")).toBeDefined();
  });

  it("renders CC attribution in footer", async () => {
    render(await RootLayout({ children: <div /> }));
    expect(screen.getByText("CC BY-NC-SA 4.0")).toBeDefined();
  });
});
