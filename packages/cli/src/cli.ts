/**
 * MagicAppDev CLI
 */

import pkg from "../package.json" assert { type: "json" };
import { generateCommand } from "./commands/generate";
import { doctorCommand } from "./commands/doctor";
import { initCommand } from "./commands/init";
import { Command } from "commander";
/** Package version */
const VERSION = pkg.version;

/** Create the CLI program */
export function createProgram(): Command {
  const program = new Command();

  program
    .name("magicappdev")
    .description("CLI for creating and managing MagicAppDev apps")
    .version(VERSION, "-v, --version", "Display version number");

  // Add commands
  program.addCommand(initCommand);
  program.addCommand(generateCommand);
  program.addCommand(doctorCommand);

  return program;
}

/** Run the CLI */
export async function run(argv?: string[]): Promise<void> {
  const program = createProgram();
  await program.parseAsync(argv || process.argv);
}

// Run if executed directly
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"))) {
  run().catch(console.error);
}
