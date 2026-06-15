import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({ default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a> }));

vi.mock("@/lib/i18n", () => ({
  useTranslation: () => ({
    t: { auth: { newPassword: "Nueva contraseña", confirmPassword: "Confirmar", submit: "Enviar", resetSuccess: "Contraseña actualizada" } },
    locale: "es",
    setLocale: vi.fn(),
  }),
}));

vi.mock("next/headers", () => ({
  headers: () => new Map(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ token: "test-token" }),
}));

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form", async () => {
    const { default: ResetPasswordPage } = await import("@/app/auth/reset-password/[token]/page");
    const params = Promise.resolve({ token: "test-token" });
    render(<ResetPasswordPage params={params} />);
    expect(screen.getByText("Nueva contraseña")).toBeDefined();
  });
});
