import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    globals: true,
    // Recharts 3 renders are heavy in jsdom (~3-4s per ChartContainer mount);
    // the dashboard composition test mounts and re-renders charts, so the 5s
    // default is too tight. 30s gives comfortable headroom.
    testTimeout: 30_000,
    include: ["test/**/*.test.ts", "test/**/*.test.tsx"],
    exclude: ["e2e/**", "node_modules/**"],
  },
});
