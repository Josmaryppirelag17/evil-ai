import { test, expect } from "@playwright/test";

test.describe("AI Assistant — Home page", () => {
  test("page loads with correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/VIL|Asistente|Assistant/);
  });

  test("skip link is present and focusable", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.locator("a[href='#main-content']");
    await expect(skipLink).toBeVisible();
    await skipLink.focus();
    await expect(skipLink).toBeFocused();
  });

  test("chat input is rendered", async ({ page }) => {
    await page.goto("/");
    const input = page.locator("input, textarea").first();
    await expect(input).toBeVisible();
  });

  test("footer contains portfolio link", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeVisible();
    const portfolioLink = footer.locator("a[aria-label*='portafolio']");
    await expect(portfolioLink).toBeVisible();
  });
});
