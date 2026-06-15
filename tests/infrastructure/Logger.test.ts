import { describe, it, expect, vi, beforeEach } from "vitest";
import { Logger } from "@/infrastructure/logger/Logger";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("Logger", () => {
  it("creates logger with context", () => {
    const logger = new Logger("test");
    expect(logger).toBeDefined();
  });

  it("debug calls console.info", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const logger = new Logger("test");
    logger.debug("debug msg");
    expect(spy).toHaveBeenCalled();
  });

  it("info calls console.info", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const logger = new Logger("test");
    logger.info("info msg");
    expect(spy).toHaveBeenCalled();
  });

  it("warn calls console.warn", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const logger = new Logger("test");
    logger.warn("warn msg");
    expect(spy).toHaveBeenCalled();
  });

  it("error calls console.error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const logger = new Logger("test");
    logger.error("error msg");
    expect(spy).toHaveBeenCalled();
  });

  it("suppresses debug in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const logger = new Logger("test");
    logger.debug("should not log");
    expect(spy).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });
});
