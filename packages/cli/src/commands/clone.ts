/**
 * Clone command - Clone a project from the database to local filesystem
 */

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
import { api } from "../lib/api.js";
import { withSpinner } from "../lib/spinner.js";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { Command } from "commander";

interface CloneOptions {
  output?: string;
  list?: boolean;
  install?: boolean;
}

/** Ensure directory exists, create if not */
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/** Write file to filesystem */
function writeFile(filePath: string, content: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf-8");
}

/** Install dependencies for the project */
async function installDependencies(projectDir: string): Promise<{ success: boolean; error?: string }> {
  return new Promise(resolve => {
    // Detect package manager
    let pm = "npm";
    if (fs.existsSync(path.join(projectDir, "pnpm-lock.yaml"))) {
      pm = "pnpm";
    } else if (fs.existsSync(path.join(projectDir, "yarn.lock"))) {
      pm = "yarn";
    } else if (fs.existsSync(path.join(projectDir, "bun.lockb"))) {
      pm = "bun";
    }

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

export const cloneCommand = new Command("clone")
  .description("Clone a project from the database to local filesystem")
  .argument("[project-id]", "Project ID to clone")
  .option("-o, --output <dir>", "Output directory")
  .option("--list", "List available projects")
  .option("--no-install", "Skip installing dependencies")
  .addHelpText(
    "after",
    `
Examples:
  $ magicappdev clone --list
  $ magicappdev clone abc-123-def
  $ magicappdev clone abc-123-def -o my-app
`,
  )
  .action(async (projectId: string | undefined, options: CloneOptions) => {
    logo();
    header("Clone Project");

    try {
      // List projects mode
      if (options.list) {
        divider();
        info("Fetching available projects...");

        const projects = await withSpinner(
          "Loading projects...",
          async () => {
            return await api.listExportableProjects();
          },
          { successText: "Projects loaded" },
        );

        newline();
        if (projects.length === 0) {
          info("No projects available to clone.");
          return;
        }

        info(`Found ${projects.length} project(s):`);
        newline();

        for (const p of projects) {
          divider();
          keyValue("Name", p.name);
          keyValue("ID", p.id);
          keyValue("Framework", p.framework);
          keyValue("Files", String(p.fileCount));
          keyValue("Status", p.status);
          keyValue("Updated", new Date(p.updatedAt).toLocaleDateString());
        }

        newline();
        info("To clone a project, run:");
        command(`magicappdev clone <project-id>`);
        newline();
        return;
      }

      // Validate project ID
      if (!projectId) {
        error("Project ID is required. Use --list to see available projects.");
        newline();
        info("Usage:");
        command("magicappdev clone <project-id>");
        command("magicappdev clone --list");
        newline();
        process.exit(1);
      }

      divider();
      info(`Cloning project: ${projectId}`);
      newline();

      // Export project from database
      const exportData = await withSpinner(
        "Exporting project from database...",
        async () => {
          return await api.exportProject(projectId);
        },
        { successText: "Project exported" },
      );

      newline();
      info("Project details:");
      keyValue("Name", exportData.project.name);
      keyValue("Framework", exportData.project.framework);
      keyValue("Files", String(exportData.metadata.fileCount));
      keyValue("Size", `${(exportData.metadata.totalSize / 1024).toFixed(1)} KB`);
      divider();
      newline();

      // Determine output directory
      const outputDir = options.output || exportData.project.name;
      const projectPath = path.resolve(process.cwd(), outputDir);

      // Check if directory exists
      if (fs.existsSync(projectPath)) {
        error(`Directory already exists: ${outputDir}`);
        newline();
        info("Please choose a different output directory or remove the existing one.");
        command(`rm -rf "${outputDir}"`);
        process.exit(1);
      }

      // Create project directory
      await withSpinner(
        "Creating project directory...",
        async () => {
          ensureDir(projectPath);
          await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
        },
        { successText: "Directory created" },
      );

      newline();

      // Write files
      const writeFiles = async () => {
        for (const file of exportData.files) {
          const filePath = path.join(projectPath, file.path);
          writeFile(filePath, file.content);
        }
      };

      await withSpinner(
        `Writing ${exportData.metadata.fileCount} files...`,
        writeFiles,
        { successText: `${exportData.metadata.fileCount} files written` },
      );

      newline();
      success(`Project cloned successfully to: ${outputDir}`);
      newline();

      // Write export metadata
      const metadataPath = path.join(projectPath, ".magicappdev.json");
      writeFile(metadataPath, JSON.stringify({
        version: exportData.version,
        exportedAt: exportData.exportedAt,
        project: exportData.project,
        metadata: exportData.metadata,
      }, null, 2));

      // Install dependencies if requested
      const shouldInstall = options.install !== false;
      if (shouldInstall) {
        // Check if package.json exists
        const packageJsonPath = path.join(projectPath, "package.json");
        if (fs.existsSync(packageJsonPath)) {
          newline();

          const installResult = await withSpinner(
            "Installing dependencies...",
            async () => installDependencies(projectPath),
            { successText: "Dependencies installed" },
          );

          if (!installResult.success) {
            newline();
            error(`Failed to install dependencies: ${installResult.error || "Unknown error"}`);
            info("You can install them manually:");
            command(`cd ${outputDir}`);
            command("npm install"); // or pnpm install, yarn install, etc.
          }
        }
      }

      newline();
      info("Next steps:");
      command(`cd ${outputDir}`);

      // Suggest start command based on framework
      if (exportData.project.framework === "expo" || exportData.project.framework === "react-native") {
        command("npm start # or expo start");
      } else if (exportData.project.framework === "next") {
        command("npm run dev");
      } else {
        command("npm start");
      }

      newline();
      success("Happy coding!");
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to clone project");
      newline();
      info("Troubleshooting:");
      command("magicappdev clone --list  # Check available projects");
      command("magicappdev auth login      # Verify authentication");
      newline();
      process.exit(1);
    }
  });
