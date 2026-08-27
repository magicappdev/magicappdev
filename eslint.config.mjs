import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default [
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  prettier,
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.expo/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/.wrangler/**",
      "**/coverage/**",
      "**/metro.config.js",
      ".agent/**",
      ".agents/**",
      ".kilo/**",
      ".kilocode/**",
      ".claude/**",
      ".gemini/**",
      "agents/**",
      "docs/skills/**",
    ],
  },
];
