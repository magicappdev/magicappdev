/**
 * MagicAppDev CLI
 */
import { generateCommand } from "./commands/generate/index.js";
import { completionsCommand } from "./commands/completions.js";
import { doctorCommand } from "./commands/doctor.js";
import { initCommand } from "./commands/init.js";
import { chatCommand } from "./commands/chat.js";
import { authCommand } from "./commands/auth.js";
import { createRequire } from "module";
import { Command } from "commander";
const require = createRequire(import.meta.url);
const pkg = require("../package.json");
/** Package version */
const VERSION = pkg.version;
/** TEST - Test if build picks up changes */
/** Create the CLI program */
export function createProgram() {
  const program = new Command();
  program
    .name("magicappdev")
    .description("CLI for creating and managing MagicAppDev apps")
    .version(VERSION, "-v, --version", "Display version number");
  // Add commands
  program.addCommand(initCommand);
  program.addCommand(authCommand);
  program.addCommand(chatCommand);
  program.addCommand(generateCommand);
  program.addCommand(doctorCommand);
  program.addCommand(completionsCommand);
  return program;
}
/** Run the CLI */
export async function run(argv) {
  const program = createProgram();
  await program.parseAsync(argv || process.argv);
}
// Run if executed directly
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"))) {
  run().catch(console.error);
}
