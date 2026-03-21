/**
 * Generate command - Generate components, screens, pages, hooks, services, and contexts.
 */

import {
  buttonComponentTemplate,
  contextTemplate,
  generateComponent,
  generateFromTemplate,
  generateScreen,
  hookTemplate,
  pageTemplate,
  screenTemplate,
  serviceTemplate,
} from "@magicappdev/templates";
import { Command } from "commander";
import { promptText } from "../../lib/prompts.js";
import { withSpinner } from "../../lib/spinner.js";
import {
  error,
  header,
  info,
  keyValue,
  newline,
  success,
} from "../../lib/ui.js";

interface GenerateOptions {
  path?: string;
  typescript?: boolean;
}

export const generateCommand = new Command("generate")
  .alias("g")
  .description("Generate code from templates")
  .addHelpText(
    "after",
    `
Examples:
  $ magicappdev generate component MyButton
  $ magicappdev generate screen SettingsScreen --path ./app/settings
  $ magicappdev generate page dashboard --path ./src/app
  $ magicappdev generate hook useAuth --path ./src/hooks
  $ magicappdev generate service User --path ./src/services
  $ magicappdev generate context Auth --path ./src/contexts
`,
  )
  .addCommand(
    new Command("component")
      .alias("c")
      .description("Generate a new component")
      .argument("[name]", "Component name")
      .option("-p, --path <path>", "Output path", "./src/components")
      .option("--typescript", "Use TypeScript", true)
      .action(async (name: string | undefined, options: GenerateOptions) => {
        header("Generate Component");

        try {
          let componentName = name;
          if (!componentName) {
            componentName = await promptText("What is the component name?", {
              validate: value => {
                if (!value || value.length < 1) return "Component name is required";
                if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) return "Component name must be PascalCase";
                return true;
              },
            });
          }

          if (!componentName) { error("Component name is required"); process.exit(1); }

          const outputDir = options.path || "./src/components";
          newline();
          info("Generating component:");
          keyValue("Name", componentName);
          keyValue("Path", outputDir);
          newline();

          const result = await withSpinner(
            `Creating ${componentName}...`,
            () => generateComponent(componentName!, buttonComponentTemplate, outputDir, {
              typescript: options.typescript ?? true,
              withVariants: true,
            }),
            { successText: `Created ${componentName}` },
          );

          newline();
          success(`Component "${componentName}" created successfully!`);
          info(`Files created: ${result.files.join(", ")}`);
          newline();
        } catch (err) {
          error(err instanceof Error ? err.message : "Failed to generate component");
          process.exit(1);
        }
      }),
  )
  .addCommand(
    new Command("screen")
      .alias("s")
      .description("Generate a new screen")
      .argument("[name]", "Screen name")
      .option("-p, --path <path>", "Output path", "./src/screens")
      .option("--typescript", "Use TypeScript", true)
      .action(async (name: string | undefined, options: GenerateOptions) => {
        header("Generate Screen");

        try {
          let screenName = name;
          if (!screenName) {
            screenName = await promptText("What is the screen name?", {
              validate: value => {
                if (!value || value.length < 1) return "Screen name is required";
                if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) return "Screen name must be PascalCase";
                return true;
              },
            });
          }

          if (!screenName) { error("Screen name is required"); process.exit(1); }

          const outputDir = options.path || "./src/screens";
          newline();
          info("Generating screen:");
          keyValue("Name", screenName);
          keyValue("Path", outputDir);
          newline();

          const result = await withSpinner(
            `Creating ${screenName}...`,
            () => generateScreen(screenName!, screenTemplate, outputDir, {
              typescript: options.typescript ?? true,
            }),
            { successText: `Created ${screenName}` },
          );

          newline();
          success(`Screen "${screenName}" created successfully!`);
          info(`Files created: ${result.files.join(", ")}`);
          newline();
        } catch (err) {
          error(err instanceof Error ? err.message : "Failed to generate screen");
          process.exit(1);
        }
      }),
  )
  .addCommand(
    new Command("page")
      .alias("pg")
      .description("Generate a new Next.js App Router page")
      .argument("[name]", "Page name (kebab-case route segment)")
      .option("-p, --path <path>", "Output path (e.g. ./src/app)", "./src/app")
      .option("--typescript", "Use TypeScript", true)
      .action(async (name: string | undefined, options: GenerateOptions) => {
        header("Generate Page");

        try {
          let pageName = name;
          if (!pageName) {
            pageName = await promptText("What is the page name?", {
              validate: value => (value?.length ? true : "Page name is required"),
            });
          }

          if (!pageName) { error("Page name is required"); process.exit(1); }

          const outputDir = options.path || "./src/app";
          newline();
          info("Generating page:");
          keyValue("Name", pageName);
          keyValue("Path", outputDir);
          newline();

          const result = await withSpinner(
            `Creating ${pageName} page...`,
            () => generateFromTemplate(pageTemplate, {
              outputDir,
              variables: { name: pageName!, typescript: options.typescript ?? true },
            }),
            { successText: `Created ${pageName} page` },
          );

          newline();
          success(`Page "${pageName}" created successfully!`);
          info(`Files created: ${result.files.join(", ")}`);
          newline();
        } catch (err) {
          error(err instanceof Error ? err.message : "Failed to generate page");
          process.exit(1);
        }
      }),
  )
  .addCommand(
    new Command("hook")
      .alias("h")
      .description("Generate a custom React hook")
      .argument("[name]", "Hook name (PascalCase, 'use' prefix added automatically)")
      .option("-p, --path <path>", "Output path", "./src/hooks")
      .option("--typescript", "Use TypeScript", true)
      .action(async (name: string | undefined, options: GenerateOptions) => {
        header("Generate Hook");

        try {
          let hookName = name;
          if (!hookName) {
            hookName = await promptText("What is the hook name?", {
              validate: value => (value?.length ? true : "Hook name is required"),
            });
          }

          if (!hookName) { error("Hook name is required"); process.exit(1); }

          // Strip leading 'use' so template adds it predictably
          const baseName = hookName.replace(/^use/i, "");
          const displayName = baseName.charAt(0).toUpperCase() + baseName.slice(1);

          const outputDir = options.path || "./src/hooks";
          newline();
          info("Generating hook:");
          keyValue("Name", `use${displayName}`);
          keyValue("Path", outputDir);
          newline();

          const result = await withSpinner(
            `Creating use${displayName}...`,
            () => generateFromTemplate(hookTemplate, {
              outputDir,
              variables: { name: displayName, typescript: options.typescript ?? true },
            }),
            { successText: `Created use${displayName}` },
          );

          newline();
          success(`Hook "use${displayName}" created successfully!`);
          info(`Files created: ${result.files.join(", ")}`);
          newline();
        } catch (err) {
          error(err instanceof Error ? err.message : "Failed to generate hook");
          process.exit(1);
        }
      }),
  )
  .addCommand(
    new Command("service")
      .alias("sv")
      .description("Generate a typed API service class")
      .argument("[name]", "Resource name (e.g. User, Project)")
      .option("-p, --path <path>", "Output path", "./src/services")
      .option("-b, --base-url <url>", "API base URL", "/api")
      .option("--typescript", "Use TypeScript", true)
      .action(async (name: string | undefined, options: GenerateOptions & { baseUrl?: string }) => {
        header("Generate Service");

        try {
          let resourceName = name;
          if (!resourceName) {
            resourceName = await promptText("What is the resource name? (e.g. User, Project)", {
              validate: value => (value?.length ? true : "Resource name is required"),
            });
          }

          if (!resourceName) { error("Resource name is required"); process.exit(1); }

          const outputDir = options.path || "./src/services";
          newline();
          info("Generating service:");
          keyValue("Resource", resourceName);
          keyValue("Path", outputDir);
          keyValue("Base URL", options.baseUrl || "/api");
          newline();

          const result = await withSpinner(
            `Creating ${resourceName}Service...`,
            () => generateFromTemplate(serviceTemplate, {
              outputDir,
              variables: {
                name: resourceName!,
                typescript: options.typescript ?? true,
                baseUrl: options.baseUrl || "/api",
              },
            }),
            { successText: `Created ${resourceName}Service` },
          );

          newline();
          success(`Service "${resourceName}Service" created successfully!`);
          info(`Files created: ${result.files.join(", ")}`);
          newline();
        } catch (err) {
          error(err instanceof Error ? err.message : "Failed to generate service");
          process.exit(1);
        }
      }),
  )
  .addCommand(
    new Command("context")
      .alias("ctx")
      .description("Generate a React Context with Provider and custom hook")
      .argument("[name]", "Context name (e.g. Auth, Theme)")
      .option("-p, --path <path>", "Output path", "./src/contexts")
      .option("--typescript", "Use TypeScript", true)
      .action(async (name: string | undefined, options: GenerateOptions) => {
        header("Generate Context");

        try {
          let contextName = name;
          if (!contextName) {
            contextName = await promptText("What is the context name? (e.g. Auth, Theme)", {
              validate: value => (value?.length ? true : "Context name is required"),
            });
          }

          if (!contextName) { error("Context name is required"); process.exit(1); }

          const outputDir = options.path || "./src/contexts";
          newline();
          info("Generating context:");
          keyValue("Name", `${contextName}Context`);
          keyValue("Path", outputDir);
          newline();

          const result = await withSpinner(
            `Creating ${contextName}Context...`,
            () => generateFromTemplate(contextTemplate, {
              outputDir,
              variables: { name: contextName!, typescript: options.typescript ?? true },
            }),
            { successText: `Created ${contextName}Context` },
          );

          newline();
          success(`Context "${contextName}Context" created successfully!`);
          info(`Files created: ${result.files.join(", ")}`);
          newline();
        } catch (err) {
          error(err instanceof Error ? err.message : "Failed to generate context");
          process.exit(1);
        }
      }),
  );
