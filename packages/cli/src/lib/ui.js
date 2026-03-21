/**
 * CLI UI utilities using Chalk
 */
import chalk from "chalk";
/** Print a header */
export function header(text) {
    console.log();
    console.log(chalk.bold.cyan("╭─────────────────────────────────────────╮"));
    console.log(chalk.bold.cyan("│") +
        chalk.bold.white(` ${text.padEnd(39)} `) +
        chalk.bold.cyan("│"));
    console.log(chalk.bold.cyan("╰─────────────────────────────────────────╯"));
    console.log();
}
/** Print the app logo */
export function logo() {
    console.log(chalk.bold.magenta(`
  ╔╦╗╔═╗╔═╗╦╔═╗  ╔═╗╔═╗╔═╗╔╦╗╔═╗╦  ╦
  ║║║╠═╣║ ╦║║    ╠═╣╠═╝╠═╝ ║║║╣ ╚╗╔╝
  ╩ ╩╩ ╩╚═╝╩╚═╝  ╩ ╩╩  ╩  ═╩╝╚═╝ ╚╝
  `));
}
/** Print a success message */
export function success(text) {
    console.log(chalk.green("✓") + " " + text);
}
/** Print an error message */
export function error(text) {
    console.log(chalk.red("✗") + " " + text);
}
/** Print a warning message */
export function warn(text) {
    console.log(chalk.yellow("⚠") + " " + text);
}
/** Print an info message */
export function info(text) {
    console.log(chalk.blue("ℹ") + " " + text);
}
/** Print a step message */
export function step(number, text) {
    console.log(chalk.dim(`[${number}]`) + " " + text);
}
/** Print a key-value pair */
export function keyValue(key, value) {
    console.log(chalk.dim(key + ":") + " " + chalk.white(value));
}
/** Print a list item */
export function listItem(text, indent = 2) {
    console.log(" ".repeat(indent) + chalk.dim("•") + " " + text);
}
/** Print a code block */
export function code(text) {
    console.log(chalk.gray.inverse(` ${text} `));
}
/** Print a command suggestion */
export function command(text) {
    console.log(chalk.cyan("$") + " " + chalk.bold(text));
}
/** Print a divider */
export function divider() {
    console.log(chalk.dim("─".repeat(45)));
}
/** Print a newline */
export function newline() {
    console.log();
}
/** Colors for exports */
export const colors = {
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
