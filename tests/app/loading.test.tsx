import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Loading from "@/app/loading";

describe("Loading page", () => {
  it("renders loading indicator", () => {
    render(<Loading />);
    expect(screen.getByText("INITIALIZING...")).toBeDefined();
    expect(screen.getByLabelText("Cargando")).toBeDefined();
  });
});
