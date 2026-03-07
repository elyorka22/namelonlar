import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load homepage with search bar", async ({ page }) => {
    await page.goto("http://localhost:3000");

    // Check if search bar is visible
    const searchBar = page.locator('input[placeholder*="Что вы ищете"]');
    await expect(searchBar).toBeVisible();

    // Check if categories section exists
    const categoriesSection = page.locator("text=Категории");
    await expect(categoriesSection).toBeVisible();

    // Check if header is visible
    const header = page.locator("text=Namangan Elonlar");
    await expect(header).toBeVisible();
  });

  test("should navigate to search page on search", async ({ page }) => {
    await page.goto("http://localhost:3000");

    const searchBar = page.locator('input[placeholder*="Что вы ищете"]');
    await searchBar.fill("iPhone");
    await searchBar.press("Enter");

    // Should navigate to search page
    await expect(page).toHaveURL(/\/search/);
    expect(page.url()).toContain("q=iPhone");
  });

  test("should show login button when not authenticated", async ({ page }) => {
    await page.goto("http://localhost:3000");

    const loginButton = page.locator("text=Войти");
    await expect(loginButton).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("should navigate to categories", async ({ page }) => {
    await page.goto("http://localhost:3000");

    const categoriesLink = page.locator("text=Категории").first();
    await categoriesLink.click();

    // Should show categories or navigate to categories page
    await expect(page.locator("text=Категории")).toBeVisible();
  });
});

