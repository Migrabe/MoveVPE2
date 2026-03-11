import { spawn } from "node:child_process";

const [, , suite = "full", ...args] = process.argv;

const forwarded = [];
let port = "";
let reuse = false;

for (const arg of args) {
  if (arg.startsWith("--port=")) {
    port = arg.slice("--port=".length);
    continue;
  }
  if (arg === "--reuse") {
    reuse = true;
    continue;
  }
  forwarded.push(arg);
}

const cliArgs = ["./node_modules/@playwright/test/cli.js", "test"];
if (suite === "smoke") {
  cliArgs.push("e2e/smoke.spec.js");
}
cliArgs.push(...forwarded);

const env = { ...process.env };
if (port) env.PLAYWRIGHT_PORT = port;
if (reuse) env.PLAYWRIGHT_REUSE_SERVER = "1";

const child = spawn(process.execPath, cliArgs, {
  stdio: "inherit",
  env
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});