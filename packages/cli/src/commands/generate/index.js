/**
 * Generate command - Generate components, screens, etc.
 */
import { generateComponent, buttonComponentTemplate, generateScreen, screenTemplate, } from "@magicappdev/templates";
import { header, success, error, info, keyValue, newline, } from "../../lib/ui.js";
import { withSpinner } from "../../lib/spinner.js";
import { promptText } from "../../lib/prompts.js";
import { Command } from "commander";
export const generateCommand = new Command("generate")
    .alias("g")
    .description("Generate code from templates")
    .addHelpText("after", `
Examples:
  $ magicappdev generate component MyButton
  $ magicappdev generate screen SettingsScreen --path ./app/settings
`)
    .addCommand(new Command("component")
    .alias("c")
    .description("Generate a new component")
    .argument("[name]", "Component name")
    .option("-p, --path <path>", "Output path", "./src/components")
    .option("--typescript", "Use TypeScript", true)
    .action(async (name, options) => {
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
        const result = await withSpinner(`Creating ${componentName}...`, async () => {
            return generateComponent(componentName, buttonComponentTemplate, outputDir, {
                typescript: options.typescript ?? true,
                withVariants: true,
            });
        }, { successText: `Created ${componentName}` });
        newline();
        success(`Component "${componentName}" created successfully!`);
        info(`Files created: ${result.files.join(", ")}`);
        newline();
    }
    catch (err) {
        error(err instanceof Error ? err.message : "Failed to generate component");
        process.exit(1);
    }
}))
    .addCommand(new Command("screen")
    .alias("s")
    .description("Generate a new screen")
    .argument("[name]", "Screen name")
    .option("-p, --path <path>", "Output path", "./src/screens")
    .option("--typescript", "Use TypeScript", true)
    .action(async (name, options) => {
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
        const result = await withSpinner(`Creating ${screenName}...`, async () => {
            return generateScreen(screenName, screenTemplate, outputDir, {
                typescript: options.typescript ?? true,
            });
        }, { successText: `Created ${screenName}` });
        newline();
        success(`Screen "${screenName}" created successfully!`);
        info(`Files created: ${result.files.join(", ")}`);
        newline();
    }
    catch (err) {
        error(err instanceof Error ? err.message : "Failed to generate screen");
        process.exit(1);
    }
}));
