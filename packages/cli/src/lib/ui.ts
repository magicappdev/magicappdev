/**
 * CLI UI utilities using Chalk
 */

import chalk from "chalk";

/** Print a header */
export function header(text: string): void {
  console.log();
  console.log(chalk.bold.cyan("╭─────────────────────────────────────────╮"));
  console.log(chalk.bold.cyan("│") + chalk.bold.white(` ${text.padEnd(39)} `) + chalk.bold.cyan("│"));
  console.log(chalk.bold.cyan("╰─────────────────────────────────────────╯"));
  console.log();
}

/** Print the app logo */
export function logo(): void {
  console.log(chalk.bold.magenta(`
  ╔╦╗╔═╗╔═╗╦╔═╗  ╔═╗╔═╗╔═╗╔╦╗╔═╗╦  ╦
  ║║║╠═╣║ ╦║║    ╠═╣╠═╝╠═╝ ║║║╣ ╚╗╔╝
  ╩ ╩╩ ╩╚═╝╩╚═╝  ╩ ╩╩  ╩  ═╩╝╚═╝ ╚╝
  `));
}

/** Print a success message */
export function success(text: string): void {
  console.log(chalk.green("✓") + " " + text);
}

/** Print an error message */
export function error(text: string): void {
  console.log(chalk.red("✗") + " " + text);
}

/** Print a warning message */
export function warn(text: string): void {
  console.log(chalk.yellow("⚠") + " " + text);
}

/** Print an info message */
export function info(text: string): void {
  console.log(chalk.blue("ℹ") + " " + text);
}

/** Print a step message */
export function step(number: number, text: string): void {
  console.log(chalk.dim(`[${number}]`) + " " + text);
}

/** Print a key-value pair */
export function keyValue(key: string, value: string): void {
  console.log(chalk.dim(key + ":") + " " + chalk.white(value));
}

/** Print a list item */
export function listItem(text: string, indent = 2): void {
  console.log(" ".repeat(indent) + chalk.dim("•") + " " + text);
}

/** Print a code block */
export function code(text: string): void {
  console.log(chalk.gray.inverse(` ${text} `));
}

/** Print a command suggestion */
export function command(text: string): void {
  console.log(chalk.cyan("$") + " " + chalk.bold(text));
}

/** Print a divider */
export function divider(): void {
  console.log(chalk.dim("─".repeat(45)));
}

/** Print a newline */
export function newline(): void {
  console.log();
}

/** Color function type */
type ColorFn = (text: string | number) => string;

/** Colors for exports */
export const colors: Record<string, ColorFn> = {
  primary: chalk.cyan,
  secondary: chalk.magenta,
  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
  muted: chalk.dim,
  bold: chalk.bold,
  white: chalk.white,
};
