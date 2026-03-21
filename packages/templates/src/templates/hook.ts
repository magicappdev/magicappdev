/**
 * React hook template
 */

import type { Template } from "../types.js";

export const hookTemplate: Template = {
  id: "hook",
  name: "React Hook",
  slug: "hook",
  description: "A custom React hook for reusable stateful logic",
  category: "hook",
  frameworks: ["react-native", "expo", "next"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["hook", "react", "state", "custom"],
  variables: [
    {
      name: "name",
      description: "Hook name (will be prefixed with 'use' if not already)",
      type: "string",
      default: "MyHook",
    },
    {
      name: "typescript",
      description: "Use TypeScript",
      type: "boolean",
      default: true,
    },
    {
      name: "withTests",
      description: "Include test file",
      type: "boolean",
      default: false,
    },
  ],
  files: [
    {
      path: "use{{pascalCase name}}.ts",
      content: `import { useState, useCallback, useEffect } from "react";

export interface Use{{pascalCase name}}Options {
  initialValue?: string;
}

export interface Use{{pascalCase name}}Return {
  value: string;
  setValue: (value: string) => void;
  reset: () => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * use{{pascalCase name}} hook
 *
 * @example
 * const { value, setValue, reset, isLoading, error } = use{{pascalCase name}}();
 */
export function use{{pascalCase name}}(
  options: Use{{pascalCase name}}Options = {},
): Use{{pascalCase name}}Return {
  const { initialValue = "" } = options;

  const [value, setValueState] = useState<string>(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setValue = useCallback((newValue: string) => {
    setError(null);
    setValueState(newValue);
  }, []);

  const reset = useCallback(() => {
    setValueState(initialValue);
    setError(null);
    setIsLoading(false);
  }, [initialValue]);

  useEffect(() => {
    // Add any initialization logic here
    return () => {
      // Cleanup on unmount
    };
  }, []);

  return {
    value,
    setValue,
    reset,
    isLoading,
    error,
  };
}

export default use{{pascalCase name}};
`,
    },
  ],
};
