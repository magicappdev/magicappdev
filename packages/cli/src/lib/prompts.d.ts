/**
 * Interactive prompts for user input
 */
/** Prompt for text input */
export declare function promptText(
  message: string,
  options?: {
    initial?: string;
    validate?: (value: string) => boolean | string;
  },
): Promise<string | undefined>;
/** Prompt for selection from a list */
export declare function promptSelect<T>(
  message: string,
  choices: Array<{
    title: string;
    value: T;
    description?: string;
  }>,
  options?: {
    initial?: number;
  },
): Promise<T | undefined>;
/** Prompt for multi-selection from a list */
export declare function promptMultiSelect<T>(
  message: string,
  choices: Array<{
    title: string;
    value: T;
    description?: string;
  }>,
  options?: {
    min?: number;
    max?: number;
  },
): Promise<T[]>;
/** Prompt for confirmation (yes/no) */
export declare function promptConfirm(
  message: string,
  options?: {
    initial?: boolean;
  },
): Promise<boolean>;
/** Prompt for project name with validation */
export declare function promptProjectName(
  initial?: string,
): Promise<string | undefined>;
/** Prompt for framework selection */
export declare function promptFramework(): Promise<string | undefined>;
/** Prompt for additional preferences */
export declare function promptPreferences(): Promise<Record<string, boolean>>;
/** Prompt for styling selection */
export declare function promptStyling(
  framework: string,
): Promise<string | undefined>;
/** Prompt for TypeScript */
export declare function promptTypeScript(): Promise<boolean>;
//# sourceMappingURL=prompts.d.ts.map
