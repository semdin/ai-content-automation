/*
 * Authentication E2E Tests
 * Tests for login, register, and session management
 */

import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
    test.describe("Login Page", () => {
        test("should display login form", async ({ page }) => {
            await page.goto("/login");

            // Check form elements exist
            await expect(page.getByPlaceholder("Email")).toBeVisible();
            await expect(page.getByPlaceholder("Şifre")).toBeVisible();
            await expect(page.getByRole("button", { name: /giriş yap/i })).toBeVisible();
            await expect(page.getByRole("button", { name: /google/i })).toBeVisible();
        });

        test("should toggle between login and register", async ({ page }) => {
            await page.goto("/login");

            // Initially in login mode
            await expect(page.getByText("Hesabına giriş yap")).toBeVisible();

            // Click to switch to register
            await page.getByText("Hesabın yok mu? Kayıt ol").click();

            // Now in register mode
            await expect(page.getByText("Yeni hesap oluştur")).toBeVisible();
            await expect(page.getByPlaceholder("İsim")).toBeVisible();
        });

        test("should show error for invalid credentials", async ({ page }) => {
            await page.goto("/login");

            await page.getByPlaceholder("Email").fill("invalid@test.com");
            await page.getByPlaceholder("Şifre").fill("wrongpassword");
            await page.getByRole("button", { name: /giriş yap/i }).click();

            // Wait for error message
            await expect(page.getByText(/hata|invalid|geçersiz/i)).toBeVisible({
                timeout: 5000,
            });
        });

        test("should require password minimum length", async ({ page }) => {
            await page.goto("/login");

            const passwordInput = page.getByPlaceholder("Şifre");
            await passwordInput.fill("short");

            // HTML5 validation should require 8 characters
            const minLength = await passwordInput.getAttribute("minLength");
            expect(minLength).toBe("8");
        });
    });

    test.describe("Protected Routes", () => {
        test("should redirect unauthenticated user from dashboard to login", async ({
            page,
        }) => {
            await page.goto("/dashboard");

            // Should be redirected to login
            await expect(page).toHaveURL(/\/login/);
        });

        test("should redirect unauthenticated user from brands to login", async ({
            page,
        }) => {
            await page.goto("/dashboard/brands");

            // Should be redirected to login
            await expect(page).toHaveURL(/\/login/);
        });
    });
});
