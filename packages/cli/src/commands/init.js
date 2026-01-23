/**
 * Init command - Initialize a new MagicAppDev project
 */
import {
  promptProjectName,
  promptFramework,
  promptStyling,
  promptTypeScript,
  promptSelect,
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
import {
  generateApp,
  blankAppTemplate,
  tabsAppTemplate,
} from "@magicappdev/templates";
import { withSpinner } from "../lib/spinner.js";
import { Command } from "commander";
export const initCommand = new Command("init")
  .description("Initialize a new MagicAppDev project")
  .argument("[name]", "Project name")
  .option("-t, --template <template>", "Template to use (blank, tabs)")
  .option("-f, --framework <framework>", "Framework (expo, react-native, next)")
  .option("--typescript", "Use TypeScript", true)
  .option("-y, --yes", "Skip prompts and use defaults")
  .action(async (name, options) => {
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
        templateSlug = await promptSelect("Choose a template:", [
          {
            title: "Blank",
            value: "blank",
            description: "Minimal starter template",
          },
          { title: "Tabs", value: "tabs", description: "Tab-based navigation" },
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
      let styling;
      if (!options.yes) {
        styling = await promptStyling(framework);
      }
      if (!styling) {
        styling =
          framework === "expo" || framework === "react-native"
            ? "nativewind"
            : "tailwind";
      }
      newline();
      divider();
      info("Creating project with:");
      keyValue("Name", projectName);
      keyValue("Template", templateSlug);
      keyValue("Framework", framework);
      keyValue("TypeScript", typescript ? "Yes" : "No");
      keyValue("Styling", styling);
      divider();
      newline();
      // Find template
      const template =
        templateSlug === "tabs" ? tabsAppTemplate : blankAppTemplate;
      // Generate project
      const outputDir = process.cwd();
      const result = await withSpinner(
        `Creating ${projectName}...`,
        async () => {
          return generateApp(projectName, template, outputDir, {
            typescript,
            styling,
            framework,
          });
        },
        { successText: `Created ${projectName}` },
      );
      newline();
      success(`Project created successfully!`);
      info(`Files created: ${result.files.length}`);
      newline();
      info("Next steps:");
      command(`cd ${projectName}`);
      command("npm install");
      command("npm start");
      newline();
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to create project");
      process.exit(1);
    }
  });
