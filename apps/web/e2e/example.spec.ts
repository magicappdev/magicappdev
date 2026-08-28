import { test, expect } from "@playwright/test";

test("homepage has title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/MagicAppDev/);
});

test("navigation redirects to login when projects is unauthenticated", async ({
  page,
}) => {
  await page.goto("/projects");
  await expect(page).toHaveURL(/.*login/);
});
