/**
 * MagicAppDev CLI
 */

import { generateCommand } from "./commands/generate/index.js";
import { completionsCommand } from "./commands/completions.js";
import { templatesCommand } from "./commands/templates.js";
import { doctorCommand } from "./commands/doctor.js";
import { cloneCommand } from "./commands/clone.js";
import { initCommand } from "./commands/init.js";
import { chatCommand } from "./commands/chat.js";
import { authCommand } from "./commands/auth.js";
import { mcpCommand } from "./commands/mcp.js";
import { createRequire } from "module";
import { Command } from "commander";
const require = createRequire(import.meta.url);
const pkg = require("../package.json");

/** Package version */
const VERSION = pkg.version;

/** Compare semver versions: returns 1 if a > b, -1 if a < b, 0 if equal */
function compareVersions(a: string, b: string): number {
  const partsA = a.split(".").map(Number);
  const partsB = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (partsA[i] > partsB[i]) return 1;
    if (partsA[i] < partsB[i]) return -1;
  }
  return 0;
}

/** Check for updates by fetching npm registry (non-blocking) */
async function checkForUpdates(): Promise<void> {
  try {
    const response = await fetch(
      `https://registry.npmjs.org/${pkg.name}/latest`,
      { signal: AbortSignal.timeout(3000) },
    );
    if (response.ok) {
      const data = (await response.json()) as { version?: string };
      const latestVersion = data.version;
      // Only show update message if npm version is newer than local
      if (latestVersion && compareVersions(latestVersion, pkg.version) > 0) {
        console.log(
          `\n\x1b[33mUpdate available:\x1b[0m ${pkg.version} → ${latestVersion}`,
        );
        console.log(
          `Run \x1b[36mnpm install -g ${pkg.name}\x1b[0m to update\n`,
        );
      }
    }
  } catch {
    // Silently ignore update check errors (network issues, timeouts, etc.)
  }
}

/** Create the CLI program */
export function createProgram(): Command {
  const program = new Command();

  program
    .name("magicappdev")
    .description("CLI for creating and managing MagicAppDev apps")
    .version(VERSION, "-V, --version", "Display version number")
    .option("-d, --debug", "Enable debug mode for verbose logging")
    .option("--no-update-check", "Skip checking for updates")
    .addHelpText(
      "after",
      `
Quick start:
  $ magicappdev init my-app                # Create a new Expo project
  $ magicappdev init my-app -t tabs        # Use the tabs navigation template
  $ magicappdev init my-app -f next        # Create a Next.js project
  $ magicappdev init my-app -y             # Skip prompts, use defaults

Generate code:
  $ magicappdev generate component Button  # Generate a React component
  $ magicappdev generate screen Home       # Generate a screen with SafeAreaView

Manage projects:
  $ magicappdev clone --list               # List cloud-saved projects
  $ magicappdev clone abc-123              # Clone a project from the cloud
  $ magicappdev doctor                     # Check your environment

Templates:
  $ magicappdev templates list             # Browse available templates
  $ magicappdev templates download blank   # Cache a template locally

AI & Configuration:
  $ magicappdev auth login                 # Authenticate with MagicAppDev
  $ magicappdev chat                       # Start an AI chat session
  $ magicappdev mcp list                   # List MCP server connections
`,
    )
    .hook("preAction", thisCommand => {
      const opts = thisCommand.opts();
      if (opts.debug) {
        process.env.DEBUG = "true";
        console.log(`[DEBUG] MagicAppDev CLI v${VERSION}`);
        console.log(`[DEBUG] Node.js ${process.version}`);
        console.log(`[DEBUG] Platform: ${process.platform} ${process.arch}`);
      }
    });

  // Add commands
  program.addCommand(initCommand);
  program.addCommand(authCommand);
  program.addCommand(chatCommand);
  program.addCommand(cloneCommand);
  program.addCommand(generateCommand);
  program.addCommand(doctorCommand);
  program.addCommand(completionsCommand);
  program.addCommand(mcpCommand);
  program.addCommand(templatesCommand);

  return program;
}

/** Run the CLI */
export async function run(argv?: string[]): Promise<void> {
  // Handle Ctrl+C gracefully
  process.on("SIGINT", () => {
    console.log("\n\x1b[2mInterrupted.\x1b[0m");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    process.exit(0);
  });

  const args = argv || process.argv;
  const noUpdateCheck = args.includes("--no-update-check");

  // Check for updates (non-blocking)
  if (!noUpdateCheck) {
    checkForUpdates();
  }

  const program = createProgram();
  await program.parseAsync(args);
}

// Run if executed directly
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"))) {
  run().catch(console.error);
}
