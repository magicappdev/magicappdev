import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier/flat";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  prettier,
  globalIgnores(["dist/", "node_modules/", "coverage/"]),
]);
