import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TutorialCards } from "@/components/molecules/TutorialCards";

vi.mock("@/lib/i18n", () => ({
  useTranslation: () => ({
    t: {
      tutorial: {
        title: "WELCOME TO E-VIL",
        card1Title: "AI CHAT",
        card1Desc: "Type your message",
        card2Title: "WEB SEARCH",
        card2Desc: "Every query triggers a search",
        card3Title: "VOICE",
        card3Desc: "Use the microphone",
        card4Title: "ACCESSIBILITY",
        card4Desc: "Adapts to preferences",
        dismiss: "GOT IT",
      },
    },
  }),
}));

describe("TutorialCards", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders when no localStorage flag", () => {
    render(<TutorialCards />);
    expect(screen.getByText("WELCOME TO E-VIL")).toBeDefined();
    expect(screen.getByText("01. AI CHAT")).toBeDefined();
    expect(screen.getByText("02. WEB SEARCH")).toBeDefined();
    expect(screen.getByText("03. VOICE")).toBeDefined();
    expect(screen.getByText("04. ACCESSIBILITY")).toBeDefined();
  });

  it("renders nothing when localStorage flag is set", () => {
    localStorage.setItem("vil-tutorial-done", "true");
    const { container } = render(<TutorialCards />);
    expect(container.innerHTML).toBe("");
  });

  it("sets localStorage and dismisses on button click", () => {
    render(<TutorialCards />);
    fireEvent.click(screen.getByText("GOT IT"));
    expect(localStorage.getItem("vil-tutorial-done")).toBe("true");
  });

  it("has accessible dialog role", () => {
    render(<TutorialCards />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
  });
});
