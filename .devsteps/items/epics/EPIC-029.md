# Epic: Node-Free MCP Distribution & VS Code Marketplace Presence

## Problem

DevSteps MCP server requires Node.js installed on the user's machine. Other MCP tools in the VS Code marketplace (e.g., `formulahendry.code-runner-mcp-server`) work without any external runtime dependency. DevSteps also does not appear in the VS Code `@mcp` gallery.

## Root Cause (Archaeology Findings)

- Extension spawns `npx`/`node` from user PATH — requires user's Node.js
- INSTALL.md claims "bundled Node.js v22.11.0" — this code does not exist
- Extension fallback references `dist/mcp-server.js` but esbuild outputs `dist/index.bundled.mjs`
- INSTALL.md describes HTTP mode (port 3737) — actual code uses stdio only
- Extension uses `mcpServerDefinitionProviders` API correctly, but server is spawned externally

## Solution Architecture (Research-Based, ≥10 sources)

**Overarching Principle:** The VS Code Extension Host IS a Node.js runtime (Electron). Running the MCP server as a module *inside* the extension host eliminates all external Node.js requirements for VS Code users.

### Track 1 — In-Process HTTP (PRIMARY, 2–3 days)
Wire `http-server.ts` into extension activation. MCP server runs as a module inside the Extension Host process. Zero external Node.js. Follows `formulahendry/code-runner-mcp-server` pattern (Jun Han, Microsoft, May 2025).

### Track 2 — MCPB Binary Bundle (3–5 days)
`bun build --compile` → prebuilt binaries for 5 platforms → MCPB package for Claude Desktop, Cursor, all other MCP hosts.

### Track 3 — Marketplace MCP Gallery (1–2 days)
Add `mcp` category tag to extension `package.json`, fix `activationEvents`, investigate MCP server registry submission.

## Key Sources
- https://code.visualstudio.com/api/extension-guides/ai/mcp (2026-02-04)
- https://dev.to/formulahendry/bundle-mcp-server-into-vs-code-extension-3lii (2025-05-01)
- https://www.kenmuse.com/blog/adding-mcp-server-to-vs-code-extension/ (2026-02-19)
- https://github.com/modelcontextprotocol/mcpb (2025-12-04)
