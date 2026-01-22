/**
 * Spinner utility for long-running operations
 */
import ora from "ora";
/** Spinner instance type */
export type Spinner = ReturnType<typeof ora>;
/** Create a spinner with default styling */
export declare function createSpinner(text?: string): Spinner;
/** Run an async task with a spinner */
export declare function withSpinner<T>(
  text: string,
  task: () => Promise<T>,
  options?: {
    successText?: string;
    failText?: string;
  },
): Promise<T>;
//# sourceMappingURL=spinner.d.ts.map
