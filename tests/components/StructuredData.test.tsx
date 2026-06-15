import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { StructuredData } from "@/components/atoms/StructuredData";

describe("StructuredData", () => {
  it("renders a script tag with JSON-LD type", () => {
    const { container } = render(<StructuredData />);
    const script = container.querySelector("script[type='application/ld+json']");
    expect(script).toBeDefined();
  });

  it("contains valid JSON with @context", () => {
    const { container } = render(<StructuredData />);
    const script = container.querySelector("script")!;
    const json = JSON.parse(script.innerHTML);
    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@graph"]).toBeDefined();
    expect(Array.isArray(json["@graph"])).toBe(true);
  });

  it("contains WebSite and WebApplication types", () => {
    const { container } = render(<StructuredData />);
    const script = container.querySelector("script")!;
    const json = JSON.parse(script.innerHTML);
    const types = json["@graph"].map((item: any) => item["@type"]);
    expect(types).toContain("WebSite");
    expect(types).toContain("WebApplication");
  });
});
