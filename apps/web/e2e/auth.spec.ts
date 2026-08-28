import { test, expect } from "@playwright/test";

test("homepage loads with MagicAppDev title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/MagicAppDev/);
});

test("login page is reachable and renders sign in heading", async ({
  page,
}) => {
  await page.goto("/login");
  await expect(page.locator("text=Sign in to your account")).toBeVisible();
});

test("github login button is present on login page", async ({ page }) => {
  await page.goto("/login");
  const githubButton = page.locator('button:has-text("GitHub")');
  await expect(githubButton.first()).toBeVisible();
});

test("discord login button is present on login page", async ({ page }) => {
  await page.goto("/login");
  const discordButton = page.locator('button:has-text("Discord")');
  await expect(discordButton.first()).toBeVisible();
});

test("navigation from homepage to chat is functional", async ({ page }) => {
  await page.goto("/");
  await page.click("text=Start Building");
  await expect(page).toHaveURL(/.*chat/);
});

test("login link navigates to auth page from homepage sidebar", async ({
  page,
}) => {
  await page.goto("/");
  await page.click("text=Login");
  await expect(page).toHaveURL(/.*login/);
});
