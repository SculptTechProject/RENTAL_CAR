import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Resolve the "@/*" path alias (mirrors tsconfig.json) so tests import
  // domain code exactly like the app does — without any extra plugin.
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globals: false,
  },
});
