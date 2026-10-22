/// <reference types="node" />
import { defineConfig } from "@playwright/test";

const PORT = process.env["PW_PORT"] ?? "4173";
if (!/^\d+$/.test(PORT) || Number(PORT) < 1 || Number(PORT) > 65535) {
  throw new Error("PW_PORT must be an integer from 1 to 65535");
}

const SERVER_SCRIPT = [
  "from functools import partial",
  "from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer",
  // Browsers request all required art together across both workers.
  "ThreadingHTTPServer.request_queue_size = 128",
  `ThreadingHTTPServer(("127.0.0.1", ${Number(PORT)}), partial(SimpleHTTPRequestHandler, directory="dist")).serve_forever()`,
].join("; ");

export default defineConfig({
  testDir: "tests/playwright",
  testIgnore: ["**/_temp*", "**/dist_*/**"],
  outputDir: "output/playwright",
  timeout: 30_000,
  workers: 2,
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    headless: true,
  },
  webServer: {
    command: `python3 -c '${SERVER_SCRIPT}'`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
