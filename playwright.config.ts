import { defineConfig } from "@playwright/test";
const baseURL = process.env.AI_TEST_URL || "http://127.0.0.1:4173";
export default defineConfig({
  testDir: "tests/ai-ble",
  testMatch: "*.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: { baseURL, headless: true, viewport: { width: 1440, height: 1000 } },
  webServer: process.env.AI_TEST_URL
    ? undefined
    : {
        command:
          "node node_modules/vite/bin/vite.js --config vite.github.config.ts --host 127.0.0.1 --port 4173",
        url: baseURL,
        reuseExistingServer: true,
      },
  reporter: "list",
});
