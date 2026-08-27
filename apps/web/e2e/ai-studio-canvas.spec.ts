import { test, expect } from "@playwright/test";

test("AI Studio Canvas flow on chat page", async ({ page }) => {
  await page.goto("/chat");

  // Verify landing heading for vibe-coding prompt
  await expect(page.locator("h1")).toContainText("What do you want to create?");

  // Type a prompt into the main input textarea
  const textarea = page.locator("textarea");
  await textarea.fill(
    "Build a modern task management dashboard with kanban board",
  );

  // Click create/send button
  const createButton = page.locator("button", { hasText: "Create" });
  await createButton.click();

  // Verify chat switches to AI Studio Canvas split-pane view or streams response
  await expect(page.locator("text=AI Studio Canvas")).toBeVisible({
    timeout: 10000,
  });
});

test("AI Studio model selector and view mode switcher", async ({ page }) => {
  await page.goto("/chat");

  // Trigger entering chat mode by submitting a quick suggestion or prompt
  const suggestionChip = page.locator("button", { hasText: "SaaS Dashboard" });
  if (await suggestionChip.isVisible()) {
    await suggestionChip.click();
  } else {
    await page.locator("textarea").fill("Build a SaaS dashboard");
    await page.locator("button", { hasText: "Create" }).click();
  }

  // Check model selector exists in header
  await expect(page.locator("select")).toBeVisible({ timeout: 10000 });

  // Check view mode switcher buttons
  await expect(page.locator("button", { hasText: "Split View" })).toBeVisible();
  await expect(page.locator("button", { hasText: "Chat Only" })).toBeVisible();
  await expect(
    page.locator("button", { hasText: "Canvas Preview" }),
  ).toBeVisible();

  // Switch to Chat Only view
  await page.click("button:has-text('Chat Only')");
  await expect(page.locator("button", { hasText: "Split View" })).toBeVisible();
});
