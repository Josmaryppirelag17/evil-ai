import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageItem } from "@/components/molecules/MessageItem";

vi.mock("@/lib/i18n", () => ({
  useTranslation: () => ({
    t: {
      chat: {
        userLabel: "OPERATOR_SESSION",
        aiLabel: "CYBERCORE_AI",
        searching: "SEARCHING...",
        sources: "SOURCES",
      },
    },
  }),
}));

describe("MessageItem", () => {
  it("renders user message", () => {
    render(
      <MessageItem
        message={{
          id: "1", role: "user", text: "Hello", timestamp: "12:00",
        }}
      />
    );
    expect(screen.getByText("Hello")).toBeDefined();
    expect(screen.getByText("OPERATOR_SESSION")).toBeDefined();
  });

  it("renders assistant message", () => {
    render(
      <MessageItem
        message={{
          id: "2", role: "assistant", text: "Hi there", timestamp: "12:01",
        }}
      />
    );
    expect(screen.getByText("Hi there")).toBeDefined();
    expect(screen.getByText("CYBERCORE_AI")).toBeDefined();
  });

  it("shows searching indicator when isSearchingWeb", () => {
    render(
      <MessageItem
        message={{
          id: "3", role: "assistant", text: "", timestamp: "12:02",
          isSearchingWeb: true,
        }}
      />
    );
    expect(screen.getByText("SEARCHING...")).toBeDefined();
  });

  it("renders grounding sources", () => {
    render(
      <MessageItem
        message={{
          id: "4", role: "assistant", text: "Answer", timestamp: "12:03",
          groundingSources: [
            { index: 0, title: "Source 1", uri: "https://src1.com", snippet: "snip" },
          ],
        }}
      />
    );
    expect(screen.getByText("Source 1")).toBeDefined();
    expect(screen.getByText("SOURCES")).toBeDefined();
  });

  it("formats markdown headings", () => {
    render(
      <MessageItem
        message={{
          id: "5", role: "assistant", text: "### Title\nContent", timestamp: "12:04",
        }}
      />
    );
    expect(screen.getByText("Title")).toBeDefined();
    expect(screen.getByText("Content")).toBeDefined();
  });

  it("formats list items", () => {
    render(
      <MessageItem
        message={{
          id: "6", role: "assistant", text: "- item one\n- item two", timestamp: "12:05",
        }}
      />
    );
    expect(screen.getByText("item one")).toBeDefined();
    expect(screen.getByText("item two")).toBeDefined();
  });

  it("formats inline code", () => {
    const { container } = render(
      <MessageItem
        message={{
          id: "7", role: "assistant", text: "`code_block`", timestamp: "12:06",
        }}
      />
    );
    const codeBlock = container.querySelector(".text-cyber-green");
    expect(codeBlock).toBeDefined();
    expect(codeBlock!.textContent).toBe("code_block");
  });

  it("renders timestamp", () => {
    render(
      <MessageItem
        message={{
          id: "8", role: "user", text: "hi", timestamp: "14:30",
        }}
      />
    );
    expect(screen.getByText("14:30")).toBeDefined();
  });
});
