/*
 * E2E Test Example
 * Testing the home page with Playwright
 */

import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
    test("should load the home page", async ({ page }) => {
        await page.goto("/");

        // Sayfa yüklendi mi?
        await expect(page).toHaveURL("/");
    });

    test("should have correct title", async ({ page }) => {
        await page.goto("/");

        // Next.js default title
        await expect(page).toHaveTitle(/Next/);
    });

    test("should display main content", async ({ page }) => {
        await page.goto("/");

        // Body görünür mü?
        const body = page.locator("body");
        await expect(body).toBeVisible();
    });
});
