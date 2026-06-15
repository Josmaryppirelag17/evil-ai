import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**"],
      exclude: [
        "**/migrations/**",
        "**/*.sql",
        "**/node_modules/**",
        "src/lib/i18n/translations.ts",
        "src/lib/i18n/types.ts",
        "src/app/opengraph-image.tsx",
        "src/app/robots.ts",
        "src/app/sitemap.ts",
        "src/middleware.ts",
        "src/types/**",
        "src/lib/analytics.ts",
      ],
      thresholds: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@core": path.resolve(__dirname, "./src/core"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@infrastructure": path.resolve(__dirname, "./src/infrastructure"),
    },
  },
});
