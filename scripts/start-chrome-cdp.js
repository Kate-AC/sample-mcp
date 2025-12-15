#!/usr/bin/env node
/**
 * リモートデバッグ付き Chrome を起動（Playwright は CDP で接続）
 *
 * 1) node scripts/start-chrome-cdp.js
 * 2) 開いた Chrome で buffett-code.com に手動ログイン
 * 3) PLAYWRIGHT_MCP_CDP_ENDPOINT=http://127.0.0.1:9222 npm run playwright:start
 */
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const PORT = process.env.PLAYWRIGHT_CDP_PORT || "9222";
const profileDir =
  process.env.PLAYWRIGHT_MCP_USER_DATA_DIR ||
  path.resolve(__dirname, "../../buffett-code/playwright/.auth/chrome-cdp-profile");

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  path.join(
    process.env.LOCALAPPDATA || "",
    "Google",
    "Chrome",
    "Application",
    "chrome.exe",
  ),
].filter(Boolean);

const chromePath = chromeCandidates.find((p) => fs.existsSync(p));
if (!chromePath) {
  console.error("Google Chrome が見つかりません。CHROME_PATH を設定してください。");
  process.exit(1);
}

fs.mkdirSync(profileDir, { recursive: true });

const args = [
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profileDir}`,
  "--no-first-run",
  "--no-default-browser-check",
  "about:blank",
];

console.log("Chrome:", chromePath);
console.log("Profile:", profileDir);
console.log(`CDP: http://127.0.0.1:${PORT}`);
console.log("\nこの Chrome で buffett-code.com にログイン後、別ターミナルで:");
console.log(
  `  PLAYWRIGHT_MCP_CDP_ENDPOINT=http://127.0.0.1:${PORT} npm run playwright:start`,
);

const child = spawn(chromePath, args, {
  detached: true,
  stdio: "ignore",
});
child.unref();
