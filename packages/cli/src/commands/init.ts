/**
 * Init command - Initialize a new MagicAppDev project
 */

import {
  promptProjectName,
  promptFramework,
  promptStyling,
  promptTypeScript,
  promptSelect,
  promptPreferences,
} from "../lib/prompts.js";
import {
  header,
  logo,
  success,
  error,
  info,
  keyValue,
  command,
  newline,
  divider,
} from "../lib/ui.js";
import { builtInTemplates } from "@magicappdev/templates";
import { generateApp } from "@magicappdev/templates";
import { withSpinner } from "../lib/spinner.js";
import { spawn } from "child_process";
import { Command } from "commander";
import * as path from "path";

interface InitOptions {
  template?: string;
  framework?: string;
  typescript?: boolean;
  yes?: boolean;
  install?: boolean;
}

/** Detect the package manager to use */
function detectPackageManager(): "pnpm" | "npm" | "yarn" | "bun" {
  const userAgent = process.env.npm_config_user_agent || "";
  if (userAgent.includes("pnpm")) return "pnpm";
  if (userAgent.includes("yarn")) return "yarn";
  if (userAgent.includes("bun")) return "bun";
  return "npm";
}

/** Run package manager install */
async function runInstall(
  projectDir: string,
  pm: string,
): Promise<{ success: boolean; error?: string }> {
  return new Promise(resolve => {
    const child = spawn(pm, ["install"], {
      cwd: projectDir,
      stdio: "inherit",
      shell: true,
    });

    child.on("close", code => {
      if (code === 0) {
        resolve({ success: true });
      } else {
        resolve({ success: false, error: `Exit code ${code}` });
      }
    });

    child.on("error", err => {
      resolve({ success: false, error: err.message });
    });
  });
}

export const initCommand = new Command("init")
  .description("Initialize a new MagicAppDev project")
  .argument("[name]", "Project name")
  .option("-t, --template <template>", "Template to use (blank, tabs)")
  .option("-f, --framework <framework>", "Framework (expo, react-native, next)")
  .option("--typescript", "Use TypeScript", true)
  .option("-y, --yes", "Skip prompts and use defaults")
  .option("--no-install", "Skip installing dependencies")
  .addHelpText(
    "after",
    `
Examples:
  $ magicappdev init my-app
  $ magicappdev init my-app --template tabs --framework expo
  $ magicappdev init my-app -y
`,
  )
  .action(async (name: string | undefined, options: InitOptions) => {
    logo();
    header("Create a new project");

    try {
      // Get project name
      let projectName = name;
      if (!projectName && !options.yes) {
        projectName = await promptProjectName();
      }
      if (!projectName) {
        projectName = "my-app";
      }

      // Get template
      let templateSlug = options.template;
      if (!templateSlug && !options.yes) {
        templateSlug = await promptSelect<string>("Choose a template:", [
          {
            title: "Blank",
            value: "blank",
            description: "Minimal starter template",
          },
          {
            title: "Tabs",
            value: "tabs",
            description: "Tab-based navigation",
          },
        ]);
      }
      if (!templateSlug) {
        templateSlug = "blank";
      }

      // Get framework
      let framework = options.framework;
      if (!framework && !options.yes) {
        framework = await promptFramework();
      }
      if (!framework) {
        framework = "expo";
      }

      // Get TypeScript preference
      let typescript = options.typescript;
      if (typescript === undefined && !options.yes) {
        typescript = await promptTypeScript();
      }
      if (typescript === undefined) {
        typescript = true;
      }

      // Get styling
      let styling: string | undefined;
      if (!options.yes) {
        styling = await promptStyling(framework);
      }
      if (!styling) {
        styling =
          framework === "expo" || framework === "react-native"
            ? "nativewind"
            : "tailwind";
      }

      // Get additional preferences
      let preferences: Record<string, boolean> = {};
      if (!options.yes) {
        preferences = (await promptPreferences()) || {};
      }

      newline();
      divider();
      info("Creating project with:");
      keyValue("Name", projectName);
      keyValue("Template", templateSlug);
      keyValue("Framework", framework);
      keyValue("TypeScript", typescript ? "Yes" : "No");
      keyValue("Styling", styling);
      keyValue("Preferences", Object.keys(preferences).join(", ") || "None");
      divider();
      newline();

      // Find template
      const template =
        builtInTemplates.find(t => t.id === templateSlug) ||
        builtInTemplates[0];

      // Generate project
      const outputDir = process.cwd();
      const projectDir = path.join(outputDir, projectName);
      const result = await withSpinner(
        `Creating ${projectName}...`,
        async () => {
          return generateApp(
            projectName!,
            template,
            outputDir,
            {
              typescript,
              styling,
              framework,
            },
            preferences,
          );
        },
        { successText: `Created ${projectName}` },
      );

      newline();
      success(`Project created successfully!`);
      info(`Files created: ${result.files.length}`);

      // Install dependencies
      const shouldInstall = options.install !== false;
      if (shouldInstall) {
        const pm = detectPackageManager();
        newline();

        const installResult = await withSpinner(
          `Installing dependencies with ${pm}...`,
          async () => runInstall(projectDir, pm),
          { successText: "Dependencies installed" },
        );

        if (!installResult.success) {
          error(
            `Failed to install dependencies: ${installResult.error || "Unknown error"}`,
          );
          info("You can install them manually:");
          command(`cd ${projectName}`);
          command(`${pm} install`);
        }
      }

      newline();
      info("Next steps:");
      command(`cd ${projectName}`);
      if (!shouldInstall || options.install === false) {
        const pm = detectPackageManager();
        command(`${pm} install`);
      }
      command(`${detectPackageManager()} start`);
      newline();
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to create project");
      process.exit(1);
    }
  });
