/**
 * Generate command - Generate components, screens, etc.
 */

import {
  generateApp,
  generateComponent,
  buttonComponentTemplate,
  generateScreen,
  screenTemplate,
  registry,
} from "@magicappdev/templates-engine";
import {
  header,
  success,
  error,
  warn,
  info,
  keyValue,
  newline,
} from "../../lib/ui.js";
import { promptText, promptSelect, promptConfirm } from "../../lib/prompts.js";
import { withSpinner } from "../../lib/spinner.js";
import { Command } from "commander";

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
          // Get component name
          let componentName = name;
          if (!componentName) {
            componentName = await promptText("What is the component name?", {
              validate: value => {
                if (!value || value.length < 1) {
                  return "Component name is required";
                }
                if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
                  return "Component name must be PascalCase";
                }
                return true;
              },
            });
          }

          if (!componentName) {
            error("Component name is required");
            process.exit(1);
          }

          const outputDir = options.path || "./src/components";

          newline();
          info("Generating component:");
          keyValue("Name", componentName);
          keyValue("Path", outputDir);
          newline();

          const result = await withSpinner(
            `Creating ${componentName}...`,
            async () => {
              return generateComponent(
                componentName!,
                buttonComponentTemplate,
                outputDir,
                {
                  typescript: options.typescript ?? true,
                  withVariants: true,
                },
              );
            },
            { successText: `Created ${componentName}` },
          );

          newline();
          success(`Component "${componentName}" created successfully!`);
          info(`Files created: ${result.files.join(", ")}`);
          newline();
        } catch (err) {
          error(
            err instanceof Error ? err.message : "Failed to generate component",
          );
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
          // Get screen name
          let screenName = name;
          if (!screenName) {
            screenName = await promptText("What is the screen name?", {
              validate: value => {
                if (!value || value.length < 1) {
                  return "Screen name is required";
                }
                if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
                  return "Screen name must be PascalCase";
                }
                return true;
              },
            });
          }

          if (!screenName) {
            error("Screen name is required");
            process.exit(1);
          }

          const outputDir = options.path || "./src/screens";

          newline();
          info("Generating screen:");
          keyValue("Name", screenName);
          keyValue("Path", outputDir);
          newline();

          const result = await withSpinner(
            `Creating ${screenName}...`,
            async () => {
              return generateScreen(screenName!, screenTemplate, outputDir, {
                typescript: options.typescript ?? true,
              });
            },
            { successText: `Created ${screenName}` },
          );

          newline();
          success(`Screen "${screenName}" created successfully!`);
          info(`Files created: ${result.files.join(", ")}`);
          newline();
        } catch (err) {
          error(
            err instanceof Error ? err.message : "Failed to generate screen",
          );
          process.exit(1);
        }
      }),
  )
  .addCommand(
    new Command("app")
      .alias("a")
      .description("Generate a new app from a template")
      .argument("[name]", "App name")
      .option("-p, --path <path>", "Output path", ".")
      .action(async (name: string | undefined, options: GenerateOptions) => {
        header("Generate App");

        try {
          const appTemplates = registry
            .getAll()
            .filter(t => t.category === "app");

          if (appTemplates.length === 0) {
            error("No app templates available");
            process.exit(1);
          }

          let appName = name;
          if (!appName) {
            appName = await promptText("What is your app name?", {
              validate: value => {
                if (!value || value.length < 2) {
                  return "App name must be at least 2 characters";
                }
                if (!/^[a-zA-Z][a-zA-Z0-9-_ ]*$/.test(value)) {
                  return "App name must start with a letter and contain only letters, numbers, hyphens, underscores, and spaces";
                }
                return true;
              },
            });
          }

          if (!appName) {
            error("App name is required");
            process.exit(1);
          }

          const templateChoices = appTemplates.map(t => ({
            title: `${t.name} - ${t.description}`,
            value: t.id,
            description: t.frameworks.join(", "),
          }));

          const selectedTemplateId = await promptSelect<string>(
            "Select a template:",
            templateChoices,
          );

          if (!selectedTemplateId) {
            error("Template selection is required");
            process.exit(1);
          }

          const template = registry.get(selectedTemplateId);
          if (!template) {
            error("Selected template not found");
            process.exit(1);
          }

          const variables: Record<string, string | boolean | number> = {
            name: appName,
            appName: appName,
          };

          for (const variable of template.variables) {
            if (variable.name === "name" || variable.name === "appName") {
              continue;
            }

            let value: string | boolean | number | undefined;

            if (variable.type === "boolean") {
              value = await promptConfirm(
                `${variable.description || variable.name}?`,
                { initial: variable.default === true },
              );
            } else if (variable.type === "select" && variable.options) {
              const choices = variable.options.map(opt => ({
                title: opt,
                value: opt,
              }));
              value = await promptSelect<string>(
                `${variable.description || variable.name}:`,
                choices,
              );
            } else {
              value = await promptText(
                `${variable.description || variable.name}:`,
                { initial: variable.default as string | undefined },
              );
            }

            if (value === undefined) {
              error("Input cancelled");
              process.exit(1);
            }

            variables[variable.name] = value;
          }

          const outputDir = options.path || ".";

          newline();
          info("Generating app:");
          keyValue("Name", appName);
          keyValue("Template", template.name);
          keyValue("Path", outputDir);
          newline();

          const result = await withSpinner(
            `Creating ${appName}...`,
            async () => {
              return generateApp(appName, template, outputDir, variables);
            },
            { successText: `Created ${appName}` },
          );

          newline();
          success(`App "${appName}" created successfully!`);
          info(`Files created: ${result.files.length}`);
          if (result.skipped.length > 0) {
            warn(`Files skipped: ${result.skipped.length}`);
          }
          newline();
        } catch (err) {
          error(err instanceof Error ? err.message : "Failed to generate app");
          process.exit(1);
        }
      }),
  );
