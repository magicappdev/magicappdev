/**
 * Generate command - Generate components, screens, etc.
 */

import { Command } from "commander";
import { generateComponent, buttonComponentTemplate } from "@magicappdev/templates";
import { header, success, error, info, keyValue, newline } from "../../lib/ui";
import { withSpinner } from "../../lib/spinner";
import { promptText } from "../../lib/prompts";

interface GenerateOptions {
  path?: string;
  typescript?: boolean;
}

export const generateCommand = new Command("generate")
  .alias("g")
  .description("Generate code from templates")
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
              return generateComponent(componentName!, buttonComponentTemplate, outputDir, {
                typescript: options.typescript ?? true,
                withVariants: true,
              });
            },
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
      .action(async (name: string | undefined, options: GenerateOptions) => {
        header("Generate Screen");

        // TODO: Implement screen generation
        info("Screen generation coming soon!");
      }),
  );
