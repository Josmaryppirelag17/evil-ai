import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchGoogle } from "@/lib/search";

describe("search", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv("SERPER_API_KEY", "serper_test_key");
  });

  it("returns search results", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          organic: [
            { title: "Result 1", link: "https://example.com", snippet: "Snippet 1", position: 1 },
            { title: "Result 2", link: "https://example2.com", snippet: "Snippet 2", position: 2 },
          ],
        }),
        { status: 200 },
      ),
    );

    const results = await searchGoogle("test query");
    expect(results).toHaveLength(2);
    expect(results[0].title).toBe("Result 1");
    expect(results[1].position).toBe(2);
  });

  it("limits results", async () => {
    const items = Array.from({ length: 20 }, (_, i) => ({
      title: `Result ${i + 1}`,
      link: `https://example${i}.com`,
      snippet: `Snippet ${i + 1}`,
      position: i + 1,
    }));

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ organic: items }), { status: 200 }),
    );

    const results = await searchGoogle("test", 5);
    expect(results).toHaveLength(5);
  });

  it("returns empty array when no organic results", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    const results = await searchGoogle("test");
    expect(results).toEqual([]);
  });

  it("throws on non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Unauthorized", { status: 401 }),
    );

    await expect(searchGoogle("test")).rejects.toThrow("Serper error");
  });

  it("throws when API returns error field", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Quota exceeded" }), { status: 200 }),
    );

    await expect(searchGoogle("test")).rejects.toThrow("Serper API error");
  });

  it("throws when API key is missing", async () => {
    vi.stubEnv("SERPER_API_KEY", "");

    await expect(searchGoogle("test")).rejects.toThrow("SERPER_API_KEY");
  });
});
