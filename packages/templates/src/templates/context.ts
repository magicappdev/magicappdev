/**
 * React Context template
 */

import type { Template } from "../types.js";

export const contextTemplate: Template = {
  id: "context",
  name: "React Context",
  slug: "context",
  description: "A React context with provider and custom hook for state sharing",
  category: "context",
  frameworks: ["react-native", "expo", "next"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["context", "react", "state-management", "provider"],
  variables: [
    {
      name: "name",
      description: "Context name (e.g. Auth, Theme, Settings)",
      type: "string",
      default: "App",
    },
    {
      name: "typescript",
      description: "Use TypeScript",
      type: "boolean",
      default: true,
    },
  ],
  files: [
    {
      path: "{{pascalCase name}}Context.tsx",
      content: `import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export interface {{pascalCase name}}State {
  // Define your state shape here
  isLoading: boolean;
  error: string | null;
}

export interface {{pascalCase name}}ContextValue extends {{pascalCase name}}State {
  // Define context actions here
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const defaultState: {{pascalCase name}}State = {
  isLoading: false,
  error: null,
};

const {{pascalCase name}}Context = createContext<{{pascalCase name}}ContextValue | undefined>(
  undefined,
);

export interface {{pascalCase name}}ProviderProps {
  children: ReactNode;
  initialState?: Partial<{{pascalCase name}}State>;
}

export function {{pascalCase name}}Provider({
  children,
  initialState,
}: {{pascalCase name}}ProviderProps) {
  const [state, setState] = useState<{{pascalCase name}}State>({
    ...defaultState,
    ...initialState,
  });

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const reset = useCallback(() => {
    setState({ ...defaultState, ...initialState });
  }, [initialState]);

  const value: {{pascalCase name}}ContextValue = {
    ...state,
    setLoading,
    setError,
    reset,
  };

  return (
    <{{pascalCase name}}Context.Provider value={value}>
      {children}
    </{{pascalCase name}}Context.Provider>
  );
}

/** Use {{pascalCase name}} context - throws if used outside of {{pascalCase name}}Provider */
export function use{{pascalCase name}}(): {{pascalCase name}}ContextValue {
  const context = useContext({{pascalCase name}}Context);
  if (!context) {
    throw new Error(
      "use{{pascalCase name}} must be used within a {{pascalCase name}}Provider",
    );
  }
  return context;
}

export default {{pascalCase name}}Context;
`,
    },
  ],
};
