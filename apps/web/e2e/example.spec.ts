import { test, expect } from "@playwright/test";

test("homepage has title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/MagicAppDev/);
});

test("navigation works", async ({ page }) => {
  await page.goto("/");
  await page.click("text=Projects");
  await expect(page).toHaveURL(/.*projects/);
});

test("authentication flow", async ({ page }) => {
  await page.goto("/");
  await page.click("text=Login");
  await expect(page).toHaveURL(/.*login/);
});
