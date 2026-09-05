import { test, expect, type Page } from "@playwright/test";

async function submitPrompt(page: Page) {
  await page.goto("/chat");

  await expect(
    page.getByRole("heading", { name: "What do you want to create?" }),
  ).toBeVisible();

  await page
    .locator("textarea")
    .fill("Build a modern task management dashboard with kanban board");

  const createButton = page.getByRole("button", {
    name: "Create",
    exact: true,
  });
  await expect(createButton).toBeVisible({ timeout: 10_000 });
  await createButton.click();
}

test("AI Studio Canvas flow on chat page", async ({ page }: { page: Page }) => {
  await submitPrompt(page);

  await expect(page.getByText("AI Studio Canvas")).toBeVisible({
    timeout: 15_000,
  });
});

test("AI Studio model selector and view mode switcher", async ({
  page,
}: {
  page: Page;
}) => {
  await submitPrompt(page);

  await expect(page.locator("select")).toBeVisible({ timeout: 10_000 });

  await expect(page.getByRole("button", { name: "Split View" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Chat Only" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Canvas Preview" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Chat Only" }).click();
  await expect(page.getByRole("button", { name: "Split View" })).toBeVisible();
});
