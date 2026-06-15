import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecommendationsPanel } from "@/components/molecules/RecommendationsPanel";

describe("RecommendationsPanel", () => {
  it("renders empty state", () => {
    render(<RecommendationsPanel pages={[]} currentPage={0} onPageChange={vi.fn()} onOpenUrl={vi.fn()} onShowTutorial={vi.fn()} />);
    expect(screen.getByText("No Web Results Yet")).toBeDefined();
  });

  it("renders loading state", () => {
    render(<RecommendationsPanel pages={[]} currentPage={0} onPageChange={vi.fn()} onOpenUrl={vi.fn()} onShowTutorial={vi.fn()} isLoading />);
    expect(screen.getByText("[ SCANNING WEB NODES ]")).toBeDefined();
  });
});
