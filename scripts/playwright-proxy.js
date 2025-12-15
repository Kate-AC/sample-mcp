#!/usr/bin/env node
/**
 * Playwright MCP Proxy Daemon
 *
 * @playwright/mcp を子プロセス（stdio transport）として起動し、
 * HTTP プロキシサーバーとして CLI からのリクエストを中継する。
 *
 * stdio transport はセッションタイムアウトがなく、
 * プロセスが生きている限りブラウザ状態が維持される。
 *
 * Usage:
 *   node scripts/playwright-proxy.js
 *   # or: npm run playwright:start
 *
 * CLI からのアクセス:
 *   POST http://localhost:8931/call
 *   Body: { "tool": "browser_navigate", "args": { "url": "..." } }
 */
const http = require("http");
const path = require("path");
const mcpBundle = require("playwright-core/lib/mcpBundle");

const PORT = process.env.PLAYWRIGHT_MCP_PORT || 8931;
const BIN = path.resolve(__dirname, "..", "node_modules", ".bin", "playwright-mcp");

let client = null;

async function getClient() {
  if (client) return client;

  console.log("Starting @playwright/mcp subprocess (stdio)...");
  const transport = new mcpBundle.StdioClientTransport({
    command: "node",
    args: [BIN],
  });

  client = new mcpBundle.Client(
    { name: "playwright-proxy", version: "1.0.0" },
    {},
  );
  await client.connect(transport);
  console.log("MCP client connected via stdio");
  return client;
}

// --- HTTP Proxy Server ---

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method === "GET" && req.url === "/health") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ status: "ok", connected: !!client }));
  }

  if (req.method !== "POST" || req.url !== "/call") {
    res.statusCode = 404;
    return res.end("Not found. Use POST /call");
  }

  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", async () => {
    try {
      const { tool, args } = JSON.parse(body);
      if (!tool) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        return res.end(JSON.stringify({ error: "Missing 'tool' field" }));
      }

      const c = await getClient();
      const result = await c.callTool({
        name: tool,
        arguments: args || {},
      });

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ result }));
    } catch (err) {
      console.error("Error:", err.message);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

server.listen(PORT, async () => {
  try {
    await getClient();
    console.log(`Playwright MCP Proxy listening on http://localhost:${PORT}`);
    console.log("POST /call { tool, args } to invoke tools");
    console.log("GET /health to check status");
  } catch (err) {
    console.error("Failed to start MCP client:", err.message);
    process.exit(1);
  }
});

process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  if (client) await client.close().catch(() => {});
  process.exit(0);
});

process.on("SIGTERM", async () => {
  if (client) await client.close().catch(() => {});
  process.exit(0);
});
