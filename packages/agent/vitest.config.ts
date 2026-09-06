import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // `tsc -b` (typecheck) emits compiled tests into dist/; never run those
    // stale duplicates — only the sources under src/.
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
});
