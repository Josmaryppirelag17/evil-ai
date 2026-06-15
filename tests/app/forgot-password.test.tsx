import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ForgotPasswordPage from "@/app/auth/forgot-password/page";

vi.mock("next/link", () => ({ default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a> }));

vi.mock("@/lib/i18n", () => ({
  useTranslation: () => ({
    t: { auth: { resetPasswordTitle: "RESTABLECER CONTRASEÑA", emailLabel: "Email", submit: "Enviar", backToSignIn: "Volver" } },
    locale: "es",
    setLocale: vi.fn(),
  }),
}));

vi.mock("next/headers", () => ({
  headers: () => new Map(),
}));

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form", () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText("RESTABLECER CONTRASEÑA")).toBeDefined();
  });
});
