import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@georynth/domain": path.resolve(__dirname, "./packages/domain/src/index.ts"),
    },
  },
});
