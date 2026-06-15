import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthButton } from "@/components/atoms/AuthButton";

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isLoading: false,
    logout: vi.fn(),
  })),
}));

vi.mock("@/lib/i18n", () => ({
  useTranslation: () => ({
    t: { auth: { signIn: "SIGN IN", signUp: "SIGN UP", signOut: "SIGN OUT", loadingLabel: "..." } },
    locale: "es",
    setLocale: vi.fn(),
  }),
}));

vi.mock("@/components/molecules/AuthModal", () => ({
  AuthModal: () => <div data-testid="auth-modal" />,
}));

describe("AuthButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders sign in button when not authenticated", () => {
    render(<AuthButton />);
    expect(screen.getByText("SIGN IN")).toBeDefined();
  });

  it("renders loading state", async () => {
    const { useAuth } = await import("@/context/AuthContext");
    vi.mocked(useAuth).mockReturnValue({ user: null, isLoading: true, login: vi.fn(), register: vi.fn(), logout: vi.fn(), syncSession: vi.fn() });
    render(<AuthButton />);
    expect(screen.getByText("...")).toBeDefined();
  });

  it("renders user name when authenticated", async () => {
    const { useAuth } = await import("@/context/AuthContext");
    vi.mocked(useAuth).mockReturnValue({ user: { id: 1, email: "u@u.com", username: "u", name: "User", lastName: "T" }, isLoading: false, login: vi.fn(), register: vi.fn(), logout: vi.fn(), syncSession: vi.fn() });
    render(<AuthButton />);
    expect(screen.getByText("User")).toBeDefined();
  });
});
