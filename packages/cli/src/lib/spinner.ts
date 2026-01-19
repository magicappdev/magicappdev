/**
 * Spinner utility for long-running operations
 */

import ora from "ora";

/** Spinner instance type */
export type Spinner = ReturnType<typeof ora>;

/** Create a spinner with default styling */
export function createSpinner(text?: string): Spinner {
  return ora({
    text,
    color: "cyan",
    spinner: "dots",
  });
}

/** Run an async task with a spinner */
export async function withSpinner<T>(
  text: string,
  task: () => Promise<T>,
  options: {
    successText?: string;
    failText?: string;
  } = {},
): Promise<T> {
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
