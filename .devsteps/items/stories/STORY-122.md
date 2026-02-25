# Story: In-Process HTTP MCP Server — Track 1

## Goal

Run the DevSteps MCP server as a module **inside** the VS Code Extension Host process. The Extension Host is a Node.js (Electron) runtime — no external Node.js installation required.

## Acceptance Criteria

- [ ] Extension activates MCP server at startup (no user action needed)
- [ ] MCP server runs on a dynamic localhost port inside the extension process
- [ ] Port conflict handled gracefully (auto-increment or OS-assigned)
- [ ] MCP server registered via `McpHttpServerDefinition` pointing to `http://localhost:{port}/mcp`
- [ ] VS Code Copilot agent-mode shows DevSteps tools without any user configuration
- [ ] DevSteps tools work in Copilot without Node.js in user PATH
- [ ] Extension deactivation cleanly shuts down the HTTP server
- [ ] Fallback `npx`/`node` spawn path retained for non-VS-Code MCP hosts

## Implementation Plan

### Step 1 — Make `http-server.ts` importable as a module
`packages/mcp-server/src/http-server.ts` must export a `startDevStepsMcpHttp(port: number, workspacePath: string): Promise<{ port: number; stop: () => void }>` function.

### Step 2 — Bundle MCP server into extension VSIX
`packages/extension/esbuild.js` must include `@schnick371/devsteps-mcp-server` in the bundle (not as external). The extension already has `mcp-server.js` in its dist fallback path — align this with the actual output.

### Step 3 — Refactor `McpServerManager` 
Replace spawn-based strategy with:
```typescript
// Priority 1: In-process HTTP (always available in VS Code)
const { port, stop } = await startDevStepsMcpHttp(0, workspaceDir);
registerMcpServerDefinitionProvider('devsteps-mcp', McpHttpServerDefinition, port);
```

### Step 4 — Fix `activationEvents`
Ensure `"onStartupFinished"` is in `package.json` `activationEvents` so the MCP server registers automatically at VS Code startup.

### Step 5 — Fix filename mismatch
Extension fallback currently references `dist/mcp-server.js` but esbuild produces `dist/index.bundled.mjs`. Align names.

## Reference Implementation
`formulahendry/vscode-code-runner-mcp-server` (May 2025) — 4 MB VSIX, HTTP in-process, zero external Node.js.
Pattern from: https://dev.to/formulahendry/bundle-mcp-server-into-vs-code-extension-3lii

## Out of Scope
- MCPB binary bundle (Track 2, separate story)
- INSTALL.md rewrite (separate task)
