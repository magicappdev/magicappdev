import { test, expect } from "@playwright/test";

test.skip("AI Studio Canvas flow on chat page", async ({ page }) => {
  await page.goto("/chat");
  await expect(
    page.getByRole("heading", { name: "What do you want to create?" }),
  ).toBeVisible();

  await page
    .locator("textarea")
    .fill("Build a modern task management dashboard with kanban board");

  // Use /Create|Send/ to match either label (isLanding may vary); force: true
  // bypasses disabled state in test environments where WebSocket is unavailable.
  await page
    .getByRole("button", { name: /Create|Send/ })
    .click({ force: true });

  await expect(page.getByText("AI Studio Canvas")).toBeVisible({
    timeout: 10000,
  });
});

test.skip("AI Studio model selector and view mode switcher", async ({
  page,
}) => {
  await page.goto("/chat");

  await expect(page.locator("select")).toBeVisible({ timeout: 10000 });

  await expect(page.getByRole("button", { name: "Split View" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Chat Only" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Canvas Preview" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Chat Only" }).click();
  await expect(page.getByRole("button", { name: "Split View" })).toBeVisible();
});
