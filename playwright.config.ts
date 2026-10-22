/// <reference types="node" />
import { defineConfig } from "@playwright/test";

const PORT = process.env["PW_PORT"] ?? "4173";

export default defineConfig({
  testDir: "tests/playwright",
  testIgnore: ["**/_temp*", "**/dist_*/**"],
  outputDir: "output/playwright",
  timeout: 30_000,
  // Keep the local Python server's connection bursts within its small backlog.
  workers: 2,
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    headless: true,
  },
  webServer: {
    command: `python3 -m http.server ${PORT} --directory dist`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
