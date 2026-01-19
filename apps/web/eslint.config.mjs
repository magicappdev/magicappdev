import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import nextPlugin from "@next/eslint-plugin-next";
import nextConfig from "eslint-config-next";
import tseslint from "typescript-eslint";
import css from "@eslint/css";

const eslintConfig = defineConfig(...nextConfig, [
  tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["**/*.test.ts", "**/*.test.tsx", "*.d.ts", ".next/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      ...nextPlugin.configs.recommended.rules,
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
