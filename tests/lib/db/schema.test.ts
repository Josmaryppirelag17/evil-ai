import { describe, it, expect } from "vitest";

describe("db schema", () => {
  it("exports expected schema objects", async () => {
    const schema = await import("@/lib/db/schema");
    expect(schema.users).toBeDefined();
    expect(schema.authSessions).toBeDefined();
    expect(schema.passwordResetTokens).toBeDefined();
    expect(schema.auditLogs).toBeDefined();
    expect(schema.sessions).toBeDefined();
    expect(schema.messages).toBeDefined();
  });
});
