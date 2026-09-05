import { test, expect, type Page } from "@playwright/test";

async function openWizard(page: Page) {
  await page.goto("/wizard");

  await expect(page.getByTestId("wizard-step-idea")).toBeVisible({
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
    .getByTestId("wizard-idea-input")
    .fill("A modern todo app with dark mode and due dates");

  await page.getByTestId("wizard-idea-continue").click();

  await expect(page.getByTestId("wizard-step-template")).toBeVisible({
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
    .getByTestId("wizard-idea-input")
    .fill("A modern todo app with dark mode and due dates");

  await page.getByTestId("wizard-idea-continue").click();

  await expect(page.getByTestId("wizard-step-template")).toBeVisible({
    timeout: 10_000,
  });

  await page.getByTestId("wizard-template-react-spa").click();

  await expect(page.getByTestId("wizard-step-name")).toBeVisible({
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
    .getByTestId("wizard-idea-input")
    .fill("A modern todo app with dark mode and due dates");

  await page.getByTestId("wizard-idea-continue").click();

  await expect(page.getByTestId("wizard-step-template")).toBeVisible({
    timeout: 10_000,
  });

  await page.getByTestId("wizard-template-react-spa").click();

  await expect(page.getByTestId("wizard-step-name")).toBeVisible({
    timeout: 10_000,
  });

  await page.getByTestId("wizard-project-name-input").fill("My Todo App");
  await page.getByTestId("wizard-generate-project").click();

  await expect(page.getByTestId("wizard-step-preview")).toBeVisible({
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
    .getByTestId("wizard-idea-input")
    .fill("A modern todo app with dark mode and due dates");

  await page.getByTestId("wizard-idea-continue").click();

  await expect(page.getByTestId("wizard-step-template")).toBeVisible({
    timeout: 10_000,
  });

  await page.getByTestId("wizard-template-react-spa").click();

  await expect(page.getByTestId("wizard-step-name")).toBeVisible({
    timeout: 10_000,
  });

  await page.getByTestId("wizard-project-name-input").fill("My Todo App");
  await page.getByTestId("wizard-generate-project").click();

  await expect(page.getByTestId("wizard-step-preview")).toBeVisible({
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
    .getByTestId("wizard-idea-input")
    .fill("A modern todo app with dark mode and due dates");

  await page.getByTestId("wizard-idea-continue").click();

  await expect(page.getByTestId("wizard-step-template")).toBeVisible({
    timeout: 10_000,
  });

  await page.getByTestId("wizard-back").click();

  await expect(page.getByTestId("wizard-step-idea")).toBeVisible({
    timeout: 10_000,
  });
});
