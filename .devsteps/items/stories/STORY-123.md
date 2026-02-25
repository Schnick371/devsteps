# Story: MCPB Binary Bundle — Track 2

## Goal

Distribute the DevSteps MCP server as a self-contained binary bundle (`.mcpb`) for any MCP host outside VS Code (Claude Desktop, Cursor, Windsurf, etc.) — without requiring Node.js, npm, or any runtime.

## Acceptance Criteria

- [ ] `bun build --compile` produces self-contained binaries for all 5 targets:
  - `devsteps-mcp-linux-x64`
  - `devsteps-mcp-linux-arm64`
  - `devsteps-mcp-darwin-arm64`
  - `devsteps-mcp-darwin-x64`
  - `devsteps-mcp-win-x64.exe`
- [ ] `manifest.json` (MCPB format) correctly describes the server, tools, and platform binaries
- [ ] `mcpb pack` produces a valid `.mcpb` archive installable in Claude Desktop
- [ ] GitHub Actions workflow builds all 5 binaries on each release tag
- [ ] Binaries attached to GitHub Releases automatically
- [ ] README documents manual install + Claude Desktop install path
- [ ] Binaries work without Node.js, npm, or any runtime on all target platforms

## Implementation Plan

### Step 1 — Verify Bun compatibility with MCP SDK
Check that `@modelcontextprotocol/sdk` and all used Node APIs work under `bun build --compile`. Run `bun test` on `packages/mcp-server`.

### Step 2 — Compile scripts
```bash
bun build --compile --target=bun-linux-x64 \
  packages/mcp-server/src/index.ts \
  --outfile dist/devsteps-mcp-linux-x64
```
Add `scripts/build-binaries.sh` for local builds.

### Step 3 — MCPB manifest
```json
{
  "name": "devsteps-mcp",
  "displayName": "DevSteps MCP Server",
  "version": "1.0.0",
  "description": "AI-assisted task tracking for VS Code, Claude, Cursor",
  "runtimes": {
    "linux-x64": { "type": "binary", "path": "dist/devsteps-mcp-linux-x64" },
    "darwin-arm64": { "type": "binary", "path": "dist/devsteps-mcp-darwin-arm64" },
    "win32-x64": { "type": "binary", "path": "dist/devsteps-mcp-win-x64.exe" }
  }
}
```

### Step 4 — GitHub Actions CI
`.github/workflows/release-binaries.yml` — matrix build on push tag, upload to release assets.

### Step 5 — Documentation
Update README and INSTALL.md with Claude Desktop / Cursor install instructions pointing to GitHub Releases.

## Reference
- https://github.com/modelcontextprotocol/mcpb (1.7k stars, Dec 2025)
- https://egghead.io/easy-mcp-server-setup-in-cursor-ide-with-bundled-executables~zrhl5
- https://github.com/promptexecution/just-mcp (5-platform prebuilt binaries pattern)
