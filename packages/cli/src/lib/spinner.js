/**
 * Spinner utility for long-running operations
 */
import ora from "ora";
/** Create a spinner with default styling */
export function createSpinner(text) {
  return ora({
    text,
    color: "cyan",
    spinner: "dots",
  });
}
/** Run an async task with a spinner */
export async function withSpinner(text, task, options = {}) {
  const spinner = createSpinner(text).start();
  try {
    const result = await task();
    spinner.succeed(options.successText || text);
    return result;
  } catch (error) {
    spinner.fail(options.failText || `Failed: ${text}`);
    throw error;
  }
}
