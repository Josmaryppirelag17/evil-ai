import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "@/app/not-found";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

describe("Not found page", () => {
  it("renders 404", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeDefined();
    expect(screen.getByText("SYSTEM ERROR: PAGE NOT FOUND")).toBeDefined();
    expect(screen.getByLabelText("Volver a la página de inicio")).toBeDefined();
  });
});
