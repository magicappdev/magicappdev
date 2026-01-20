import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import tseslint from "typescript-eslint";
import css from "@eslint/css";

const eslintConfig = defineConfig([
  tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["**/*.test.ts", "**/*.test.tsx", "*.d.ts", ".next/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"],
    ignores: ["**/build/**/*", "**/node_modules/**/*", "app/tailwind.css"],
    rules: {
      "css/no-invalid-at-rules": "off",
      "css/no-invalid-properties": "off",
    },
  },
  prettier,
  globalIgnores([
    "node_modules/",
    "build/",
    "dist/",
    ".next/",
    "out/",
    "coverage/",
    "!*.d.ts",
  ]),
]);

export default eslintConfig;
