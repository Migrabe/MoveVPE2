import { defineConfig, devices } from "@playwright/test";

const CI = Boolean(process.env.CI);
const isWindows = process.platform === "win32";

function toWslPath(pathname) {
  const normalized = pathname.replace(/\\/g, "/");
  const driveMatch = normalized.match(/^([A-Za-z]):\/(.*)$/);
  if (!driveMatch) return normalized;
  const [, drive, rest] = driveMatch;
  return `/mnt/${drive.toLowerCase()}/${rest}`;
}

const localServerCommand = isWindows
  ? `wsl -e bash -lc "cd '${toWslPath(process.cwd())}' && npm start"`
  : "npm start";

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  reporter: CI ? [["html", { open: "never" }], ["list"]] : [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] }
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] }
    }
  ],
  webServer: {
    command: localServerCommand,
    url: "http://localhost:3000/health",
    reuseExistingServer: !CI,
    timeout: 60_000
  }
});
