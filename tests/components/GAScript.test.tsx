import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

vi.mock("next/script", () => ({
  default: ({ children, ...props }: any) => {
    if (children) {
      return <script {...props} data-testid="ga-script" dangerouslySetInnerHTML={{ __html: typeof children === "function" ? children() : children }} />;
    }
    return <script {...props} data-testid="ga-script" />;
  },
}));

describe("GAScript", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "");
  });

  it("returns null when GA_ID is not set", async () => {
    const { GAScript } = await import("@/components/atoms/GAScript");
    const { container } = render(<GAScript />);
    expect(container.innerHTML).toBe("");
  });

  it("renders scripts when GA_ID is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-XXXXXXXXXX");
    const { GAScript } = await import("@/components/atoms/GAScript");
    const { container } = render(<GAScript />);
    const scripts = container.querySelectorAll("script");
    expect(scripts.length).toBe(2);
  });
});
