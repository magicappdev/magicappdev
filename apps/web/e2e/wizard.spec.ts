import { test, expect, type Page } from "@playwright/test";

async function openWizard(page: Page) {
  await page.goto("/wizard");

  await expect(page.getByText("What do you want to build?")).toBeVisible({
    timeout: 10_000,
  });
}

test("wizard idea step advances to template selection", async ({
  page,
}: {
  page: Page;
}) => {
  await openWizard(page);

  await page
    .locator("textarea")
    .fill("A modern todo app with dark mode and due dates");

  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText("Choose a template")).toBeVisible({
    timeout: 10_000,
  });
});

test("wizard template selection advances to naming", async ({
  page,
}: {
  page: Page;
}) => {
  await openWizard(page);

  await page
    .locator("textarea")
    .fill("A modern todo app with dark mode and due dates");

  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText("Choose a template")).toBeVisible({
    timeout: 10_000,
  });

  await page.getByRole("button", { name: /React SPA/ }).click();

  await expect(page.getByText("Name your project")).toBeVisible({
    timeout: 10_000,
  });
});

test("wizard project name triggers generation preview", async ({
  page,
}: {
  page: Page;
}) => {
  await openWizard(page);

  await page
    .locator("textarea")
    .fill("A modern todo app with dark mode and due dates");

  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText("Choose a template")).toBeVisible({
    timeout: 10_000,
  });

  await page.getByRole("button", { name: /React SPA/ }).click();

  await expect(page.getByText("Name your project")).toBeVisible({
    timeout: 10_000,
  });

  await page.locator("input[type='text']").fill("My Todo App");
  await page.getByRole("button", { name: /Generate Project/ }).click();

  await expect(page.getByText("Preview your project")).toBeVisible({
    timeout: 20_000,
  });
});

test("wizard preview shows generated files list", async ({
  page,
}: {
  page: Page;
}) => {
  await openWizard(page);

  await page
    .locator("textarea")
    .fill("A modern todo app with dark mode and due dates");

  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText("Choose a template")).toBeVisible({
    timeout: 10_000,
  });

  await page.getByRole("button", { name: /React SPA/ }).click();

  await expect(page.getByText("Name your project")).toBeVisible({
    timeout: 10_000,
  });

  await page.locator("input[type='text']").fill("My Todo App");
  await page.getByRole("button", { name: /Generate Project/ }).click();

  await expect(page.getByText("Preview your project")).toBeVisible({
    timeout: 20_000,
  });

  await expect(page.getByText("Generated files")).toBeVisible({
    timeout: 10_000,
  });
});

test("wizard back navigation returns to previous step", async ({
  page,
}: {
  page: Page;
}) => {
  await openWizard(page);

  await page
    .locator("textarea")
    .fill("A modern todo app with dark mode and due dates");

  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText("Choose a template")).toBeVisible({
    timeout: 10_000,
  });

  await page.getByRole("button", { name: "← Back" }).click();

  await expect(page.getByText("What do you want to build?")).toBeVisible({
    timeout: 10_000,
  });
});
